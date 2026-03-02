import { RND } from '../lib/data.js';
import type { Movie, Match } from '../types.js';

interface MNProps {
  movie: Movie;
  winner?: Movie;
  alignRight?: boolean;
  mob: boolean;
  upset?: boolean;
}

function MN({ movie, winner, alignRight, mob, upset }: MNProps) {
  const won = winner?.seed === movie.seed, lost = winner && !won;
  const winColor = upset ? "#ff8a65" : "#4fc3f7";
  return (
    <span style={{
      color: won ? winColor : lost ? "#4a4a65" : "#8a8aa8",
      fontWeight: won ? 700 : 400,
      flex: 1,
      textAlign: alignRight ? "right" : "left",
      textDecoration: lost ? "line-through" : "none",
      opacity: lost ? 0.5 : 1,
      ...(mob ? { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const } : {}),
    }}>
      {movie.name}
    </span>
  );
}

interface RBProps {
  title: string;
  matches: Match[];
  highlighted?: boolean;
  currentRound?: number;
  currentMatch?: number;
  roundIndex?: number;
  mob: boolean;
}

function RB({ title, matches, highlighted, currentRound, currentMatch, roundIndex, mob }: RBProps) {
  return (
    <div className={mob ? "mb-[14px]" : "mb-[16px]"}>
      <div
        className={[
          "uppercase font-bold",
          mob ? "text-[11px] tracking-[2px] mb-[6px]" : "text-[10px] tracking-[2.5px] mb-[6px]",
        ].join(" ")}
        style={{ color: highlighted ? "#4fc3f7" : "#6a6a8e", opacity: highlighted ? 0.7 : 1 }}
      >
        {title}
      </div>
      {matches.map((m, mi) => {
        const w = m.winner, cur = roundIndex === currentRound && mi === currentMatch;
        const isUpset = w && w.seed > (w.seed === m.players[0].seed ? m.players[1] : m.players[0]).seed;
        return (
          <div
            key={mi}
            className={[
              "flex items-center gap-[6px] rounded-[6px]",
              mob ? "text-[13px] py-[5px] px-[8px]" : "text-[12px] py-[3px] px-[8px]",
              cur ? "bg-[rgba(79,195,247,.08)]" : "bg-transparent",
            ].join(" ")}
          >
            <MN movie={m.players[0]} winner={w} alignRight mob={mob} upset={!!(isUpset && w?.seed === m.players[0].seed)} />
            <span
              className="shrink-0 tracking-[1px] text-[#3a3a55]"
              style={{ fontSize: mob ? 10 : 9 }}
            >
              vs
            </span>
            <MN movie={m.players[1]} winner={w} mob={mob} upset={!!(isUpset && w?.seed === m.players[1].seed)} />
          </div>
        );
      })}
    </div>
  );
}

interface BVProps {
  playInMatches: Match[];
  rounds: Match[][];
  currentRound?: number;
  currentMatch?: number;
  mob: boolean;
}

export function BV({ playInMatches, rounds, currentRound, currentMatch, mob }: BVProps) {
  return (
    <div
      className={[
        "text-left bg-white/[0.03] border border-white/[0.06] animate-[fi_.3s]",
        mob ? "mt-[20px] p-[14px] rounded-[12px]" : "mt-[28px] p-[16px] rounded-[14px]",
      ].join(" ")}
    >
      <h3
        className={[
          "mt-0 font-bold text-[#b8b8d0] tracking-[1px]",
          mob ? "text-[15px] mb-[12px]" : "text-[14px] mb-[14px]",
        ].join(" ")}
      >
        Bracket Results
      </h3>
      <RB title="Play-In Round" matches={playInMatches} highlighted mob={mob} />
      {rounds.map((r, i) => <RB key={i} title={RND[i]} matches={r} currentRound={currentRound} currentMatch={currentMatch} roundIndex={i} mob={mob} />)}
    </div>
  );
}

// Re-export MN for use in FullBracket
export { MN };
