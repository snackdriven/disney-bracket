import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { auth, db } from '../lib/firebase.js';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ref, onValue, runTransaction } from 'firebase/database';
import { isNotes } from '../lib/utils.js';
import type { Notes } from '../types.js';

export interface CloudSave { state: object; notes: Notes }
export interface SyncConflict { local: CloudSave; cloud: CloudSave }

interface SyncProps {
  serialized: object;
  notes: Notes;
  onPull: (state: unknown, notes: unknown) => void;
  enabled?: boolean;
}

/** Compare the RTDB representation: empty children disappear and object ordering is immaterial. */
function fingerprint(value: unknown): string {
  const normalize = (entry: unknown): unknown => {
    if (entry === null || entry === undefined) return undefined;
    if (Array.isArray(entry)) return entry.length ? entry.map(normalize) : undefined;
    if (typeof entry !== 'object') return entry;
    const fields = Object.entries(entry).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => [key, normalize(child)] as const).filter(([, child]) => child !== undefined);
    return fields.length ? Object.fromEntries(fields) : undefined;
  };
  return JSON.stringify(normalize(value)) ?? 'null';
}

function cloudSave(value: unknown): CloudSave | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (!data.state || typeof data.state !== 'object' || Array.isArray(data.state)) return null;
  // Numeric movie-seed keys can be materialized by RTDB as a sparse array.
  const notes = Array.isArray(data.notes)
    ? Object.fromEntries(Object.entries(data.notes).filter(([, note]) => note !== null && note !== undefined))
    : data.notes ?? {};
  // Realtime Database removes empty objects, so absent notes means no notes.
  if (!isNotes(notes)) return null;
  return { state: data.state, notes };
}

function readConfirmed(uid: string): CloudSave | null {
  try { return cloudSave(JSON.parse(localStorage.getItem(`dbk-confirmed-save:${uid}`) ?? 'null')); }
  catch { return null; }
}

function readOwner(): string | null {
  try { return localStorage.getItem('dbk-local-owner'); } catch { return null; }
}

function readRecovery(uid: string): SyncConflict | null {
  try {
    const data = JSON.parse(localStorage.getItem(`dbk-sync-recovery:${uid}`) ?? 'null') as Record<string, unknown> | null;
    const local = cloudSave(data?.local);
    const cloud = cloudSave(data?.cloud);
    return local && cloud ? { local, cloud } : null;
  } catch { return null; }
}

function pristine(save: CloudSave): boolean {
  const state = save.state as { history?: unknown[]; champion?: unknown };
  return Array.isArray(state.history) && state.history.length === 0 && !state.champion && Object.keys(save.notes).length === 0;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Cloud save failed. Please retry.';
}

