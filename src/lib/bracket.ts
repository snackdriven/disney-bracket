import { MAIN, PLAYIN, PIP, R1, RND, REG } from './data.js';
import type { Movie, Match, DisplayMatch, BracketState, Phase } from '../types.js';

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
    return { ...state, playInMatches: newPlayInMatches, playInIndex: lastEntry.matchIndex, phase: "pi", rounds: [], champion: null, history: newHistory, upsets: newUpsets };
  }

  const newRounds = rounds.slice(0, lastEntry.round + 1).map((r, ri) => r.map((m, mi) => {
    if (ri !== lastEntry.round || mi !== lastEntry.matchIndex) return m;
    return { players: m.players }; // drop winner
  }));
  return { ...state, rounds: newRounds, currentRound: lastEntry.round, currentMatch: lastEntry.matchIndex, champion: null, history: newHistory, upsets: newUpsets };
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
