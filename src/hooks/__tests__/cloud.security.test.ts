import { act } from '@testing-library/react';
import { expect, it } from 'vitest';
import { advance, alternate, backend, deliver, harness, saved, signIn } from './cloudSync.fixture';

it('[P0][SECURITY] account changes and denied reads cannot upload another account’s draft', async () => {
  const { result } = harness();
  await signIn('alice');
  await deliver({ state: saved, notes: { 1: 'Alice only' } });
  const staleAliceCallback = backend.listeners.get('users/alice')!.value;
  await signIn('bob');
  await act(async () => { backend.listeners.get('users/bob')!.error!(new Error('permission denied')); });
  await advance(6000);
  expect(result.current.fbUser?.uid).toBe('bob');
  expect(result.current.syncReady).toBe(false);
  expect(result.current.syncError).toContain('permission denied');
  expect(result.current.notes).toEqual({ 1: 'Alice only' });
  let success = true;
  await act(async () => { success = await result.current.forcePush(); });
  expect(success).toBe(false);
  expect(backend.writes).toEqual([]);
  expect(backend.data.has('users/bob')).toBe(false);
  await act(async () => { staleAliceCallback({ val: () => ({ state: alternate, notes: {} }) }); });
  expect(result.current.serialized).toEqual(saved);
  expect(result.current.notes).toEqual({ 1: 'Alice only' });
});