export function useFirebaseSync({ serialized, notes, onPull, enabled = true }: SyncProps) {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncReady, setSyncReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('loading');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncConflict, setSyncConflict] = useState<SyncConflict | null>(null);
  const [syncRecovery, setSyncRecovery] = useState<SyncConflict | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const latest = useRef({ save: { state: serialized, notes }, onPull, enabled });
  const session = useRef({ uid: null as string | null, generation: 0, ready: false,
    base: null as CloudSave | null, pending: null as CloudSave | null, conflict: null as SyncConflict | null });
  const localOwner = useRef(readOwner());
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => { latest.current = { save: { state: serialized, notes }, onPull, enabled }; });

  const confirm = useCallback((uid: string, save: CloudSave) => {
    session.current.base = save;
    localOwner.current = uid;
    // Browser storage failure must not turn a successful server write into a failed one.
    try {
      localStorage.setItem(`dbk-confirmed-save:${uid}`, JSON.stringify(save));
      localStorage.setItem('dbk-local-owner', uid);
    } catch { /* The in-memory confirmed base remains usable for this session. */ }
  }, []);

  const showConflict = useCallback((cloud: CloudSave) => {
    const conflict = { local: latest.current.save, cloud };
    session.current.conflict = conflict;
    session.current.ready = false;
    setSyncConflict(conflict);
    setSyncReady(false);
    setSyncStatus('conflict');
    setSyncError(null);
  }, []);

  useEffect(() => {
    const currentSession = session.current;
    let unsubscribeDB = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      unsubscribeDB();
      if (syncTimer.current) clearTimeout(syncTimer.current);
      const generation = ++session.current.generation;
      session.current.uid = user?.uid ?? null;
      session.current.ready = false;
      session.current.pending = null;
      session.current.conflict = null;
      session.current.base = user ? readConfirmed(user.uid) : null;
      setFbUser(user);
      setAuthReady(true);
      setSyncReady(false);
      setSyncConflict(null);
      setSyncRecovery(user ? readRecovery(user.uid) : null);
      setSyncError(null);
      setSyncStatus(user && enabled ? 'loading' : 'idle');
      if (!user || !enabled) return;

      let firstRead = true;
      const isCurrent = () => generation === session.current.generation && latest.current.enabled;
      unsubscribeDB = onValue(ref(db, `users/${user.uid}`), snapshot => {
        if (!isCurrent()) return;
        const raw: unknown = snapshot.val();
        const remote = cloudSave(raw);
        if (raw !== null && !remote) {
          session.current.ready = false;
          setSyncReady(false);
          setSyncStatus('error');
          setSyncError('The saved cloud bracket could not be read. Your local bracket has not been replaced.');
          return;
        }
        if (session.current.pending && fingerprint(remote) === fingerprint(session.current.pending)) return;
        const local = latest.current.save;
        const base = session.current.base;
        const foreignDraft = localOwner.current !== null && localOwner.current !== user.uid;

        if (!remote) {
          firstRead = false;
          if (foreignDraft) {
            session.current.ready = false;
            setSyncReady(false);
            setSyncStatus('error');
            setSyncError('This account has no cloud save. The previous account’s local bracket is preserved; it will not be uploaded to this account.');
          } else if (base) {
            session.current.ready = false;
            setSyncReady(false);
            setSyncStatus('error');
            setSyncError('The cloud save is missing. Your local bracket is preserved; automatic upload is paused.');
          } else {
            session.current.base = null;
            session.current.ready = true;
            setSyncReady(true);
            setSyncStatus('idle');
          }
          return;
        }

        if (session.current.conflict) {
          showConflict(remote);
          return;
        }
        const sameLocal = fingerprint(local) === fingerprint(remote);
        const sameBase = base !== null && fingerprint(local) === fingerprint(base);
        const unchangedRemote = base !== null && fingerprint(remote) === fingerprint(base);
        if (sameLocal || (!foreignDraft && (sameBase || (firstRead && pristine(local))))) {
          if (!sameLocal) {
            // Firebase can deliver another snapshot before React commits the requested restore.
            latest.current.save = remote;
            latest.current.onPull(remote.state, remote.notes);
          }
          confirm(user.uid, remote);
        } else if (!foreignDraft && unchangedRemote) {
          // Local unsent work is based on this exact cloud version, so it may upload after hydration.
          session.current.base = remote;
        } else {
          firstRead = false;
          showConflict(remote);
          return;
        }
        firstRead = false;
        session.current.ready = true;
        setSyncReady(true);
        setSyncError(null);
        setSyncStatus(sameLocal || sameBase || pristine(local) ? 'synced' : 'idle');
      }, error => {
        if (!isCurrent()) return;
        session.current.ready = false;
        setSyncReady(false);
        setSyncStatus('error');
        setSyncError(errorMessage(error));
      });
    });
    return () => {
      ++currentSession.generation;
      currentSession.ready = false;
      if (syncTimer.current) clearTimeout(syncTimer.current);
      unsubscribeAuth();
      unsubscribeDB();
    };
  }, [enabled, retryAttempt, confirm, showConflict]);

  const writeSave = useCallback(async (save: CloudSave, expected: CloudSave | null): Promise<boolean> => {
    const current = session.current;
    if (!current.uid || !latest.current.enabled || current.pending) return false;
    const { uid, generation } = current;
    const startingConflict = current.conflict;
    current.pending = save;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const result = await runTransaction(ref(db, `users/${uid}`), (raw: unknown) => {
        if (generation !== session.current.generation || !latest.current.enabled) return undefined;
        const remote = cloudSave(raw);
        if ((raw !== null && !remote) || fingerprint(remote) !== fingerprint(expected)) return undefined;
        return { ...(raw as Record<string, unknown> | null ?? {}),
          state: save.state, notes: save.notes, updated_at: new Date().toISOString() };
      }, { applyLocally: false });
      if (generation !== session.current.generation || !latest.current.enabled) return false;
      if (!result.committed) {
        const remote = cloudSave(result.snapshot.val());
        if (remote) showConflict(remote);
        else {
          session.current.ready = false;
          setSyncReady(false);
          setSyncStatus('error');
          setSyncError('The cloud save changed or is unavailable. Your local bracket is preserved. Retry to load the current version.');
        }
        return false;
      }
      confirm(uid, save);
      // A newer listener event may arrive after the commit but before its promise resolves.
      if (session.current.conflict && session.current.conflict !== startingConflict) return false;
      session.current.conflict = null;
      session.current.ready = true;
      setSyncConflict(null);
      setSyncReady(true);
      setSyncStatus('synced');
      return true;
    } catch (error) {
      if (generation === session.current.generation) {
        setSyncStatus('error');
        setSyncError(errorMessage(error));
      }
      return false;
    } finally {
      if (generation === session.current.generation) session.current.pending = null;
    }
  }, [confirm, showConflict]);

  const forcePush = useCallback(async (): Promise<boolean> => {
    if (!latest.current.enabled || !session.current.ready || session.current.conflict) return false;
    const save = latest.current.save;
    if (fingerprint(save) === fingerprint(session.current.base)) return true;
    return writeSave(save, session.current.base);
  }, [writeSave]);

  const resolveSyncConflict = useCallback(async (choice: 'local' | 'cloud'): Promise<boolean> => {
    const { conflict, uid } = session.current;
    if (!conflict || !uid || !latest.current.enabled) return false;
    // Retain BOTH versions before either an explicit cloud replacement or local overwrite.
    const recovery = { local: latest.current.save, cloud: conflict.cloud };
    try { localStorage.setItem(`dbk-sync-recovery:${uid}`, JSON.stringify(recovery)); }
    catch {
      setSyncError('Could not preserve both bracket versions. Free browser storage before choosing a version.');
      return false;
    }
    setSyncRecovery(recovery);
    if (choice === 'local') return writeSave(latest.current.save, conflict.cloud);
    latest.current.save = conflict.cloud;
    latest.current.onPull(conflict.cloud.state, conflict.cloud.notes);
    confirm(uid, conflict.cloud);
    session.current.conflict = null;
    session.current.ready = true;
    setSyncConflict(null);
    setSyncReady(true);
    setSyncError(null);
    setSyncStatus('synced');
    return true;
  }, [confirm, writeSave]);

  const retrySync = useCallback(() => {
    session.current.ready = false;
    setSyncReady(false);
    setSyncStatus('loading');
    setSyncError(null);
    setRetryAttempt(value => value + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !fbUser || !syncReady || syncConflict || syncStatus === 'error' || syncStatus === 'syncing') return;
    if (fingerprint({ state: serialized, notes }) === fingerprint(session.current.base)) return;
    syncTimer.current = setTimeout(() => { void forcePush(); }, 2000);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [serialized, notes, enabled, fbUser, syncReady, syncConflict, syncStatus, forcePush]);

  return { fbUser, authReady, syncReady: enabled && syncReady, syncStatus, syncError,
    syncConflict: syncConflict ? { ...syncConflict, local: { state: serialized, notes } } : null, syncRecovery,
    showAuthModal, setShowAuthModal, forcePush, retrySync, resolveSyncConflict };
}
