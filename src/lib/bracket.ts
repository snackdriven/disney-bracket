import { MAIN, PLAYIN, PIP, R1, RND, REG } from './data.js';
import type { Movie, Match, DisplayMatch, BracketState, Phase } from '../types.js';

function pairKey(matches: Match[]): string {
  return matches.map(m => m.players.map(p => p.seed).sort((a, b) => a - b).join('-')).sort().join('|');
}

/** Validate the completed source rounds without excluding later progress. */
export function canRerollSweet16(state: BracketState): boolean {
  if (state.phase !== 'm' || state.currentRound < 2 || state.currentRound > 5) return false;
  const validCompleted = (matches: Match[] | undefined, count: number) =>
    matches?.length === count && matches.every(m => m.players?.length === 2 &&
      m.players[0]?.seed !== m.players[1]?.seed && m.winner &&
      m.players.some(p => p?.seed === m.winner?.seed));
  if (!validCompleted(state.playInMatches, 6) || !validCompleted(state.rounds[0], 32) || !validCompleted(state.rounds[1], 16)) return false;
  const winners = state.rounds[1].map(m => m.winner!.seed);
  if (new Set(winners).size !== 16) return false;
  const sourceWinners = state.rounds[0].map(m => m.winner!.seed).sort((a, b) => a - b);
  const sourcePlayers = state.rounds[1].flatMap(m => m.players.map(p => p.seed)).sort((a, b) => a - b);
  if (new Set(sourceWinners).size !== 32 || sourceWinners.join() !== sourcePlayers.join()) return false;
  const draw = state.rounds[2];
  if (draw?.length !== 8 || draw.some(m => m.players?.length !== 2 || !m.players[0] || !m.players[1])) return false;
  if (draw.flatMap(m => m.players.map(p => p.seed)).sort((a, b) => a - b).join() !== [...winners].sort((a, b) => a - b).join()) return false;
  const earlier = state.history.filter(e => e.phase === 'pi' || e.round < 2);
  if (earlier.length !== 54) return false;
  return earlier.every((e, i) => i < 6
    ? e.phase === 'pi' && e.matchIndex === i
    : e.phase === 'm' && e.round === (i < 38 ? 0 : 1) && e.matchIndex === (i < 38 ? i - 6 : i - 38));
}

/** Preview only: preserve the active bracket until the player confirms. */
export function buildSweet16Preview(state: BracketState, random: () => number = Math.random, previousPreview?: Match[]): Match[] {
  if (!canRerollSweet16(state)) return [];
  const players = state.rounds[1].map(m => m.winner!);
  for (let i = players.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [players[i], players[j]] = [players[j], players[i]];
  }
  const candidate: Match[] = [];
  for (let i = 0; i < players.length; i += 2) candidate.push({ players: [players[i], players[i + 1]] });
  const forbidden = new Set([pairKey(state.rounds[2]), ...(previousPreview ? [pairKey(previousPreview)] : [])]);
  if (!forbidden.has(pairKey(candidate))) return candidate;
  for (let i = 1; i < candidate.length; i++) {
    const alternative = candidate.map(m => ({ players: [...m.players] as [Movie, Movie] }));
    [alternative[0].players[1], alternative[i].players[1]] = [alternative[i].players[1], alternative[0].players[1]];
    if (!forbidden.has(pairKey(alternative))) return alternative;
  }
  return [];
}

