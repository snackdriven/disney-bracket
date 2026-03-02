import { MAIN, PLAYIN, PIP, R1, RND, REG } from '../lib/data.js';
import { MN } from './BV.js';
import type { Movie, Match } from '../types.js';

interface FullBracketProps {
  playInMatches: Match[];
  rounds: Match[][];
  pool64: Movie[];
  currentRound: number;
  currentMatch: number;
  isPlayIn: boolean;
  mob: boolean;
  upsets: { seedDiff: number; winner: Movie; loser: Movie }[];
}

export function FullBracket({ playInMatches, rounds, pool64, currentRound, currentMatch, isPlayIn, mob, upsets }: FullBracketProps) {
  const hasM64 = pool64.length >= 64;
  const r1Display = R1.map(([a,b],i) => {
    if (hasM64) return { a: pool64[a], b: pool64[b], region: Math.floor(i/8), aSlot: a, bSlot: b };
    const ma = a < 58 ? MAIN[a] : null;
    const mb = b < 58 ? MAIN[b] : null;
    return { a: ma, b: mb, region: Math.floor(i/8), aSlot: a, bSlot: b };
  });

  const r1Played = rounds[0] || [];

  const regColors = ["#4fc3f7","#ce93d8","#ff8a65","#4fc3f7"];
  const rowFs = mob ? 13 : 12;
  const rowPad = mob ? "5px 8px" : "4px 8px";
  const rowGap = 6;
  const vsFs = mob ? 10 : 9;
  const ellipsis = mob ? { overflow:"hidden" as const, textOverflow:"ellipsis" as const, whiteSpace:"nowrap" as const } : {};

  const headCls = [
    "uppercase font-bold border-b border-white/[0.06] pb-[6px]",
    mob ? "text-[12px] tracking-[1.5px] mb-[8px]" : "text-[11px] tracking-[2px] mb-[8px]",
  ].join(" ");

  const regionCls = mob ? "mb-[16px]" : "mb-[20px]";

  const piLabel = (slot: number) => {
    const piIdx = slot - 58;
    const pair = PIP[piIdx];
    if (!pair) return "TBD";
    const a = PLAYIN[pair[0]], b = PLAYIN[pair[1]];
    const match = playInMatches[piIdx];
    if (match?.winner) return match.winner.name;
    return `${a.name} / ${b.name}`;
  };

  return (
    <div
      className={[
        "bg-white/[0.03] border border-white/[0.06] animate-[fi_.3s]",
        mob ? "mb-[20px] p-[14px] rounded-[14px]" : "mb-[28px] p-[20px] rounded-[16px]",
      ].join(" ")}
    >
      <div className="flex items-baseline justify-between flex-wrap gap-[8px] mb-[6px]">
        <h3 className={[
          "mt-0 font-bold text-[#d0d0e8] tracking-[0.5px]",
          mob ? "text-[16px]" : "text-[16px]",
        ].join(" ")}>
          Full Bracket
        </h3>
        {upsets?.length > 0 && (
          <span className={[
            "text-[#ff8a65] opacity-80 tracking-[1px]",
            mob ? "text-[11px]" : "text-[10px]",
          ].join(" ")}>
            ⚡ {upsets.length} upset{upsets.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className={[
        "text-[#7a7a9e]",
        mob ? "text-[13px] mb-[16px]" : "text-[12px] mb-[20px]",
      ].join(" ")}>
        {mob ? "4 regions · Final Four · Championship" : "70 movies · 4 regions · Winners from each region meet in the Final Four"}
      </div>

      <div className={regionCls}>
        <div className={headCls} style={{ color: "#4fc3f7", opacity: 0.8 }}>🎬 Play-In Round</div>
        {playInMatches.map((m, i) => {
          const w = m.winner;
          const isUpset = w && w.seed > (w.seed === m.players[0].seed ? m.players[1] : m.players[0]).seed;
          return (
            <div
              key={i}
              className={[
                "flex items-center rounded-[6px]",
                isPlayIn && i === 0 && !w ? "bg-[rgba(79,195,247,.06)]" : "bg-transparent",
              ].join(" ")}
              style={{ gap: rowGap, fontSize: rowFs, padding: rowPad }}
            >
              <MN movie={m.players[0]} winner={w} alignRight mob={mob} upset={!!(isUpset && w?.seed === m.players[0].seed)} />
              <span className="text-[#3a3a55] shrink-0 tracking-[1px]" style={{ fontSize: vsFs }}>vs</span>
              <MN movie={m.players[1]} winner={w} mob={mob} upset={!!(isUpset && w?.seed === m.players[1].seed)} />
              {w && (
                <span className="opacity-60 ml-[2px]" style={{ fontSize: vsFs, color: isUpset ? "#ff8a65" : "#4fc3f7" }}>
                  {isUpset ? "⚡" : "✓"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {REG.map((regName, regIdx) => {
        const matches = r1Display.slice(regIdx * 8, regIdx * 8 + 8);
        const played = r1Played.slice(regIdx * 8, regIdx * 8 + 8);
        return (
          <div key={regIdx} className={regionCls}>
            <div className={headCls} style={{ color: regColors[regIdx] }}>{regName}</div>
            {matches.map((mu, mi) => {
              const p = played[mi];
              const w = p?.winner;
              const aName = mu.a ? mu.a.name : piLabel(mu.aSlot);
              const bName = mu.b ? mu.b.name : piLabel(mu.bSlot);
              const aSeed = mu.a?.seed;
              const bSeed = mu.b?.seed;
              const isCurrentMatch = !isPlayIn && currentRound === 0 && currentMatch === regIdx * 8 + mi;
              const isUpset = w && w.seed > (w.seed === aSeed ? (bSeed ?? 0) : (aSeed ?? 0));
              const winColor = isUpset ? "#ff8a65" : "#4fc3f7";
              return (
                <div
                  key={mi}
                  className={[
                    "flex items-center rounded-[6px]",
                    isCurrentMatch ? "bg-[rgba(79,195,247,.06)]" : "bg-transparent",
                  ].join(" ")}
                  style={{ gap: rowGap, fontSize: rowFs, padding: rowPad }}
                >
                  <span style={{
                    flex: 1, textAlign: "right" as const, ...ellipsis,
                    color: w?.seed === aSeed ? winColor : w && w.seed !== aSeed ? "#4a4a65" : p ? "#8a8aa8" : "#7a7a9e",
                    fontWeight: w?.seed === aSeed ? 700 : 400,
                    textDecoration: w && w.seed !== aSeed ? "line-through" : "none",
                    opacity: w && w.seed !== aSeed ? 0.4 : 1,
                    fontStyle: !mu.a ? "italic" : "normal",
                  }}>
                    {!mob && aSeed ? `#${aSeed} ` : ""}{aName}
                  </span>
                  <span className="text-[#3a3a55] shrink-0 tracking-[1px]" style={{ fontSize: vsFs }}>vs</span>
                  <span style={{
                    flex: 1, ...ellipsis,
                    color: w?.seed === bSeed ? winColor : w && w.seed !== bSeed ? "#4a4a65" : p ? "#8a8aa8" : "#7a7a9e",
                    fontWeight: w?.seed === bSeed ? 700 : 400,
                    textDecoration: w && w.seed !== bSeed ? "line-through" : "none",
                    opacity: w && w.seed !== bSeed ? 0.4 : 1,
                    fontStyle: !mu.b ? "italic" : "normal",
                  }}>
                    {bName}{!mob && bSeed ? ` #${bSeed}` : ""}
                  </span>
                  {w && (
                    <span className="opacity-60 ml-[2px]" style={{ fontSize: vsFs, color: isUpset ? "#ff8a65" : "#4fc3f7" }}>
                      {isUpset ? "⚡" : "✓"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {rounds.slice(1).map((rd, rdIdx) => {
        const roundNum = rdIdx + 1;
        return (
          <div key={roundNum} className={regionCls}>
            <div className={headCls} style={{ color: "#b8b8d0" }}>{RND[roundNum]}</div>
            {rd.map((m, mi) => {
              const w = m.winner;
              const isUpset = w && w.seed > (w.seed === m.players[0].seed ? m.players[1] : m.players[0]).seed;
              const isCur = !isPlayIn && currentRound === roundNum && currentMatch === mi;
              return (
                <div
                  key={mi}
                  className={[
                    "flex items-center rounded-[6px]",
                    isCur ? "bg-[rgba(79,195,247,.06)]" : "bg-transparent",
                  ].join(" ")}
                  style={{ gap: rowGap, fontSize: rowFs, padding: rowPad }}
                >
                  <MN movie={m.players[0]} winner={w} alignRight mob={mob} upset={!!(isUpset && w?.seed === m.players[0].seed)} />
                  <span className="text-[#3a3a55] shrink-0 tracking-[1px]" style={{ fontSize: vsFs }}>vs</span>
                  <MN movie={m.players[1]} winner={w} mob={mob} upset={!!(isUpset && w?.seed === m.players[1].seed)} />
                  {w && (
                    <span className="opacity-60 ml-[2px]" style={{ fontSize: vsFs, color: isUpset ? "#ff8a65" : "#4fc3f7" }}>
                      {isUpset ? "⚡" : "✓"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
