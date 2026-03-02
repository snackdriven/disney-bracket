import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBracketState } from '../useBracketState.js';
import type { Movie } from '../../types.js';

const validMovie: Movie = { seed: 1, name: 'Test Movie', year: 2000, studio: 'Disney', imdb: '' };
const validMovie2: Movie = { ...validMovie, seed: 2, name: 'Test Movie 2' };

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '';
});

afterEach(() => {
  localStorage.clear();
  window.location.hash = '';
});

function seedV1(data: Record<string, unknown>) {
  localStorage.setItem('dbk-state', JSON.stringify({ _v: 1, ...data }));
}

describe('useBracketState — migrateV1', () => {
  it('valid v1 state populates all fields', () => {
    const historyEntry = { phase: 'pi', matchIndex: 0, round: 0, wasUpset: false };
    const upsetEntry = { winner: validMovie, loser: validMovie2, round: 'Play-In', seedDiff: 1 };
    seedV1({ ph: 'pi', ch: validMovie, hi: [historyEntry], upsets: [upsetEntry] });
    const { result } = renderHook(() => useBracketState());
    expect(result.current.phase).toBe('pi');
    expect(result.current.champion).toEqual(validMovie);
    expect(result.current.history).toHaveLength(1);
    expect(result.current.upsets).toHaveLength(1);
  });

  it('invalid v1 fields fall back to safe defaults', () => {
    seedV1({ ph: 'INVALID_PHASE', ch: 'not-a-movie' });
    const { result } = renderHook(() => useBracketState());
    expect(result.current.phase).toBe('pi');
    expect(result.current.champion).toBeNull();
  });

  it('v1 history with mixed valid/invalid entries — bad entries filtered', () => {
    const entries = [
      { phase: 'pi', matchIndex: 0, round: 0, wasUpset: false },
      { phase: 'INVALID', matchIndex: 1, round: 0, wasUpset: true },
      'not-an-object',
      null,
    ];
    seedV1({ hi: entries });
    const { result } = renderHook(() => useBracketState());
    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0]).toMatchObject({ phase: 'pi', matchIndex: 0, round: 0, wasUpset: false });
  });

  it('v1 upsets with mixed valid/invalid entries — bad entries filtered', () => {
    const upsets = [
      { winner: validMovie, loser: validMovie2, round: 'R64', seedDiff: 1 },
      { winner: 'not-a-movie', loser: validMovie, round: 'R64', seedDiff: 1 },
      null,
    ];
    seedV1({ upsets });
    const { result } = renderHook(() => useBracketState());
    expect(result.current.upsets).toHaveLength(1);
  });
});
