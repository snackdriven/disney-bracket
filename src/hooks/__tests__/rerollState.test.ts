import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useBracketState } from '../useBracketState';
import { applyPick, resetState } from '../../lib/bracket';
import { serMatch } from '../../lib/utils';

function fixture(picks = 69) {
  let state = resetState();
  for (let i = 0; i < picks; i++) {
    const match = state.phase === 'pi' ? state.playInMatches[state.playInIndex] : state.rounds[state.currentRound][state.currentMatch];
    state = applyPick(state, match.players[0]);
  }
  return { _v: 2, ...state, playInMatches: serMatch(state.playInMatches), rounds: state.rounds.map(serMatch) };
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
});
afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

describe('reroll state lifecycle', () => {
  it('previews and cancels a finished bracket without changing its saved data', () => {
    const original = fixture();
    localStorage.setItem('dbk-state', JSON.stringify(original));
    const { result } = renderHook(() => useBracketState());
    const saved = localStorage.getItem('dbk-state');
    act(() => result.current.openRerollPreview());
    expect(result.current.rerollPreview?.matches).toHaveLength(8);
    expect(result.current.rerollPreview?.removedPickCount).toBe(15);
    expect(result.current.rerollPreview?.removesChampion).toBe(true);
    act(() => result.current.shuffleRerollPreview());
    act(() => result.current.cancelRerollPreview());
    expect(result.current.rerollPreview).toBeNull();
    expect(result.current.champion).toEqual(original.champion);
    expect(localStorage.getItem('dbk-state')).toBe(saved);
  });

  it('applies the visible draw, backs up cleared results and notes, and restores it after remount', () => {
    localStorage.setItem('dbk-state', JSON.stringify(fixture()));
    localStorage.setItem('dbk-notes', JSON.stringify({ 1: 'Keep this note' }));
    const { result, unmount } = renderHook(() => useBracketState());
    act(() => result.current.openRerollPreview());
    const candidate = result.current.rerollPreview!.matches;
    act(() => result.current.confirmRerollPreview());
    expect(result.current.rounds[2]).toEqual(candidate);
    expect(result.current.history).toHaveLength(54);
    expect(result.current.champion).toBeNull();
    expect(result.current.regionName).toBe('');
    const recovery = JSON.parse(localStorage.getItem('dbk-pre-reroll')!);
    expect(recovery.bracket.champion).not.toBeNull();
    expect(recovery.notes).toEqual({ 1: 'Keep this note' });
    expect(localStorage.getItem('dbk-notes')).toContain('Keep this note');
    unmount();
    const restored = renderHook(() => useBracketState());
    expect(restored.result.current.rounds[2]).toEqual(candidate);
    expect(restored.result.current.sweet16Rerolled).toBe(true);
  });

  it('keeps the existing champion and visible preview when backup storage fails', () => {
    localStorage.setItem('dbk-state', JSON.stringify(fixture()));
    const { result } = renderHook(() => useBracketState());
    const champion = result.current.champion;
    act(() => result.current.openRerollPreview());
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === 'dbk-pre-reroll') throw new Error('Quota exceeded');
      setItem.call(this, key, value);
    });
    act(() => result.current.confirmRerollPreview());
    expect(result.current.champion).toEqual(champion);
    expect(result.current.history).toHaveLength(69);
    expect(result.current.rerollPreview).not.toBeNull();
    expect(result.current.rerollError).toMatch(/backup|recovery/i);
  });

  it('invalidates a preview when remote state replaces its source', () => {
    localStorage.setItem('dbk-state', JSON.stringify(fixture()));
    const { result } = renderHook(() => useBracketState());
    act(() => result.current.openRerollPreview());
    act(() => result.current.applyServerState(fixture(55)));
    act(() => result.current.confirmRerollPreview());
    expect(result.current.rerollPreview).toBeNull();
    expect(result.current.history).toHaveLength(55);
  });

  it('a pending pick cannot overwrite a remote restore or reset', () => {
    const { result } = renderHook(() => useBracketState());
    act(() => result.current.pick(result.current.activeMatch!.players[0]));
    act(() => result.current.applyServerState(fixture(54)));
    act(() => vi.advanceTimersByTime(400));
    expect(result.current.history).toHaveLength(54);
    act(() => result.current.pick(result.current.activeMatch!.players[0]));
    act(() => result.current.reset());
    act(() => vi.advanceTimersByTime(400));
    expect(result.current.history).toHaveLength(0);
    expect(result.current.phase).toBe('pi');
  });

  it('does not leave an outdated bracket hash to override a newer large save', () => {
    const original = fixture(1);
    window.location.hash = btoa(JSON.stringify(original));
    const { result } = renderHook(() => useBracketState());
    act(() => result.current.applyServerState(fixture(69)));
    expect(window.location.hash).toBe('');
    expect(JSON.parse(localStorage.getItem('dbk-state')!).history).toHaveLength(69);
  });

  it('preserves rejected raw storage and blocks fallback persistence', () => {
    const raw = '{broken JSON';
    localStorage.setItem('dbk-state', raw);
    const { result } = renderHook(() => useBracketState());
    expect(result.current.restoreError).toBeTruthy();
    expect(localStorage.getItem('dbk-state')).toBe(raw);
    expect(result.current.rejectedSave).toBe(raw);
  });

  it('preserves divergent link and device brackets until an explicit choice', () => {
    const device = fixture(69);
    const link = fixture(1);
    const raw = JSON.stringify(device);
    localStorage.setItem('dbk-state', raw);
    window.location.hash = btoa(JSON.stringify(link));
    const { result } = renderHook(() => useBracketState());
    expect(result.current.sourceConflict).toBeTruthy();
    expect(result.current.history).toHaveLength(69);
    expect(localStorage.getItem('dbk-state')).toBe(raw);
    act(() => result.current.resolveSourceConflict('link'));
    expect(result.current.history).toHaveLength(1);
    const recovery = JSON.parse(localStorage.getItem('dbk-import-recovery')!);
    expect(recovery.deviceRaw).toBe(raw);
    expect(recovery.linkRaw).toBe(JSON.stringify(link));
  });

  it('can retain the device bracket instead of a divergent share link', () => {
    localStorage.setItem('dbk-state', JSON.stringify(fixture(69)));
    window.location.hash = btoa(JSON.stringify(fixture(1)));
    const { result } = renderHook(() => useBracketState());
    act(() => result.current.resolveSourceConflict('device'));
    expect(result.current.history).toHaveLength(69);
    expect(result.current.sourceConflict).toBeNull();
    expect(result.current.restoreError).toBeNull();
  });

  it('refuses to open a solo reroll for any room parameter, including an empty one', () => {
    localStorage.setItem('dbk-state', JSON.stringify(fixture()));
    window.history.replaceState(null, '', '/?room=');
    const { result } = renderHook(() => useBracketState());
    act(() => result.current.openRerollPreview());
    expect(result.current.rerollPreview).toBeNull();
  });

  it.each(['access_token=secret', 'token_hash=secret', 'id_token=secret', 'code=auth-code', 'error=access_denied'])('does not overwrite an auth callback fragment: %s', (hash) => {
    localStorage.setItem('dbk-state', JSON.stringify(fixture(54)));
    window.location.hash = hash;
    renderHook(() => useBracketState());
    expect(window.location.hash).toBe('#' + hash);
  });
});
