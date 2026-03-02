import { describe, it, expect } from 'vitest';
import { MAIN, PLAYIN, PIP, R1 } from '../data.js';
import {
  buildInitialRounds,
  applyPick,
  applyUndo,
  resetState,
  buildDisplayRds,
  exportBracketText,
} from '../bracket.js';
import type { BracketState } from '../../types.js';

// Build a valid set of 6 play-in winners — alternates [0]/[1] to match stateAfterPlayin
function makePlayinWinners() {
  return PIP.map(([a, b], i) => PLAYIN[i % 2 === 0 ? a : b]);
}

// State after all 6 play-in picks (alternates picks to cover both code paths)
function stateAfterPlayin(): BracketState {
  let state = resetState();
  PIP.forEach(([a, b], i) => {
    state = applyPick(state, PLAYIN[i % 2 === 0 ? a : b]);
  });
  return state;
}

describe('buildInitialRounds', () => {
  it('includes play-in winners in the correct slots', () => {
    const winners = makePlayinWinners();
    const [r64] = buildInitialRounds(winners);
    // R1 indices >= 58 map to play-in winners (index - 58)
    R1.forEach(([a, b], i) => {
      if (a >= 58) expect(r64[i].players[0]).toBe(winners[a - 58]);
      if (b >= 58) expect(r64[i].players[1]).toBe(winners[b - 58]);
    });
  });
});

describe('applyPick — play-in phase', () => {
  it('first pick advances index, stores winner, and adds history entry', () => {
    const state = resetState();
    const winner = state.playInMatches[0].players[0];
    const next = applyPick(state, winner);
    expect(next.playInIndex).toBe(1);
    expect(next.phase).toBe('pi');
    expect(next.playInMatches[0].winner).toBe(winner);
    expect(next.history).toHaveLength(1);
    expect(next.history[0].phase).toBe('pi');
  });

  it('6th play-in pick transitions to main bracket (phase = "m")', () => {
    const state = stateAfterPlayin();
    expect(state.phase).toBe('m');
    expect(state.currentRound).toBe(0);
    expect(state.currentMatch).toBe(0);
    expect(state.rounds.length).toBe(1);
    expect(state.rounds[0].length).toBe(32);
    expect(state.history.length).toBe(6);
  });
});

describe('applyPick — main bracket', () => {
  it('advances currentMatch within a round', () => {
    const state = stateAfterPlayin();
    const winner = state.rounds[0][0].players[0];
    const next = applyPick(state, winner);
    expect(next.currentMatch).toBe(1);
    expect(next.currentRound).toBe(0);
    expect(next.rounds[0][0].winner).toBe(winner);
  });

  it('winner slots into next round when round completes', () => {
    let state = stateAfterPlayin();
    // Pick all 32 R64 matches
    for (let i = 0; i < 32; i++) {
      const winner = state.rounds[state.currentRound][state.currentMatch].players[0];
      state = applyPick(state, winner);
    }
    expect(state.currentRound).toBe(1);
    expect(state.currentMatch).toBe(0);
    expect(state.rounds.length).toBe(2);
    expect(state.rounds[1].length).toBe(16);
  });

  it('R32 participants are exactly the R64 winners in bracket order', () => {
    let state = stateAfterPlayin();
    for (let i = 0; i < 32; i++) {
      state = applyPick(state, state.rounds[state.currentRound][state.currentMatch].players[0]);
    }
    const r64Winners = state.rounds[0].map(m => m.winner);
    state.rounds[1].forEach((match, i) => {
      expect(match.players[0]).toBe(r64Winners[i * 2]);
      expect(match.players[1]).toBe(r64Winners[i * 2 + 1]);
    });
  });

  it('adds to upsets on a lower-seed win; normal win does not', () => {
    const state = stateAfterPlayin();
    const base = state.upsets.length;

    // Normal pick: stronger seed (lower number) wins — no upset
    const m0 = state.rounds[0][0];
    const fav = m0.players[0].seed < m0.players[1].seed ? m0.players[0] : m0.players[1];
    expect(applyPick(state, fav).upsets.length).toBe(base);

    // Upset pick: find a match where players[1].seed > players[0].seed
    for (let i = 0; i < state.rounds[0].length; i++) {
      const m = state.rounds[0][i];
      if (m.players[1].seed > m.players[0].seed) {
        const upset = applyPick(state, m.players[1]);
        expect(upset.upsets.length).toBe(base + 1);
        expect(upset.upsets[upset.upsets.length - 1].seedDiff).toBeGreaterThan(0);
        return;
      }
    }
    throw new Error('No upset match found in R64 — data may have changed');
  });
});