/** Replace only Sweet 16 onward with the exact confirmed candidate. */
export function applySweet16Reroll(state: BracketState, candidate: Match[]): BracketState {
  if (!canRerollSweet16(state) || candidate.length !== 8 || candidate.some(m => m.winner || m.players?.length !== 2 || !m.players[0] || !m.players[1])) return state;
  const winners = state.rounds[1].map(m => m.winner!);
  const seeds = candidate.flatMap(m => m.players.map(p => p.seed));
  if (new Set(seeds).size !== 16 || seeds.sort((a, b) => a - b).join() !== winners.map(p => p.seed).sort((a, b) => a - b).join()) return state;
  if (pairKey(candidate) === pairKey(state.rounds[2])) return state;
  // Source winners remain authoritative for metadata as well as identity.
  const bySeed = new Map(winners.map(p => [p.seed, p]));
  const draw = candidate.map(m => ({ players: m.players.map(p => bySeed.get(p.seed)!) as [Movie, Movie] }));
  return {
    ...state, rounds: [...state.rounds.slice(0, 2), draw], currentRound: 2, currentMatch: 0,
    champion: null, sweet16Rerolled: true,
    history: state.history.filter(e => e.phase === 'pi' || e.round < 2),
    upsets: state.upsets.filter(u => ['Play-In', RND[0], RND[1]].includes(u.round)),
  };
}

/**
 * Build the initial Round of 64 matches from 6 play-in winners.
 */
export function buildInitialRounds(playinWinners: Movie[]): Match[][] {
  const arr = [...MAIN, ...playinWinners];
  return [R1.map(([a, b]) => ({ players: [arr[a], arr[b]] }))];
}

/**
 * Apply a pick to the bracket state. Pure — takes state in, returns new state.
 */
export function applyPick(state: BracketState, winner: Movie): BracketState {
  const { phase, playInMatches, playInIndex, rounds, currentRound, currentMatch, history, upsets } = state;
  const isPlayIn = phase === "pi";
  const currentMatchup = isPlayIn ? playInMatches[playInIndex] : rounds[currentRound]?.[currentMatch];

  const [p0, p1] = currentMatchup?.players ?? [];
  if (!currentMatchup || (winner.seed !== p0.seed && winner.seed !== p1.seed)) return state;

  const opponent = p0.seed === winner.seed ? p1 : p0;
  const isUpset = winner.seed > opponent.seed;

  const newHistory = [...history, { phase: (isPlayIn ? "pi" : "m") as Phase, matchIndex: isPlayIn ? playInIndex : currentMatch, round: currentRound, wasUpset: isUpset }];
  const newUpsets = isUpset
    ? [...upsets, { winner, loser: opponent, round: isPlayIn ? "Play-In" : (RND[currentRound] || ""), seedDiff: winner.seed - opponent.seed }]
    : upsets;

  if (isPlayIn) {
    const newPlayInMatches = playInMatches.map((m, i) => {
      if (i !== playInIndex) return m;
      return { ...m, winner };
    });
    if (playInIndex + 1 >= 6) {
      const newRounds = buildInitialRounds(newPlayInMatches.map(m => m.winner as Movie));
      return { ...state, phase: "m", playInMatches: newPlayInMatches, rounds: newRounds, currentRound: 0, currentMatch: 0, history: newHistory, upsets: newUpsets };
    }
    return { ...state, playInMatches: newPlayInMatches, playInIndex: playInIndex + 1, history: newHistory, upsets: newUpsets };
  }

  const newRounds = rounds.map((r, ri) => r.map((m, mi) => {
    if (ri !== currentRound || mi !== currentMatch) return m;
    return { ...m, winner };
  }));

  if (currentMatch + 1 >= newRounds[currentRound].length) {
    const winners = newRounds[currentRound].map(m => m.winner as Movie);
    if (winners.length === 1) {
      return { ...state, rounds: newRounds, champion: winner, history: newHistory, upsets: newUpsets };
    }
    const nextRound: Match[] = [];
    for (let i = 0; i < winners.length; i += 2) nextRound.push({ players: [winners[i], winners[i + 1]] });
    newRounds.push(nextRound);
    return { ...state, rounds: newRounds, currentRound: currentRound + 1, currentMatch: 0, history: newHistory, upsets: newUpsets };
  }

  return { ...state, rounds: newRounds, currentMatch: currentMatch + 1, history: newHistory, upsets: newUpsets };
}

/**
 * Undo the last pick. Pure — takes state in, returns new state.
 */
