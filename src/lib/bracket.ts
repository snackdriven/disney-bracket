import { MAIN, PLAYIN, PIP, R1, RND, REG } from './data.js';
import type { Movie, Match, BracketState, Phase } from '../types.js';

/**
 * Build the initial Round of 64 matches from 6 play-in winners.
 */
export function buildInitialRounds(playinWinners: Movie[]): Match[][] {
  const arr = [...MAIN, ...playinWinners];
  return [R1.map(([a, b]) => [arr[a], arr[b]] as Match)];
}

/**
 * Apply a pick to the bracket state. Pure — takes state in, returns new state.
 */
export function applyPick(state: BracketState, winner: Movie): BracketState {
  const { ph, piM, piI, rds, cr, cm, hi, upsets } = state;
  const ip = ph === "pi";
  const mu = ip ? piM[piI] : rds[cr]?.[cm];

  const opponent = mu[0].seed === winner.seed ? mu[1] : mu[0];
  const isUpset = winner.seed > opponent.seed;

  const newHi = [...hi, { p: (ip ? "pi" : "m") as Phase, i: ip ? piI : cm, r: cr, wasUpset: isUpset }];
  const newUpsets = isUpset
    ? [...upsets, { winner, loser: opponent, round: ip ? "Play-In" : (RND[cr] || ""), seedDiff: winner.seed - opponent.seed }]
    : upsets;

  if (ip) {
    const nm = piM.map((m, i) => {
      if (i !== piI) return m;
      const c = [...m] as Match; c.winner = winner; return c;
    });
    if (piI + 1 >= 6) {
      const newRds = buildInitialRounds(nm.map(m => m.winner as Movie));
      return { ...state, ph: "m", piM: nm, rds: newRds, cr: 0, cm: 0, hi: newHi, upsets: newUpsets };
    }
    return { ...state, piM: nm, piI: piI + 1, hi: newHi, upsets: newUpsets };
  }

  const nr = rds.map((r, ri) => r.map((m, mi) => {
    if (ri !== cr || mi !== cm) return m;
    const c = [...m] as Match; c.winner = winner; return c;
  }));

  if (cm + 1 >= nr[cr].length) {
    const ws = nr[cr].map(m => m.winner as Movie);
    if (ws.length === 1) {
      return { ...state, rds: nr, ch: winner, hi: newHi, upsets: newUpsets };
    }
    const nx: Match[] = [];
    for (let i = 0; i < ws.length; i += 2) nx.push([ws[i], ws[i + 1]] as Match);
    nr.push(nx);
    return { ...state, rds: nr, cr: cr + 1, cm: 0, hi: newHi, upsets: newUpsets };
  }

  return { ...state, rds: nr, cm: cm + 1, hi: newHi, upsets: newUpsets };
}

/**
 * Undo the last pick. Pure — takes state in, returns new state.
 */
export function applyUndo(state: BracketState): BracketState {
  const { piM, rds, hi, upsets } = state;
  if (!hi.length) return state;

  const l = hi[hi.length - 1];
  const newHi = hi.slice(0, -1);
  const newUpsets = l.wasUpset ? upsets.slice(0, -1) : upsets;

  if (l.p === "pi") {
    const newPiM = piM.map((m, i) => {
      if (i !== l.i) return m;
      const c = [...m] as Match; delete c.winner; return c;
    });
    return { ...state, piM: newPiM, piI: l.i, ph: "pi", rds: [], ch: null, hi: newHi, upsets: newUpsets };
  }

  const nr = rds.slice(0, l.r + 1).map((r, ri) => r.map((m, mi) => {
    if (ri !== l.r || mi !== l.i) return m;
    const c = [...m] as Match; delete c.winner; return c;
  }));
  return { ...state, rds: nr, cr: l.r, cm: l.i, ch: null, hi: newHi, upsets: newUpsets };
}

/**
 * Return the clean initial bracket state.
 */
export function resetState(): BracketState {
  return {
    ph: "pi",
    piM: PIP.map(([a, b]) => [PLAYIN[a], PLAYIN[b]] as Match),
    piI: 0,
    rds: [],
    cr: 0,
    cm: 0,
    ch: null,
    hi: [],
    upsets: [],
  };
}

/**
 * Build display rounds for rendering, synthesizing missing rounds from winners.
 */
export function buildDisplayRds(rds: Match[][], piM: Match[]): Match[][] {
  const d = [...rds];
  if (!d[0]) {
    const arr: (Movie | null)[] = [...MAIN, ...(piM || []).map(m => m.winner ?? null)];
    d[0] = R1.map(([a, b]) => [arr[a] ?? null, arr[b] ?? null] as unknown as Match);
  }
  for (let r = 1; r < 5; r++) {
    if (d[r]) continue;
    const prev = d[r - 1];
    if (!prev) break;
    const next: Match[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      const w0 = prev[i]?.winner ?? null;
      const w1 = prev[i + 1]?.winner ?? null;
      next.push([w0, w1] as unknown as Match);
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
        const loser = m[0].seed === m.winner.seed ? m[1] : m[0];
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
        const loser = m[0].seed === m.winner.seed ? m[1] : m[0];
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