describe('applyPick — championship', () => {
  function playFullBracket(state: BracketState): BracketState {
    while (!state.champion) {
      const round = state.rounds[state.currentRound];
      const match = round?.[state.currentMatch];
      if (!round || !match) throw new Error(`Bracket stalled at currentRound=${state.currentRound} currentMatch=${state.currentMatch}`);
      state = applyPick(state, match.players[0]);
    }
    return state;
  }

  it('full bracket sets champion and produces 69-entry history', () => {
    let state = stateAfterPlayin();
    state = playFullBracket(state);
    expect(state.champion?.seed).toBeGreaterThan(0);
    expect(state.history.length).toBe(69); // 6 play-in + 63 main
  });
});

describe('applyUndo', () => {
  it('returns same state if history is empty', () => {
    const state = resetState();
    const undone = applyUndo(state);
    expect(undone).toBe(state);
  });

  it('reverts last play-in pick', () => {
    const state = resetState();
    const winner = state.playInMatches[0].players[0];
    const picked = applyPick(state, winner);
    const undone = applyUndo(picked);
    expect(undone.playInIndex).toBe(0);
    expect(undone.phase).toBe('pi');
    expect(undone.playInMatches[0].winner).toBeUndefined();
    expect(undone.history.length).toBe(0);
  });

  it('clears champion when undoing championship pick', () => {
    let state = stateAfterPlayin();
    // Pick all but verify last pick gives champion
    while (!state.champion) {
      const match = state.rounds[state.currentRound]?.[state.currentMatch];
      if (!match) throw new Error(`Bracket stalled at currentRound=${state.currentRound} currentMatch=${state.currentMatch}`);
      state = applyPick(state, match.players[0]);
    }
    expect(state.champion).not.toBeNull();
    const undone = applyUndo(state);
    expect(undone.champion).toBeNull();
  });

  it('removes upset from upsets array when reverting an upset pick', () => {
    const state = stateAfterPlayin();
    const baseUpsets = state.upsets.length;
    // Find and make an upset pick in R64
    let upsetState: BracketState | null = null;
    for (let i = 0; i < state.rounds[0].length; i++) {
      const m = state.rounds[0][i];
      if (m.players[1].seed > m.players[0].seed) {
        upsetState = applyPick(state, m.players[1]);
        break;
      }
    }
    expect(upsetState!.upsets.length).toBe(baseUpsets + 1);
    const undone = applyUndo(upsetState!);
    expect(undone.upsets.length).toBe(baseUpsets);
  });

  it('undoing the last pick of a round drops the promoted next round', () => {
    let state = stateAfterPlayin();
    // Pick all 32 R64 matches — the 32nd pick promotes to R32
    for (let i = 0; i < 32; i++) {
      state = applyPick(state, state.rounds[state.currentRound][state.currentMatch].players[0]);
    }
    expect(state.currentRound).toBe(1);
    expect(state.rounds.length).toBe(2);
    const undone = applyUndo(state);
    expect(undone.currentRound).toBe(0);
    expect(undone.currentMatch).toBe(31);
    expect(undone.rounds.length).toBe(1); // R32 dropped
    expect(undone.rounds[0][31].winner).toBeUndefined();
  });

  it('reverts main-bracket pick to the correct match position', () => {
    let state = stateAfterPlayin();
    for (let i = 0; i < 3; i++) {
      state = applyPick(state, state.rounds[state.currentRound][state.currentMatch].players[0]);
    }
    expect(state.currentMatch).toBe(3);
    const undone = applyUndo(state);
    expect(undone.currentMatch).toBe(2);
    expect(undone.currentRound).toBe(0);
    expect(undone.rounds[0][2].winner).toBeUndefined();
    expect(undone.history.length).toBe(8); // 6 play-in + 2 remaining main picks
  });
});

