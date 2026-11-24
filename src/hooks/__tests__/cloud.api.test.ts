// Client/Firebase API contracts, using the real sync hook and an in-memory SDK boundary.
// These do not establish deployed Firebase authorization or live Google sign-in behavior.
import { act } from '@testing-library/react';
import { expect, it } from 'vitest';
import { advance, alternate, backend, deliver, harness, saved, signIn } from './cloudSync.fixture';

it('[P0][API] restores cloud bracket and notes before permitting uploads', async () => {
  const { result } = harness();
  await signIn();
  await advance(5000);
  expect(backend.writes).toEqual([]);
  expect(result.current.syncReady).toBe(false);
  await deliver({ state: saved, notes: [null, 'saved note'] });
  expect(result.current.serialized).toEqual(saved);
  expect(result.current.notes).toEqual({ 1: 'saved note' });
  expect(result.current.syncReady).toBe(true);
  await deliver({ state: saved, notes: { 1: 'updated on another device' } });
  expect(result.current.notes).toEqual({ 1: 'updated on another device' });
  await advance();
  expect(backend.writes).toEqual([]);
});

it('[P0][API] failed writes remain unsaved and a successful retry confirms state plus notes', async () => {
  const { result } = harness();
  await signIn();
  await deliver({ state: saved, notes: {}, retainedField: 'keep' });
  const confirmed = localStorage.getItem('dbk-confirmed-save:alice');
  backend.failure = new Error('write denied');
  act(() => result.current.setNotes({ 1: 'my unsaved note' }));
  await advance(6000);
  expect(result.current.syncStatus).toBe('error');
  expect(result.current.syncError).toContain('write denied');
  expect(localStorage.getItem('dbk-confirmed-save:alice')).toBe(confirmed);
  let success = true;
  await act(async () => { success = await result.current.forcePush(); });
  expect(success).toBe(false);
  backend.failure = null;
  await act(async () => { success = await result.current.forcePush(); });
  expect(success).toBe(true);
  expect(backend.data.get('users/alice')).toMatchObject({ state: saved, notes: { 1: 'my unsaved note' }, retainedField: 'keep' });
  expect(JSON.parse(localStorage.getItem('dbk-confirmed-save:alice')!)).toEqual({ state: saved, notes: { 1: 'my unsaved note' } });
  expect(localStorage.getItem('dbk-confirmed-save:bob')).toBeNull();
});

it('[P0][API] a concurrent cloud edit aborts overwrite and retains both versions for recovery', async () => {
  const { result } = harness();
  await signIn();
  await deliver({ state: saved, notes: {} });
  act(() => result.current.setNotes({ 1: 'my local work' }));
  const remote = { state: alternate, notes: { 1: 'other device' }, retainedField: 'keep' };
  backend.data.set('users/alice', remote);
  await advance();
  expect(backend.writes).toEqual([]);
  expect(backend.data.get('users/alice')).toEqual(remote);
  expect(result.current.notes).toEqual({ 1: 'my local work' });
  expect(result.current.syncConflict?.cloud.state).toEqual(alternate);
  await act(async () => { await result.current.resolveSyncConflict('cloud'); });
  const recovery = JSON.parse(localStorage.getItem('dbk-sync-recovery:alice')!);
  expect(recovery.local).toEqual({ state: saved, notes: { 1: 'my local work' } });
  expect(recovery.cloud).toEqual({ state: alternate, notes: { 1: 'other device' } });
  expect(result.current.serialized).toEqual(alternate);
  expect(backend.writes).toEqual([]);
});
