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

// Build a valid set of 6 play-in winners (one from each pair)
function makePlayinWinners() {
  return PIP.map(([a]) => PLAYIN[a]);
}

function freshState(): BracketState {
  return resetState();
}

// State after all 6 play-in picks
function stateAfterPlayin(): BracketState {
  let state = freshState();
  PIP.forEach(([a]) => {
    state = applyPick(state, PLAYIN[a]);
  });
  return state;
}

describe('buildInitialRounds', () => {
  it('returns array with one element (R64)', () => {
    const winners = makePlayinWinners();
    const rounds = buildInitialRounds(winners);
    expect(rounds.length).toBe(1);
  });

  it('R64 has 32 matches', () => {
    const winners = makePlayinWinners();
    const [r64] = buildInitialRounds(winners);
    expect(r64.length).toBe(32);
  });

  it('each match in R64 has two movies', () => {
    const winners = makePlayinWinners();
    const [r64] = buildInitialRounds(winners);
    r64.forEach(match => {
      expect(match.length).toBe(2);
      expect(match[0]).toBeDefined();
      expect(match[1]).toBeDefined();
    });
  });

  it('includes play-in winners in the correct slots', () => {
    const winners = makePlayinWinners();
    const [r64] = buildInitialRounds(winners);
    // R1 indices >= 58 map to play-in winners (index - 58)
    R1.forEach(([a, b], i) => {
      if (a >= 58) expect(r64[i][0]).toBe(winners[a - 58]);
      if (b >= 58) expect(r64[i][1]).toBe(winners[b - 58]);
    });
  });
});

describe('applyPick — play-in phase', () => {
  it('advances piI after a pick', () => {
    const state = freshState();
    const winner = state.piM[0][0];
    const next = applyPick(state, winner);
    expect(next.piI).toBe(1);
    expect(next.ph).toBe('pi');
  });

  it('stores winner on the match', () => {
    const state = freshState();
    const winner = state.piM[0][0];
    const next = applyPick(state, winner);
    expect(next.piM[0].winner).toBe(winner);
  });

  it('adds entry to history', () => {
    const state = freshState();
    const winner = state.piM[0][0];
    const next = applyPick(state, winner);
    expect(next.hi.length).toBe(1);
    expect(next.hi[0].p).toBe('pi');
  });

  it('6th play-in pick transitions to main bracket (ph = "m")', () => {
    const state = stateAfterPlayin();
    expect(state.ph).toBe('m');
    expect(state.cr).toBe(0);
    expect(state.cm).toBe(0);
    expect(state.rds.length).toBe(1);
    expect(state.rds[0].length).toBe(32);
  });

  it('history has 6 entries after all play-in picks', () => {
    const state = stateAfterPlayin();
    expect(state.hi.length).toBe(6);
  });
});

describe('applyPick — main bracket', () => {
  it('advances cm within a round', () => {
    const state = stateAfterPlayin();
    const winner = state.rds[0][0][0];
    const next = applyPick(state, winner);
    expect(next.cm).toBe(1);
    expect(next.cr).toBe(0);
    expect(next.rds[0][0].winner).toBe(winner);
  });

  it('winner slots into next round when round completes', () => {
    let state = stateAfterPlayin();
    // Pick all 32 R64 matches
    for (let i = 0; i < 32; i++) {
      const winner = state.rds[state.cr][state.cm][0];
      state = applyPick(state, winner);
    }
    expect(state.cr).toBe(1);
    expect(state.cm).toBe(0);
    expect(state.rds.length).toBe(2);
    expect(state.rds[1].length).toBe(16);
  });

  it('detects upset when lower seed beats higher seed', () => {
    const state = stateAfterPlayin();
    const baseUpsets = state.upsets.length;
    // Find a match where [1] has a higher seed number than [0]
    let upsetState = state;
    let upsetFound = false;
    for (let i = 0; i < state.rds[0].length; i++) {
      const m = state.rds[0][i];
      if (m[1].seed > m[0].seed) {
        upsetState = applyPick(state, m[1]);
        upsetFound = true;
        break;
      }
    }
    expect(upsetFound).toBe(true);
    expect(upsetState.upsets.length).toBe(baseUpsets + 1);
    expect(upsetState.upsets[upsetState.upsets.length - 1].seedDiff).toBeGreaterThan(0);
  });

  it('normal pick does not add to upsets array', () => {
    const state = stateAfterPlayin();
    const baseUpsets = state.upsets.length;
    const m = state.rds[0][0];
    const strongerSeed = m[0].seed < m[1].seed ? m[0] : m[1];
    const next = applyPick(state, strongerSeed);
    expect(next.upsets.length).toBe(baseUpsets);
  });
});

