import { useState } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import type { Notes } from '../../types.js';
import { useFirebaseSync } from '../useFirebaseSync.js';

const backend = vi.hoisted(() => ({
  authListener: null as ((user: User | null) => void) | null,
  currentUser: null as User | null,
  listeners: new Map<string, { value: (snapshot: { val: () => unknown }) => void; error?: (error: Error) => void }>(),
  data: new Map<string, unknown>(),
  writes: [] as { path: string; value: unknown }[],
  failure: null as Error | null,
  afterCommit: null as (() => void) | null,
}));

vi.mock('../../lib/firebase.js', () => ({ auth: {}, db: {} }));
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth: unknown, callback: (user: User | null) => void) => {
    backend.authListener = callback;
    if (backend.currentUser) queueMicrotask(() => { if (backend.authListener === callback) callback(backend.currentUser); });
    return () => { backend.authListener = null; };
  },
}));
vi.mock('firebase/database', () => ({
  ref: (_db: unknown, path: string) => path,
  onValue: (path: string, value: (snapshot: { val: () => unknown }) => void, error?: (error: Error) => void) => {
    backend.listeners.set(path, { value, error });
    return () => { backend.listeners.delete(path); };
  },
  set: async (path: string, value: unknown) => {
    if (backend.failure) throw backend.failure;
    backend.data.set(path, value);
    backend.writes.push({ path, value });
  },
  runTransaction: async (path: string, update: (value: unknown) => unknown) => {
    if (backend.failure) throw backend.failure;
    const next = update(backend.data.get(path) ?? null);
    if (next === undefined) return { committed: false, snapshot: { val: () => backend.data.get(path) ?? null } };
    backend.data.set(path, next);
    backend.writes.push({ path, value: next });
    backend.afterCommit?.();
    return { committed: true, snapshot: { val: () => next } };
  },
}));

const empty = { _v: 2, history: [], champion: null };
const saved = { _v: 2, history: [{ phase: 'pi', round: 0, matchIndex: 0, wasUpset: false }], champion: null };
const alternate = { _v: 2, history: [{ phase: 'pi', round: 0, matchIndex: 0, wasUpset: true }], champion: null };

function harness(state: object = empty, notes: Notes = {}, enabled = true) {
  return renderHook(({ syncEnabled }) => {
    const [serialized, setSerialized] = useState(state);
    const [currentNotes, setNotes] = useState(notes);
    const sync = useFirebaseSync({
      serialized, notes: currentNotes, enabled: syncEnabled,
      onPull: (next, nextNotes) => {
        setSerialized(next as object);
        setNotes(nextNotes as Notes);
      },
    });
    return { ...sync, serialized, notes: currentNotes, setSerialized, setNotes };
  }, { initialProps: { syncEnabled: enabled } });
}

async function signIn(uid = 'alice') {
  backend.currentUser = { uid, email: `${uid}@example.test` } as User;
  await act(async () => { backend.authListener?.(backend.currentUser); });
}

async function deliver(value: unknown, uid = 'alice') {
  backend.data.set(`users/${uid}`, value);
  await act(async () => { backend.listeners.get(`users/${uid}`)?.value({ val: () => value }); });
}

async function advance(milliseconds = 2500) {
  await act(async () => { await vi.advanceTimersByTimeAsync(milliseconds); });
}

