import { REG } from './data.js';
import { buildDisplayRds } from './bracket.js';

// Canvas export constants — 1920×1080
export const CW = 1920, CH = 1080;
export const CSW = 160, CSH = 26, CGAP = 4, CMH = 56; // slot/match dims
export const CPW = 22, CPH = 24;                       // poster dims
export const CSTEP = 185;                              // column step (CSW + 25px gap)
export const CBT = 60, CBH = 900;                      // bracket top Y, bracket height

export const clx = r => 10 + r * CSTEP;               // left column x at round r
export const crx = r => CW - 10 - CSW - r * CSTEP;   // right column x at round r
export const cps = r => Math.round(16 / Math.pow(2, r)); // matches per side at round r
export const cmty = (r, i) => {                        // match top Y: round r, position i within side
  const sp = CBH / cps(r);
  return Math.round(CBT + sp * (i + 0.5) - CMH / 2);
};

const CLR = {
  Disney: { bg:"#0d0d1e", ac:"#9d8fe0", gl:"rgba(157,143,224,.25)", tx:"#b8b0e8" },
  Pixar:  { bg:"#0d0d1e", ac:"#9d8fe0", gl:"rgba(157,143,224,.25)", tx:"#b8b0e8" },
};

function cBg(ctx) {
  const grad = ctx.createLinearGradient(0, 0, CW, CH);
  grad.addColorStop(0, "#06060f");
  grad.addColorStop(0.4, "#0e0e24");
  grad.addColorStop(0.7, "#180a20");
  grad.addColorStop(1, "#06060f");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CW, CH);
}

function cHeader(ctx) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#4fc3f7";
  ctx.font = "bold 18px Inter, sans-serif";
  ctx.fillText("Disney & Pixar: The Bracket", CW / 2, 24);
  ctx.fillStyle = "#6a6a8e";
  ctx.font = "10px Inter, sans-serif";
  ctx.fillText("70 movies · 69 matchups · 1 champion", CW / 2, 40);
}

function cRoundLabels(ctx) {
  const labels = ["R64", "R32", "Sweet 16", "Elite 8", "Final Four"];
  ctx.fillStyle = "#5a5a7e";
  ctx.font = "9px Inter, sans-serif";
  ctx.textAlign = "center";
  labels.forEach((lbl, r) => {
    ctx.fillText(lbl, clx(r) + CSW / 2, 54);
    ctx.fillText(lbl, crx(r) + CSW / 2, 54);
  });
}

function cRegionLabels(ctx) {
  const colors = ["#4fc3f7", "#ce93d8", "#ff8a65", "#4fc3f7"];
  REG.forEach((name, ri) => {
    const side = ri < 2 ? "left" : "right";
    const regionInSide = ri % 2;
    const startI = regionInSide * 8;
    const topY = cmty(0, startI);
    const botY = cmty(0, startI + 7) + CMH;
    const y = (topY + botY) / 2;
    const x = side === "left" ? 6 : CW - 8;
    ctx.fillStyle = colors[ri];
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(name, 0, 4);
    ctx.restore();
  });
}

function cConnectors(ctx, side) {
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let r = 0; r < 4; r++) {
    const perSide = cps(r);
    for (let j = 0; j < perSide / 2; j++) {
      const cy0 = cmty(r, j * 2) + CMH / 2;
      const cy1 = cmty(r, j * 2 + 1) + CMH / 2;
      const yMid = (cy0 + cy1) / 2;
      let xFrom, xTo;
      if (side === "left") {
        xFrom = clx(r) + CSW;
        xTo   = clx(r + 1);
      } else {
        xFrom = crx(r);
        xTo   = crx(r + 1) + CSW;
      }
      const xMid = (xFrom + xTo) / 2;
      ctx.beginPath();
      ctx.moveTo(xFrom, cy0);
      ctx.lineTo(xMid, cy0);
      ctx.lineTo(xMid, yMid);
      ctx.lineTo(xTo, yMid);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(xFrom, cy1);
      ctx.lineTo(xMid, cy1);
      ctx.stroke();
    }
  }
}

function cSlot(ctx, x, y, movie, won, lost, isUpset, imgs) {
  const c = movie ? CLR[movie.studio] : { bg: "#0d0d20", ac: "#3a3a5e", tx: "#5a5a7e" };
  ctx.fillStyle = won
    ? (isUpset ? "#3e1a0d" : "#1a1a0d")
    : lost ? "rgba(0,0,0,0.3)"
    : c.bg + "cc";
  ctx.beginPath();
  ctx.roundRect(x, y, CSW, CSH, 4);
  ctx.fill();
  ctx.strokeStyle = won ? (isUpset ? "#ff8a65" : "#4fc3f7") : lost ? "rgba(255,255,255,0.04)" : `${c.ac}40`;
  ctx.lineWidth = won ? 1.5 : 1;
  ctx.stroke();
  if (!movie) {
    ctx.fillStyle = "#3a3a5e";
    ctx.font = "8px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("TBD", x + 6, y + CSH / 2 + 3);
    return;
  }
  const img = imgs?.[movie.seed];
  let textX = x + 5;
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x + 3, y + (CSH - CPH) / 2, CPW, CPH, 2);
    ctx.clip();
    ctx.drawImage(img, x + 3, y + (CSH - CPH) / 2, CPW, CPH);
    ctx.restore();
    textX = x + CPW + 5;
  }
  ctx.fillStyle = won ? (isUpset ? "#ff8a65" : "#4fc3f7") : lost ? "#3a3a5e" : c.ac + "aa";
  ctx.font = "bold 7px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`#${movie.seed}`, textX, y + 9);
  ctx.fillStyle = won ? "#f0f0ff" : lost ? "#3a3a5e" : "#c0c0e0";
  ctx.font = `${won ? "bold " : ""}9px Inter, sans-serif`;
  const maxW = CSW - (textX - x) - 4;
  let name = movie.name;
  while (name.length > 3 && ctx.measureText(name).width > maxW) name = name.slice(0, -1);
  if (name !== movie.name) name = name.trim() + "…";
  ctx.fillText(name, textX, y + 18);
  ctx.fillStyle = lost ? "#2a2a40" : "#5a5a7e";
  ctx.font = "7px Inter, sans-serif";
  ctx.fillText(movie.year, textX, y + 24);
}