describe('applyPick — championship', () => {
  function playFullBracket(state: BracketState): BracketState {
    // Play through all rounds until champion
    while (!state.ch) {
      const round = state.rds[state.cr];
      if (!round) break;
      const match = round[state.cm];
      if (!match) break;
      state = applyPick(state, match[0]);
    }
    return state;
  }

  it('sets ch when championship match is decided', () => {
    let state = stateAfterPlayin();
    state = playFullBracket(state);
    expect(state.ch).toBeDefined();
    expect(state.ch).not.toBeNull();
    expect(state.ch!.seed).toBeDefined();
  });

  it('ch is cr 5 winner (championship round)', () => {
    let state = stateAfterPlayin();
    state = playFullBracket(state);
    // cr should have advanced through all rounds
    expect(state.hi.length).toBe(69); // 6 play-in + 63 main
  });
});

describe('applyUndo', () => {
  it('returns same state if history is empty', () => {
    const state = freshState();
    const undone = applyUndo(state);
    expect(undone).toBe(state);
  });

  it('reverts last play-in pick', () => {
    const state = freshState();
    const winner = state.piM[0][0];
    const picked = applyPick(state, winner);
    const undone = applyUndo(picked);
    expect(undone.piI).toBe(0);
    expect(undone.ph).toBe('pi');
    expect(undone.piM[0].winner).toBeUndefined();
    expect(undone.hi.length).toBe(0);
  });

  it('reverts last main-bracket pick', () => {
    let state = stateAfterPlayin();
    const winner = state.rds[0][0][0];
    state = applyPick(state, winner);
    const undone = applyUndo(state);
    expect(undone.cm).toBe(0);
    expect(undone.cr).toBe(0);
    expect(undone.rds[0][0].winner).toBeUndefined();
    expect(undone.hi.length).toBe(6); // back to just the 6 play-in picks
  });

  it('clears ch when undoing championship pick', () => {
    let state = stateAfterPlayin();
    // Pick all but verify last pick gives ch
    while (!state.ch) {
      const match = state.rds[state.cr]?.[state.cm];
      if (!match) break;
      state = applyPick(state, match[0]);
    }
    expect(state.ch).not.toBeNull();
    const undone = applyUndo(state);
    expect(undone.ch).toBeNull();
  });

  it('removes upset from upsets array when reverting an upset pick', () => {
    const state = stateAfterPlayin();
    const baseUpsets = state.upsets.length;
    // Find and make an upset pick in R64
    let upsetState: BracketState | null = null;
    for (let i = 0; i < state.rds[0].length; i++) {
      const m = state.rds[0][i];
      if (m[1].seed > m[0].seed) {
        upsetState = applyPick(state, m[1]);
        break;
      }
    }
    expect(upsetState!.upsets.length).toBe(baseUpsets + 1);
    const undone = applyUndo(upsetState!);
    expect(undone.upsets.length).toBe(baseUpsets);
  });

  it('undoing 5th play-in pick reverts piI from 5 to 4', () => {
    // Picks 5 play-in matches (still in play-in phase), then undoes the last one
    let state = freshState();
    for (let i = 0; i < 5; i++) {
      state = applyPick(state, state.piM[state.piI][0]);
    }
    expect(state.piI).toBe(5);
    expect(state.ph).toBe('pi');
    const undone = applyUndo(state);
    expect(undone.piI).toBe(4);
    expect(undone.ph).toBe('pi');
  });
});

