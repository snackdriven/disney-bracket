import { describe, expect, it } from 'vitest';
import { applyPick, applyUndo, resetState, canRerollSweet16, buildSweet16Preview, applySweet16Reroll } from '../bracket';
import type { BracketState, Match } from '../../types';

function playTo(picks: number): BracketState {
  let state = resetState();
  for (let i = 0; i < picks; i++) {
    const match = state.phase === 'pi' ? state.playInMatches[state.playInIndex] : state.rounds[state.currentRound][state.currentMatch];
    state = applyPick(state, match.players[i % 2]);
  }
  return state;
}

function pairSet(matches: Match[]): string[] {
  return matches.map(m => m.players.map(p => p.seed).sort((a, b) => a - b).join('-')).sort();
}

describe('Sweet 16 reroll', () => {
  it.each([54, 55, 62, 66, 69])('can restart after %i picks, preserving the original 16 winners', (picks) => {
    const before = playTo(picks);
    const untouched = structuredClone(before);
    expect(canRerollSweet16(before)).toBe(true);
    const preview = buildSweet16Preview(before, () => 0.999);
    const after = applySweet16Reroll(before, preview);
    expect(before).toEqual(untouched);
    expect(preview).toHaveLength(8);
    expect(preview.flatMap(m => m.players.map(p => p.seed)).sort((a, b) => a - b))
      .toEqual(before.rounds[1].map(m => m.winner!.seed).sort((a, b) => a - b));
    expect(pairSet(preview)).not.toEqual(pairSet(before.rounds[2]));
    expect(after.rounds.slice(0, 2)).toEqual(before.rounds.slice(0, 2));
    expect(after.playInMatches).toEqual(before.playInMatches);
    expect(after.history).toEqual(before.history.slice(0, 54));
    expect(after.upsets).toEqual(before.upsets.filter(u => ['Play-In', 'Round of 64', 'Round of 32'].includes(u.round)));
    expect(after.currentRound).toBe(2);
    expect(after.currentMatch).toBe(0);
    expect(after.champion).toBeNull();
    expect(after.rounds).toHaveLength(3);
    expect(after.rounds[2]).toEqual(preview);
    expect(after.rounds[2].every(m => !m.winner)).toBe(true);
    expect(after.sweet16Rerolled).toBe(true);
  });

  it('preview generation never clears current results and changes saved and previous preview opponents', () => {
    const before = playTo(69);
    const copy = structuredClone(before);
    const first = buildSweet16Preview(before, () => 0.999);
    const second = buildSweet16Preview(before, () => 0.999, first);
    expect(pairSet(second)).not.toEqual(pairSet(first));
    expect(pairSet(second)).not.toEqual(pairSet(before.rounds[2]));
    expect(before).toEqual(copy);
  });

  it('rejects an incomplete R32 without changing its state', () => {
    const before = playTo(53);
    expect(canRerollSweet16(before)).toBe(false);
    expect(buildSweet16Preview(before)).toEqual([]);
    expect(applySweet16Reroll(before, [])).toBe(before);
  });

  it('rejects duplicate, foreign, already-played, or unchanged candidate matches', () => {
    const before = playTo(54);
    const preview = buildSweet16Preview(before, () => 0);
    const duplicate = structuredClone(preview);
    duplicate[1].players[0] = duplicate[0].players[0];
    const foreign = structuredClone(preview);
    foreign[0].players[0] = { ...foreign[0].players[0], seed: 999 };
    const played = structuredClone(preview);
    played[0].winner = played[0].players[0];
    for (const candidate of [duplicate, foreign, played, before.rounds[2]]) {
      expect(applySweet16Reroll(before, candidate)).toBe(before);
    }
  });

  it('rejects invalid R32 winners and inconsistent earlier history', () => {
    const before = playTo(54);
    const invalid = structuredClone(before);
    invalid.rounds[1][0].winner = before.rounds[1][1].winner;
    expect(canRerollSweet16(invalid)).toBe(false);
    expect(canRerollSweet16({ ...before, history: before.history.slice(1) })).toBe(false);
  });

  it('retains the draw when undoing Sweet 16 but clears it when undoing R32', () => {
    const before = playTo(54);
    const rerolled = applySweet16Reroll(before, buildSweet16Preview(before));
    const picked = applyPick(rerolled, rerolled.rounds[2][0].players[0]);
    const undoSweet16 = applyUndo(picked);
    expect(undoSweet16.rounds[2]).toEqual(rerolled.rounds[2]);
    expect(undoSweet16.sweet16Rerolled).toBe(true);
    const undoR32 = applyUndo(undoSweet16);
    expect(undoR32.sweet16Rerolled).toBeFalsy();
    expect(undoR32.rounds).toHaveLength(2);
    const normal = applyPick(undoR32, before.rounds[1][15].winner!);
    expect(normal.rounds[2]).toEqual(before.rounds[2]);
  });

  it('can finish the rerolled bracket with exactly 69 picks and original seeds', () => {
    const before = playTo(69);
    let state = applySweet16Reroll(before, buildSweet16Preview(before));
    while (!state.champion) {
      state = applyPick(state, state.rounds[state.currentRound][state.currentMatch].players[0]);
    }
    expect(state.history).toHaveLength(69);
    expect(before.rounds[1].some(m => m.winner?.seed === state.champion?.seed)).toBe(true);
    expect(state.champion).toEqual(before.rounds[1].find(m => m.winner?.seed === state.champion?.seed)!.winner);
  });
});