function cMatch(ctx, x, y, m, isUpset0, isUpset1, imgs) {
  const w0 = !!m?.winner && m.winner.seed === m?.[0]?.seed;
  const w1 = !!m?.winner && m.winner.seed === m?.[1]?.seed;
  cSlot(ctx, x, y, m?.[0], w0, !w0 && !!m?.winner, isUpset0, imgs);
  cSlot(ctx, x, y + CSH + CGAP, m?.[1], w1, !w1 && !!m?.winner, isUpset1, imgs);
}

function cSide(ctx, side, rds, upsets, imgs) {
  for (let r = 0; r < 5; r++) {
    const round = rds[r] || null;
    const perSide = cps(r);
    const offset = side === "right" ? perSide : 0;
    const x = side === "left" ? clx(r) : crx(r);
    for (let i = 0; i < perSide; i++) {
      const m = round?.[offset + i] || null;
      const y = cmty(r, i);
      const isUpset0 = m?.winner?.seed === m?.[0]?.seed && m?.[0]?.seed > m?.[1]?.seed;
      const isUpset1 = m?.winner?.seed === m?.[1]?.seed && m?.[1]?.seed > m?.[0]?.seed;
      cMatch(ctx, x, y, m, isUpset0, isUpset1, imgs);
    }
  }
}

function cChamp(ctx, ch, imgs) {
  const ffY = cmty(4, 0) + CMH / 2;
  const bW = 100, bH = 80;
  const bX = clx(4) + CSW;
  const bY = ffY - bH / 2;
  ctx.fillStyle = "rgba(255,213,79,0.06)";
  ctx.strokeStyle = "rgba(255,213,79,0.3)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bX, bY, bW, bH, 0);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = "15px Inter, sans-serif";
  ctx.fillText("👑", bX + bW / 2, bY + 20);
  if (ch) {
    const img = imgs?.[ch.seed];
    if (img) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(bX + bW / 2 - 13, bY + 24, 26, 36, 3);
      ctx.clip();
      ctx.drawImage(img, bX + bW / 2 - 13, bY + 24, 26, 36);
      ctx.restore();
    }
    ctx.fillStyle = "#4fc3f7";
    ctx.font = "bold 8px Inter, sans-serif";
    const champName = ch.name.length > 14 ? ch.name.slice(0, 12) + "…" : ch.name;
    ctx.fillText(champName, bX + bW / 2, bY + 72);
  } else {
    ctx.fillStyle = "#5a5a7e";
    ctx.font = "8px Inter, sans-serif";
    ctx.fillText("Champion", bX + bW / 2, bY + 50);
  }
}

function cPlayin(ctx, piM, imgs) {
  if (!piM?.length) return;
  const pY = 978;
  ctx.fillStyle = "#5a5a7e";
  ctx.font = "bold 9px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Play-In Round", CW / 2, pY - 6);
  const mGap = 8;
  const totalW = piM.length * CSW + (piM.length - 1) * mGap;
  const startX = (CW - totalW) / 2;
  piM.forEach((m, i) => {
    const x = startX + i * (CSW + mGap);
    const isUpset0 = m?.winner?.seed === m?.[0]?.seed && m?.[0]?.seed > m?.[1]?.seed;
    const isUpset1 = m?.winner?.seed === m?.[1]?.seed && m?.[1]?.seed > m?.[0]?.seed;
    cMatch(ctx, x, pY, m, isUpset0, isUpset1, imgs);
  });
}

/**
 * Draw the full bracket onto a canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {object} state - { rds, piM, ch, upsets, imgs }
 */
export function drawBracket(canvas, { rds, piM, ch, upsets, imgs }) {
  const ctx = canvas.getContext("2d");
  const displayRds = buildDisplayRds(rds, piM);
  cBg(ctx);
  cHeader(ctx);
  cRoundLabels(ctx);
  cRegionLabels(ctx);
  cConnectors(ctx, "left");
  cConnectors(ctx, "right");
  cSide(ctx, "left", displayRds, upsets, imgs);
  cSide(ctx, "right", displayRds, upsets, imgs);
  cChamp(ctx, ch, imgs);
  cPlayin(ctx, piM, imgs);
}
