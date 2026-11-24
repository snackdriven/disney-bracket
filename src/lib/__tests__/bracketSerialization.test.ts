import { describe, expect, it } from 'vitest';
import { applyPick, resetState } from '../bracket';
import { parseBracketState, serializeBracketState } from '../bracketSerialization';

function fixture(picks = 54) {
  let state = resetState();
  for (let i = 0; i < picks; i++) {
    const match = state.phase === 'pi' ? state.playInMatches[state.playInIndex] : state.rounds[state.currentRound][state.currentMatch];
    state = applyPick(state, match.players[0]);
  }
  return serializeBracketState(state);
}

describe('saved bracket integrity', () => {
  it.each([0, 1, 6, 38, 54, 55, 69])('accepts an intact v2 bracket at %i picks', picks => {
    const wire = fixture(picks);
    expect(parseBracketState(wire)?.history).toHaveLength(picks);
  });

  it('rejects a syntactically valid save with malformed rounds instead of erasing its data', () => {
    expect(parseBracketState({ ...fixture(), rounds: 'broken rounds' })).toBeNull();
  });

  it.each([-1, 6, 2.5])('rejects invalid currentRound %s', currentRound => {
    expect(parseBracketState({ ...fixture(), currentRound })).toBeNull();
  });

  it('rejects contradictory winners and a missing completed source match', () => {
    const wire = fixture();
    wire.rounds[1][0].w = wire.rounds[1][1].w;
    expect(parseBracketState(wire)).toBeNull();
    const missing = fixture();
    missing.rounds[0].pop();
    expect(parseBracketState(missing)).toBeNull();
  });

  it('rejects a cursor pointing outside its saved round and history inconsistent with results', () => {
    expect(parseBracketState({ ...fixture(), currentMatch: 8 })).toBeNull();
    expect(parseBracketState({ ...fixture(), history: [] })).toBeNull();
  });
});
