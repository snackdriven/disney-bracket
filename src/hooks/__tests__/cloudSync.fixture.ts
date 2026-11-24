import { applyPick, resetState } from '../../lib/bracket';
import { serializeBracketState } from '../../lib/bracketSerialization';
import { useState } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
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

export const empty = serializeBracketState(resetState());
export const saved = serializeBracketState(applyPick(resetState(), resetState().playInMatches[0].players[0]));
export const alternate = serializeBracketState(applyPick(resetState(), resetState().playInMatches[0].players[1]));

export function harness(state: object = empty, notes: Notes = {}, enabled = true) {
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

export async function signIn(uid = 'alice') {
  backend.currentUser = { uid, email: `${uid}@example.test` } as User;
  await act(async () => { backend.authListener?.(backend.currentUser); });
}

export async function deliver(value: unknown, uid = 'alice') {
  backend.data.set(`users/${uid}`, value);
  await act(async () => { backend.listeners.get(`users/${uid}`)?.value({ val: () => value }); });
}

export async function advance(milliseconds = 2500) {
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



export { backend };