export function applyUndo(state: BracketState): BracketState {
  const { playInMatches, rounds, history, upsets } = state;
  if (!history.length) return state;

  const lastEntry = history[history.length - 1];
  const newHistory = history.slice(0, -1);
  const newUpsets = lastEntry.wasUpset ? upsets.slice(0, -1) : upsets;

  if (lastEntry.phase === "pi") {
    const newPlayInMatches = playInMatches.map((m, i) => {
      if (i !== lastEntry.matchIndex) return m;
      return { players: m.players }; // drop winner
    });
    return { ...state, sweet16Rerolled: false, playInMatches: newPlayInMatches, playInIndex: lastEntry.matchIndex, phase: "pi", rounds: [], champion: null, history: newHistory, upsets: newUpsets };
  }

  const newRounds = rounds.slice(0, lastEntry.round + 1).map((r, ri) => r.map((m, mi) => {
    if (ri !== lastEntry.round || mi !== lastEntry.matchIndex) return m;
    return { players: m.players }; // drop winner
  }));
  return { ...state, sweet16Rerolled: lastEntry.round >= 2 && state.sweet16Rerolled, rounds: newRounds, currentRound: lastEntry.round, currentMatch: lastEntry.matchIndex, champion: null, history: newHistory, upsets: newUpsets };
}

/**
 * Return the clean initial bracket state.
 */
export function resetState(): BracketState {
  return {
    phase: "pi",
    playInMatches: PIP.map(([a, b]) => ({ players: [PLAYIN[a], PLAYIN[b]] })),
    playInIndex: 0,
    rounds: [],
    currentRound: 0,
    currentMatch: 0,
    champion: null,
    history: [],
    upsets: [],
  };
}

/**
 * Build display rounds for rendering, synthesizing missing rounds from winners.
 */
export function buildDisplayRds(rds: Match[][], piM: Match[]): DisplayMatch[][] {
  // Match is structurally compatible with DisplayMatch (Movie is assignable to Movie | null),
  // but TypeScript needs a double cast to accept it.
  const d: DisplayMatch[][] = rds.map(r => r as unknown as DisplayMatch[]);
  if (!d[0]) {
    const arr: (Movie | null)[] = [...MAIN, ...(piM || []).map(m => m.winner ?? null)];
    d[0] = R1.map(([a, b]) => ({ players: [arr[a] ?? null, arr[b] ?? null] }));
  }
  for (let r = 1; r < 5; r++) {
    if (d[r]) continue;
    const prev = d[r - 1];
    if (!prev) break;
    const next: DisplayMatch[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      const w0 = prev[i]?.winner ?? null;
      const w1 = prev[i + 1]?.winner ?? null;
      next.push({ players: [w0, w1] });
    }
    d[r] = next;
  }
  return d;
}

/**
 * Export bracket results as formatted text.
 */
export function exportBracketText({ piM, rds, ch }: { piM: Match[]; rds: Match[][]; ch: Movie | null }): string {
  const lines = ["🎬 Disney & Pixar: The Bracket — My Results", ""];
  if (piM.some(m => m.winner)) {
    lines.push("PLAY-IN ROUND");
    piM.forEach(m => {
      if (m.winner) {
        const loser = m.players[0].seed === m.winner.seed ? m.players[1] : m.players[0];
        lines.push(`  ${m.winner.name} def. ${loser.name}`);
      }
    });
    lines.push("");
  }
  rds.forEach((rd, ri) => {
    if (!rd.some(m => m.winner)) return;
    lines.push(ri === 0 ? "ROUND OF 64" : RND[ri].toUpperCase());
    rd.forEach((m, mi) => {
      if (m.winner) {
        const loser = m.players[0].seed === m.winner.seed ? m.players[1] : m.players[0];
        const note = ri === 0 ? ` · ${REG[Math.floor(mi / 8)]}` : "";
        lines.push(`  ${m.winner.name} def. ${loser.name}${note}`);
      }
    });
    lines.push("");
  });
  if (ch) {
    lines.push(`CHAMPION: ${ch.name} 👑`);
    lines.push(`  #${ch.seed} seed · ${ch.studio} · ${ch.year}`);
  }
  return lines.join("\n");
}