describe('resetState', () => {
  it('returns clean initial state with 6 play-in matches from PIP', () => {
    const state = resetState();
    expect(state.phase).toBe('pi');
    expect(state.playInIndex).toBe(0);
    expect(state.currentRound).toBe(0);
    expect(state.currentMatch).toBe(0);
    expect(state.champion).toBeNull();
    expect(state.history).toEqual([]);
    expect(state.upsets).toEqual([]);
    expect(state.rounds).toEqual([]);
    expect(state.playInMatches.length).toBe(6);
    PIP.forEach(([a, b], i) => {
      expect(state.playInMatches[i].players[0]).toBe(PLAYIN[a]);
      expect(state.playInMatches[i].players[1]).toBe(PLAYIN[b]);
    });
  });
});

describe('buildDisplayRds', () => {
  it('synthesizes R64 when rounds is empty', () => {
    const state = resetState();
    const display = buildDisplayRds(state.rounds, state.playInMatches);
    expect(display[0]).toBeDefined();
    expect(display[0].length).toBe(32);
    // Each MAIN-seeded slot should reference the correct movie from MAIN
    R1.forEach(([a, b], i) => {
      if (a < 58) expect(display[0][i].players[0]).toBe(MAIN[a]);
      if (b < 58) expect(display[0][i].players[1]).toBe(MAIN[b]);
    });
  });

  it('returns existing rounds when present', () => {
    const state = stateAfterPlayin();
    const winner = state.rounds[0][0].players[0];
    const picked = applyPick(state, winner);
    const display = buildDisplayRds(picked.rounds, picked.playInMatches);
    expect(display[0][0].winner).toBe(winner);
    // Participants must not be shuffled or re-derived
    expect(display[0][0].players[0]).toBe(state.rounds[0][0].players[0]);
    expect(display[0][0].players[1]).toBe(state.rounds[0][0].players[1]);
  });

  it('synthesizes future rounds from winners', () => {
    let state = stateAfterPlayin();
    // Pick all 32 R64 matches
    for (let i = 0; i < 32; i++) {
      state = applyPick(state, state.rounds[state.currentRound][state.currentMatch].players[0]);
    }
    // Now rounds has 2 rounds, but buildDisplayRds should project further
    const display = buildDisplayRds(state.rounds, state.playInMatches);
    expect(display[0]).toBeDefined();
    expect(display[1]).toBeDefined();
    expect(display[1].length).toBe(16);
    // R32 participants should be the R64 winners paired in order
    const r64Winners = state.rounds[0].map(m => m.winner);
    display[1].forEach((match, i) => {
      expect(match.players[0]).toBe(r64Winners[i * 2]);
      expect(match.players[1]).toBe(r64Winners[i * 2 + 1]);
    });
  });
});

describe('exportBracketText', () => {
  it('includes champion line when bracket is complete', () => {
    let state = stateAfterPlayin();
    while (!state.champion) {
      const match = state.rounds[state.currentRound]?.[state.currentMatch];
      if (!match) throw new Error(`Bracket stalled at currentRound=${state.currentRound} currentMatch=${state.currentMatch}`);
      state = applyPick(state, match.players[0]);
    }
    const text = exportBracketText({ piM: state.playInMatches, rds: state.rounds, ch: state.champion });
    expect(text).toContain('CHAMPION:');
    expect(text).toContain('👑');
  });
});

describe('applyPick — validation', () => {
  it('rejects a movie not in the current match', () => {
    let state = resetState();
    PIP.forEach(() => { state = applyPick(state, state.playInMatches[state.playInIndex].players[0]); });
    const beforeCm = state.currentMatch;
    const beforeHistoryLength = state.history.length;
    const fakeMovie = { seed: 999, name: 'Fake', year: 2000, studio: 'Disney' as const, imdb: '' };
    const next = applyPick(state, fakeMovie);
    expect(next).toBe(state); // guard returns the same object reference
    expect(next.currentMatch).toBe(beforeCm); // match index did not advance
    expect(next.history).toHaveLength(beforeHistoryLength); // history did not grow
  });
});
