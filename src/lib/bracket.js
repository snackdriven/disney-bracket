import { MAIN, PLAYIN, PIP, R1, RND, REG } from './data.js';

/**
 * Build the initial Round of 64 matches from 6 play-in winners.
 * @param {object[]} playinWinners - Array of 6 winner movie objects (in play-in order)
 * @returns {object[][]} - First element is the R64 matches array
 */
export function buildInitialRounds(playinWinners) {
  const arr = [...MAIN, ...playinWinners];
  return [R1.map(([a, b]) => [arr[a], arr[b]])];
}

/**
 * Apply a pick to the bracket state. Pure — takes state in, returns new state.
 * @param {object} state - { ph, piM, piI, rds, cr, cm, ch, hi, upsets }
 * @param {object} winner - The movie object that was picked
 * @returns {object} New state after the pick
 */
export function applyPick(state, winner) {
  const { ph, piM, piI, rds, cr, cm, ch: _ch, hi, upsets } = state;
  const ip = ph === "pi";
  const mu = ip ? piM[piI] : rds[cr]?.[cm];

  const opponent = mu[0].seed === winner.seed ? mu[1] : mu[0];
  const isUpset = winner.seed > opponent.seed;

  const newHi = [...hi, { p: ip ? "pi" : "m", i: ip ? piI : cm, r: cr, wasUpset: isUpset }];
  const newUpsets = isUpset
    ? [...upsets, { winner, loser: opponent, round: ip ? "Play-In" : (RND[cr] || ""), seedDiff: winner.seed - opponent.seed }]
    : upsets;

  if (ip) {
    const nm = piM.map((m, i) => {
      if (i !== piI) return m;
      const c = [...m]; c.winner = winner; return c;
    });
    if (piI + 1 >= 6) {
      const newRds = buildInitialRounds(nm.map(m => m.winner));
      return { ...state, ph: "m", piM: nm, rds: newRds, cr: 0, cm: 0, hi: newHi, upsets: newUpsets };
    }
    return { ...state, piM: nm, piI: piI + 1, hi: newHi, upsets: newUpsets };
  }

  const nr = rds.map((r, ri) => r.map((m, mi) => {
    if (ri !== cr || mi !== cm) return m;
    const c = [...m]; c.winner = winner; return c;
  }));

  if (cm + 1 >= nr[cr].length) {
    const ws = nr[cr].map(m => m.winner);
    if (ws.length === 1) {
      return { ...state, rds: nr, ch: winner, hi: newHi, upsets: newUpsets };
    }
    const nx = [];
    for (let i = 0; i < ws.length; i += 2) nx.push([ws[i], ws[i + 1]]);
    nr.push(nx);
    return { ...state, rds: nr, cr: cr + 1, cm: 0, hi: newHi, upsets: newUpsets };
  }

  return { ...state, rds: nr, cm: cm + 1, hi: newHi, upsets: newUpsets };
}

/**
 * Undo the last pick. Pure — takes state in, returns new state.
 * @param {object} state - { ph, piM, piI, rds, cr, cm, ch, hi, upsets }
 * @returns {object} New state with the last pick reverted
 */
export function applyUndo(state) {
  const { piM, rds, hi, upsets } = state;
  if (!hi.length) return state;

  const l = hi[hi.length - 1];
  const newHi = hi.slice(0, -1);
  const newUpsets = l.wasUpset ? upsets.slice(0, -1) : upsets;

  if (l.p === "pi") {
    const newPiM = piM.map((m, i) => {
      if (i !== l.i) return m;
      const c = [...m]; delete c.winner; return c;
    });
    return { ...state, piM: newPiM, piI: l.i, ph: "pi", rds: [], ch: null, hi: newHi, upsets: newUpsets };
  }

  const nr = rds.slice(0, l.r + 1).map((r, ri) => r.map((m, mi) => {
    if (ri !== l.r || mi !== l.i) return m;
    const c = [...m]; delete c.winner; return c;
  }));
  return { ...state, rds: nr, cr: l.r, cm: l.i, ch: null, hi: newHi, upsets: newUpsets };
}

/**
 * Return the clean initial bracket state.
 * @returns {object}
 */
export function resetState() {
  return {
    ph: "pi",
    piM: PIP.map(([a, b]) => [PLAYIN[a], PLAYIN[b]]),
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
 * @param {object[][]} rds - Current rounds array
 * @param {object[]} piM - Play-in matches
 * @returns {object[][]} Display rounds (always has at least R64)
 */
export function buildDisplayRds(rds, piM) {
  const d = [...rds];
  if (!d[0]) {
    const arr = [...MAIN, ...(piM || []).map(m => m.winner || null)];
    d[0] = R1.map(([a, b]) => [arr[a] || null, arr[b] || null]);
  }
  for (let r = 1; r < 5; r++) {
    if (d[r]) continue;
    const prev = d[r - 1];
    if (!prev) break;
    const next = [];
    for (let i = 0; i < prev.length; i += 2) {
      const w0 = prev[i]?.winner || null;
      const w1 = prev[i + 1]?.winner || null;
      next.push([w0, w1]);
    }
    d[r] = next;
  }
  return d;
}

/**
 * Export bracket results as formatted text.
 * @param {object} param0 - { piM, rds, ch }
 * @returns {string}
 */
export function exportBracketText({ piM, rds, ch }) {
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