describe('resetState', () => {
  it('returns initial play-in state', () => {
    const state = resetState();
    expect(state.ph).toBe('pi');
    expect(state.piI).toBe(0);
    expect(state.cr).toBe(0);
    expect(state.cm).toBe(0);
    expect(state.ch).toBeNull();
    expect(state.hi).toEqual([]);
    expect(state.upsets).toEqual([]);
    expect(state.rds).toEqual([]);
  });

  it('piM is initialized from PIP', () => {
    const state = resetState();
    expect(state.piM.length).toBe(6);
    PIP.forEach(([a, b], i) => {
      expect(state.piM[i][0]).toBe(PLAYIN[a]);
      expect(state.piM[i][1]).toBe(PLAYIN[b]);
    });
  });
});

describe('buildDisplayRds', () => {
  it('synthesizes R64 when rds is empty', () => {
    const state = freshState();
    const display = buildDisplayRds(state.rds, state.piM);
    expect(display[0]).toBeDefined();
    expect(display[0].length).toBe(32);
  });

  it('returns existing rounds when present', () => {
    const state = stateAfterPlayin();
    const winner = state.rds[0][0][0];
    const picked = applyPick(state, winner);
    const display = buildDisplayRds(picked.rds, picked.piM);
    expect(display[0][0].winner).toBe(winner);
  });

  it('synthesizes future rounds from winners', () => {
    let state = stateAfterPlayin();
    // Pick all 32 R64 matches
    for (let i = 0; i < 32; i++) {
      state = applyPick(state, state.rds[state.cr][state.cm][0]);
    }
    // Now rds has 2 rounds, but buildDisplayRds should project further
    const display = buildDisplayRds(state.rds, state.piM);
    expect(display[0]).toBeDefined();
    expect(display[1]).toBeDefined();
  });
});

describe('exportBracketText', () => {
  it('starts with the correct header', () => {
    const text = exportBracketText({ piM: freshState().piM, rds: [], ch: null });
    expect(text).toContain('🎬 Disney & Pixar: The Bracket — My Results');
  });

  it('includes play-in results when picks exist', () => {
    const state = stateAfterPlayin();
    const text = exportBracketText({ piM: state.piM, rds: state.rds, ch: state.ch });
    expect(text).toContain('PLAY-IN ROUND');
    expect(text).toContain('def.');
  });

  it('includes main bracket rounds', () => {
    let state = stateAfterPlayin();
    // Pick a few R64 matches
    for (let i = 0; i < 8; i++) {
      state = applyPick(state, state.rds[state.cr][state.cm][0]);
    }
    const text = exportBracketText({ piM: state.piM, rds: state.rds, ch: state.ch });
    expect(text).toContain('ROUND OF 64');
  });

  it('includes champion line when bracket is complete', () => {
    let state = stateAfterPlayin();
    while (!state.ch) {
      const match = state.rds[state.cr]?.[state.cm];
      if (!match) break;
      state = applyPick(state, match[0]);
    }
    const text = exportBracketText({ piM: state.piM, rds: state.rds, ch: state.ch });
    expect(text).toContain('CHAMPION:');
    expect(text).toContain('👑');
  });

  it('includes region labels in R64 section', () => {
    let state = stateAfterPlayin();
    state = applyPick(state, state.rds[0][0][0]);
    const text = exportBracketText({ piM: state.piM, rds: state.rds, ch: state.ch });
    // R64 entries include region suffix like "· Legends & Legacies"
    expect(text).toMatch(/·\s+\w/);
  });
});

// Ensure MAIN export is actually used (suppresses unused import warning)
const _mainCheck = MAIN.length;
void _mainCheck;