beforeEach(() => {
  vi.useFakeTimers();
  backend.authListener = null;
  backend.currentUser = null;
  backend.listeners.clear();
  backend.data.clear();
  backend.writes = [];
  backend.failure = null;
  backend.afterCommit = null;
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('personal cloud state loading', () => {
  it('waits for the first cloud read before allowing an automatic upload', async () => {
    const { result } = harness();
    await signIn();
    await advance(5000);
    expect(backend.writes).toEqual([]);
    await deliver({ state: saved, notes: { 1: 'cloud note' } });
    expect(result.current.serialized).toEqual(saved);
    expect(result.current.notes).toEqual({ 1: 'cloud note' });
    expect(result.current.syncReady).toBe(true);
    await advance();
    expect(backend.writes).toEqual([]);
  });

  it('applies notes-only remote changes when the bracket is unchanged', async () => {
    const { result } = harness();
    await signIn();
    await deliver({ state: saved, notes: { 1: 'original' } });
    await deliver({ state: saved, notes: { 1: 'edited elsewhere' } });
    expect(result.current.notes).toEqual({ 1: 'edited elsewhere' });
  });

  it('loads numeric seed notes when Firebase returns their keys as an array', async () => {
    const { result } = harness();
    await signIn();
    await deliver({ state: saved, notes: [null, 'seed one', 'seed two'] });
    expect(result.current.serialized).toEqual(saved);
    expect(result.current.notes).toEqual({ 1: 'seed one', 2: 'seed two' });
    expect(result.current.syncReady).toBe(true);
    await advance();
    expect(backend.writes).toEqual([]);
  });

  it('treats Firebase object key ordering as the same saved state', async () => {
    const { result } = harness();
    await signIn();
    await deliver({ state: saved, notes: { 1: 'saved' } });
    await deliver({ notes: { 1: 'saved' }, state: { champion: null, history: saved.history, _v: 2 } });
    expect(result.current.syncConflict).toBeNull();
    await advance();
    expect(backend.writes).toEqual([]);
  });

  it('never ignores a remote save because the legacy global marker matches it', async () => {
    localStorage.setItem('dbk-last-upload-state', JSON.stringify(saved));
    const { result } = harness();
    await signIn();
    await deliver({ state: saved, notes: { 2: 'retained' } });
    expect(result.current.serialized).toEqual(saved);
    expect(result.current.notes).toEqual({ 2: 'retained' });
  });

  it('keeps a read failure visible and blocks uploads until an explicit retry succeeds', async () => {
    const { result } = harness();
    await signIn();
    await act(async () => { backend.listeners.get('users/alice')?.error?.(new Error('permission denied')); });
    await advance(6000);
    expect(result.current.syncStatus).toBe('error');
    expect(result.current.syncError).toMatch(/permission denied/i);
    expect(result.current.syncReady).toBe(false);
    expect(backend.writes).toEqual([]);
    await act(async () => { result.current.retrySync(); });
    await deliver({ state: saved, notes: {} });
    expect(result.current.syncReady).toBe(true);
    expect(result.current.syncError).toBeNull();
    expect(result.current.serialized).toEqual(saved);
  });

  it('marks write failure as unsaved without falsely recording confirmation', async () => {
    const { result } = harness();
    await signIn();
    await deliver({ state: saved, notes: {} });
    const confirmedBefore = localStorage.getItem('dbk-confirmed-save:alice');
    backend.failure = new Error('write denied');
    act(() => { result.current.setNotes({ 1: 'not uploaded' }); });
    await advance(6000);
    expect(result.current.syncStatus).toBe('error');
    expect(result.current.syncError).toMatch(/write denied/i);
    expect(localStorage.getItem('dbk-confirmed-save:alice')).toBe(confirmedBefore);
    let success = true;
    await act(async () => { success = await result.current.forcePush(); });
    expect(success).toBe(false);
    expect(result.current.notes).toEqual({ 1: 'not uploaded' });
  });

  it('confirms state and notes per UID only after a successful upload', async () => {
    const { result } = harness();
    await signIn();
    await deliver({ state: saved, notes: {} });
    act(() => { result.current.setNotes({ 1: 'new note' }); });
    await advance();
    expect(backend.data.get('users/alice')).toMatchObject({ state: saved, notes: { 1: 'new note' } });
    expect(JSON.parse(localStorage.getItem('dbk-confirmed-save:alice')!)).toEqual({ state: saved, notes: { 1: 'new note' } });
    expect(localStorage.getItem('dbk-confirmed-save:bob')).toBeNull();
    expect(result.current.syncStatus).toBe('synced');
  });

  it('preserves differing local and cloud work instead of selecting by history length', async () => {
    const { result } = harness(alternate, { 1: 'local' });
    await signIn();
    await deliver({ state: saved, notes: { 1: 'cloud' } });
    expect(result.current.serialized).toEqual(alternate);
    expect(result.current.syncConflict?.local).toEqual({ state: alternate, notes: { 1: 'local' } });
    expect(result.current.syncConflict?.cloud).toEqual({ state: saved, notes: { 1: 'cloud' } });
    await advance();
    expect(backend.writes).toEqual([]);
    await act(async () => { await result.current.resolveSyncConflict('cloud'); });
    expect(result.current.serialized).toEqual(saved);
    expect(result.current.notes).toEqual({ 1: 'cloud' });
    const recovery = JSON.parse(localStorage.getItem('dbk-sync-recovery:alice')!);
    expect(recovery.local).toEqual({ state: alternate, notes: { 1: 'local' } });
    expect(recovery.cloud).toEqual({ state: saved, notes: { 1: 'cloud' } });
    expect(result.current.syncRecovery).toEqual(recovery);
  });

  it('detects a remote change between the read and write instead of overwriting it', async () => {
    const { result } = harness();
    await signIn();
    await deliver({ state: saved, notes: {} });
    act(() => { result.current.setNotes({ 1: 'local edit' }); });
    backend.data.set('users/alice', { state: alternate, notes: { 1: 'other device' }, extra: 'preserve' });
    await advance();
    expect(backend.writes).toEqual([]);
    expect(result.current.syncConflict?.cloud).toEqual({ state: alternate, notes: { 1: 'other device' } });
    expect(result.current.notes).toEqual({ 1: 'local edit' });
  });

  it('requires another choice if the cloud changes while resolving a conflict', async () => {
    const { result } = harness(alternate, { 1: 'local' });
    await signIn();
    await deliver({ state: saved, notes: { 1: 'cloud' } });
    backend.data.set('users/alice', { state: saved, notes: { 1: 'newer cloud' } });
    let success = true;
    await act(async () => { success = await result.current.resolveSyncConflict('local'); });
    expect(success).toBe(false);
    expect(backend.writes).toEqual([]);
    expect(result.current.syncConflict?.cloud.notes).toEqual({ 1: 'newer cloud' });
  });

  it('does not upload the previous account draft into a new empty account', async () => {
    const { result } = harness();
    await signIn('alice');
    await deliver({ state: saved, notes: { 1: 'Alice only' } }, 'alice');
    const oldCallback = backend.listeners.get('users/alice')!.value;
    await signIn('bob');
    await deliver(null, 'bob');
    await advance();
    expect(backend.writes).toEqual([]);
    expect(result.current.syncReady).toBe(false);
    expect(result.current.syncError).toMatch(/account|previous/i);
    await act(async () => { oldCallback({ val: () => ({ state: alternate, notes: {} }) }); });
    expect(result.current.serialized).toEqual(saved);
  });

  it('does not read or write cloud state while local restore recovery disables sync', async () => {
    const { result } = harness(empty, {}, false);
    await signIn();
    expect(result.current.authReady).toBe(true);
    expect(result.current.fbUser?.uid).toBe('alice');
    expect(result.current.syncReady).toBe(false);
    expect(backend.listeners.has('users/alice')).toBe(false);
    let success = true;
    await act(async () => { success = await result.current.forcePush(); });
    await advance();
    expect(success).toBe(false);
    expect(backend.writes).toEqual([]);
  });

  it('blocks cloud mutation if preserving the two conflicting versions fails', async () => {
    const { result } = harness(alternate, { 1: 'local' });
    await signIn();
    await deliver({ state: saved, notes: { 1: 'cloud' } });
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    let success = true;
    await act(async () => { success = await result.current.resolveSyncConflict('cloud'); });
    storage.mockRestore();
    expect(success).toBe(false);
    expect(result.current.serialized).toEqual(alternate);
    expect(result.current.syncConflict?.cloud.state).toEqual(saved);
    expect(backend.writes).toEqual([]);
  });

  it('updates the expected base from a previous successful account save before restoring newer cloud data', async () => {
    localStorage.setItem('dbk-confirmed-save:alice', JSON.stringify({ state: saved, notes: { 1: 'before' } }));
    const { result } = harness(saved, { 1: 'before' });
    await signIn();
    await deliver({ state: alternate, notes: { 1: 'after' } });
    expect(result.current.serialized).toEqual(alternate);
    expect(result.current.notes).toEqual({ 1: 'after' });
    expect(result.current.syncConflict).toBeNull();
    await advance();
    expect(backend.writes).toEqual([]);
  });

  it('does not repeatedly upload default empty fields that Firebase removes from a saved bracket', async () => {
    const { result } = harness();
    await signIn();
    await deliver({ state: { _v: 2, history: saved.history } });
    act(() => { result.current.setSerialized({ _v: 2, history: saved.history, champion: null, upsets: [] }); });
    await advance();
    expect(backend.writes).toEqual([]);
    expect(result.current.syncConflict).toBeNull();
  });

  it('does not recreate a missing previous cloud save from an empty fallback bracket', async () => {
    localStorage.setItem('dbk-confirmed-save:alice', JSON.stringify({ state: saved, notes: {} }));
    const { result } = harness();
    await signIn();
    await deliver(null);
    await advance();
    expect(backend.writes).toEqual([]);
    expect(result.current.syncReady).toBe(false);
    expect(result.current.syncError).toMatch(/missing/i);
  });

  it('keeps a newer conflict observed during write acknowledgment instead of clearing it as synced', async () => {
    const { result } = harness();
    await signIn();
    await deliver({ state: saved, notes: {} });
    act(() => { result.current.setNotes({ 1: 'my edit' }); });
    backend.afterCommit = () => {
      const newer = { state: alternate, notes: { 1: 'changed after my commit' } };
      backend.data.set('users/alice', newer);
      backend.listeners.get('users/alice')?.value({ val: () => newer });
    };
    await advance();
    expect(result.current.syncConflict?.cloud.notes).toEqual({ 1: 'changed after my commit' });
    expect(result.current.syncReady).toBe(false);
    expect(result.current.syncStatus).toBe('conflict');
  });

  it('loads consecutive remote snapshots without mistaking a pending React render for local work', async () => {
    const { result } = harness();
    await signIn();
    await act(async () => {
      const callback = backend.listeners.get('users/alice')!.value;
      callback({ val: () => ({ state: saved, notes: { 1: 'first' } }) });
      callback({ val: () => ({ state: alternate, notes: { 1: 'second' } }) });
    });
    expect(result.current.serialized).toEqual(alternate);
    expect(result.current.notes).toEqual({ 1: 'second' });
    expect(result.current.syncConflict).toBeNull();
  });

  it('pauses sync immediately when the bracket parser rejects an incoming cloud save', async () => {
    const { result } = renderHook(() => useFirebaseSync({ serialized: empty, notes: {}, onPull: () => false }));
    await signIn();
    await deliver({ state: saved, notes: { 1: 'do not apply' } });
    expect(result.current.syncReady).toBe(false);
    expect(result.current.syncStatus).toBe('error');
    expect(result.current.syncError).toMatch(/accept|read|restore/i);
    expect(localStorage.getItem('dbk-confirmed-save:alice')).toBeNull();
    await advance();
    expect(backend.writes).toEqual([]);
  });

  it('retains conflict candidates when the bracket parser rejects the chosen cloud version', async () => {
    const { result } = renderHook(() => useFirebaseSync({ serialized: alternate, notes: { 1: 'local' }, onPull: () => false }));
    await signIn();
    await deliver({ state: saved, notes: { 1: 'cloud' } });
    let success = true;
    await act(async () => { success = await result.current.resolveSyncConflict('cloud'); });
    expect(success).toBe(false);
    expect(result.current.syncReady).toBe(false);
    expect(result.current.syncConflict?.local.state).toEqual(alternate);
    expect(result.current.syncRecovery?.cloud.state).toEqual(saved);
    expect(localStorage.getItem('dbk-confirmed-save:alice')).toBeNull();
    await advance();
    expect(backend.writes).toEqual([]);
  });
});
