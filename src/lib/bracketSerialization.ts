import type { BracketState } from '../types';
import { resetState, canRerollSweet16, buildInitialRounds } from './bracket';
import { RND } from './data';
import type { HistoryEntry, Match, UpsetEntry } from '../types';
import { desMatch, serMatch, isMovie, isPhase, isHistoryEntry, isUpsetEntry } from './utils';

function consistentState(state: BracketState): boolean {
  if (!Number.isInteger(state.playInIndex) || state.playInIndex < 0 || state.playInIndex > 5 || state.playInMatches.length !== 6) return false;
  const history: HistoryEntry[] = [];
  const upsets: UpsetEntry[] = [];
  const checkMatch = (match: Match, decided: boolean, phase: 'pi' | 'm', round: number, matchIndex: number) => {
    if (match.players.length !== 2 || match.players[0].seed === match.players[1].seed || !!match.winner !== decided) return false;
    if (!match.winner) return true;
    if (!match.players.some(p => p.seed === match.winner!.seed)) return false;
    const loser = match.players.find(p => p.seed !== match.winner!.seed)!;
    const upset = match.winner.seed > loser.seed;
    history.push({ phase, round, matchIndex, wasUpset: upset });
    if (upset) upsets.push({ winner: match.winner, loser, seedDiff: match.winner.seed - loser.seed, round: phase === 'pi' ? 'Play-In' : RND[round] });
    return true;
  };
  for (let i = 0; i < 6; i++) {
    if (!checkMatch(state.playInMatches[i], state.phase === 'm' || i < state.playInIndex, 'pi', 0, i)) return false;
  }
  if (state.phase === 'pi') {
    if (state.champion || state.rounds.length || state.currentRound !== 0 || state.currentMatch !== 0) return false;
  } else {
    if (!Number.isInteger(state.currentRound) || state.currentRound < 0 || state.currentRound > 5 || state.rounds.length !== state.currentRound + 1) return false;
    if (state.playInIndex !== 5 || !Number.isInteger(state.currentMatch) || state.currentMatch < 0 || state.currentMatch >= state.rounds[state.currentRound].length) return false;
    for (let round = 0; round < state.rounds.length; round++) {
      const matches = state.rounds[round];
      if (matches.length !== 32 / 2 ** round) return false;
      const expected = round === 0 ? buildInitialRounds(state.playInMatches.map(m => m.winner!))[0].flatMap(m => m.players.map(p => p.seed))
        : state.rounds[round - 1].map(m => m.winner!.seed);
      const actual = matches.flatMap(m => m.players.map(p => p.seed));
      if (round === 2 && state.sweet16Rerolled) {
        if ([...expected].sort((a, b) => a - b).join() !== [...actual].sort((a, b) => a - b).join()) return false;
      } else if (expected.join() !== actual.join()) return false;
      for (let i = 0; i < matches.length; i++) {
        if (!checkMatch(matches[i], round < state.currentRound || i < state.currentMatch || !!state.champion, 'm', round, i)) return false;
      }
    }
    if (state.champion && (state.currentRound !== 5 || state.rounds[5][0].winner?.seed !== state.champion.seed)) return false;
  }
  return history.length === state.history.length && history.every((e, i) => e.phase === state.history[i].phase && e.round === state.history[i].round && e.matchIndex === state.history[i].matchIndex && e.wasUpset === state.history[i].wasUpset) && upsets.length === state.upsets.length &&
    upsets.every((u, i) => u.winner.seed === state.upsets[i].winner.seed && u.loser.seed === state.upsets[i].loser.seed && u.round === state.upsets[i].round && u.seedDiff === state.upsets[i].seedDiff);
}

/** Keep readable v2 saves and the earlier abbreviated v1 format compatible. */
export function parseBracketState(raw: unknown): BracketState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = raw as Record<string, unknown>;
  if (!('phase' in d) && !('ph' in d) && !('_v' in d)) return null;
  const legacy = d._v === 1 || ('ph' in d && !('phase' in d));
  if (!legacy) {
    if (!isPhase(d.phase)) return null;
    for (const key of ['playInIndex', 'currentRound', 'currentMatch']) {
      if (key in d && (typeof d[key] !== 'number' || !Number.isInteger(d[key]))) return null;
    }
    for (const key of ['playInMatches', 'rounds', 'history', 'upsets']) {
      if (key in d && !Array.isArray(d[key])) return null;
    }
    if ('champion' in d && d.champion !== null && !isMovie(d.champion)) return null;
    if (Array.isArray(d.playInMatches) && desMatch(d.playInMatches).length !== d.playInMatches.length) return null;
    if (Array.isArray(d.rounds) && d.rounds.some(r => !Array.isArray(r) || desMatch(r).length !== r.length)) return null;
    if (Array.isArray(d.history) && !d.history.every(isHistoryEntry)) return null;
    if (Array.isArray(d.upsets) && !d.upsets.every(isUpsetEntry)) return null;
  }
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
  if (!legacy && !consistentState(state)) return null;
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
