import type { BracketState } from '../types';
import { resetState, canRerollSweet16 } from './bracket';
import { desMatch, serMatch, isMovie, isPhase, isHistoryEntry, isUpsetEntry } from './utils';

/** Keep readable v2 saves and the earlier abbreviated v1 format compatible. */
export function parseBracketState(raw: unknown): BracketState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = raw as Record<string, unknown>;
  if (!('phase' in d) && !('ph' in d) && !('_v' in d)) return null;
  const legacy = d._v === 1 || ('ph' in d && !('phase' in d));
  const value = (modern: string, old: string) => d[legacy ? old : modern];
  const initial = resetState();
  const playIn = desMatch(value('playInMatches', 'piM'));
  const rawRounds = value('rounds', 'rds');
  const phase = value('phase', 'ph');
  const champion = value('champion', 'ch');
  const history = value('history', 'hi');
  const number = (modern: string, old: string) => typeof value(modern, old) === 'number' ? value(modern, old) as number : 0;
  const state: BracketState = {
    ...initial,
    phase: isPhase(phase) ? phase : 'pi',
    playInMatches: playIn.length ? playIn : initial.playInMatches,
    playInIndex: number('playInIndex', 'piI'),
    rounds: Array.isArray(rawRounds) ? rawRounds.map(desMatch) : [],
    currentRound: number('currentRound', 'cr'), currentMatch: number('currentMatch', 'cm'),
    champion: isMovie(champion) ? champion : null,
    history: Array.isArray(history) ? history.filter(isHistoryEntry) : [],
    upsets: Array.isArray(d.upsets) ? d.upsets.filter(isUpsetEntry) : [],
    ...(d.sweet16Rerolled === true ? { sweet16Rerolled: true } : {}),
  };
  // A marked draw must still contain exactly its original R32 winners, even later in play.
  if (state.sweet16Rerolled && !canRerollSweet16(state)) return null;
  return state;
}

export function serializeBracketState(state: BracketState) {
  return {
    _v: 2, phase: state.phase, playInMatches: serMatch(state.playInMatches), playInIndex: state.playInIndex,
    rounds: state.rounds.map(serMatch), currentRound: state.currentRound, currentMatch: state.currentMatch,
    champion: state.champion, history: state.history, upsets: state.upsets,
    ...(state.sweet16Rerolled ? { sweet16Rerolled: true } : {}),
  };
}

export type SerializedBracketState = ReturnType<typeof serializeBracketState>;
