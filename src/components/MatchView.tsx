import { Btn } from './Btn.js';
import { Card } from './Card.js';
import { BV } from './BV.js';
import type { Movie, Match, Notes, MovieMeta, HistoryEntry } from '../types.js';

interface MatchViewProps {
  mob: boolean;
  phase: string;
  isPlayIn: boolean;
  playInIndex: number;
  currentRound: number;
  currentMatch: number;
  matchNumber: number;
  matchTotal: number;
  activeMatch: Match;
  animatingSeed: number | null;
  hoveredSeed: number | null;
  setHoveredSeed: (seed: number | null) => void;
  upFlash: boolean;
  history: HistoryEntry[];
  copiedLink: boolean;
  pngStatus: string | null;
  showBracketPanel: boolean;
  playInMatches: Match[];
  rounds: Match[][];
  upNextPool: Match[] | undefined;
  upNextIndex: number;
  notes: Notes;
  movieMeta: Record<number, MovieMeta>;
  updateNote: (seed: number, text: string) => void;
  pick: (w: Movie) => void;
  undo: () => void;
  reset: () => void;
  copyLink: () => void;
  onDownloadPng: () => void;
}

export function MatchView({
  mob, phase, isPlayIn, playInIndex, currentRound, currentMatch,
  matchNumber, matchTotal, activeMatch, animatingSeed, hoveredSeed, setHoveredSeed,
  upFlash, history, copiedLink, pngStatus,
  showBracketPanel, playInMatches, rounds,
  upNextPool, upNextIndex, notes, movieMeta, updateNote,
  pick, undo, reset, copyLink, onDownloadPng,
}: MatchViewProps) {
  return (
    <div key={`${phase}-${isPlayIn ? playInIndex : `${currentRound}-${currentMatch}`}`} className="animate-[su_.3s_ease-out]">
      <div
        data-testid="match-counter"
        className="text-center text-[#8080a0]"
        style={{ marginBottom: mob ? 12 : 16, fontSize: mob ? 14 : 13 }}
      >
        Match {matchNumber} of {matchTotal}
      </div>

      {mob ? (
        <div className="flex flex-col items-center gap-0">
          <Card mob movie={activeMatch.players[0]} hovered={hoveredSeed === activeMatch.players[0].seed} animating={animatingSeed === activeMatch.players[0].seed} disabled={!!animatingSeed} onHover={setHoveredSeed} onPick={() => pick(activeMatch.players[0])} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
          <div className="flex items-center justify-center gap-[12px] py-[10px] w-full">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/12"/>
            <span data-testid="vs-divider" className="text-[14px] font-extrabold text-[#5a5a7e] tracking-[3px]">VS</span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/12"/>
          </div>
          <Card mob movie={activeMatch.players[1]} hovered={hoveredSeed === activeMatch.players[1].seed} animating={animatingSeed === activeMatch.players[1].seed} disabled={!!animatingSeed} onHover={setHoveredSeed} onPick={() => pick(activeMatch.players[1])} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-0">
          <Card key={activeMatch.players[0].seed} movie={activeMatch.players[0]} hovered={hoveredSeed === activeMatch.players[0].seed} animating={animatingSeed === activeMatch.players[0].seed} disabled={!!animatingSeed} onHover={setHoveredSeed} onPick={() => pick(activeMatch.players[0])} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
          <div className="px-[22px] shrink-0 flex flex-col items-center gap-[8px]">
            <div className="w-[1px] h-[32px] bg-gradient-to-b from-transparent to-white/10"/>
            <span data-testid="vs-divider" className="text-[13px] font-extrabold text-[#3a3a58] tracking-[4px]">VS</span>
            <div className="w-[1px] h-[32px] bg-gradient-to-t from-transparent to-white/10"/>
          </div>
          <Card key={activeMatch.players[1].seed} movie={activeMatch.players[1]} hovered={hoveredSeed === activeMatch.players[1].seed} animating={animatingSeed === activeMatch.players[1].seed} disabled={!!animatingSeed} onHover={setHoveredSeed} onPick={() => pick(activeMatch.players[1])} notes={notes} updateNote={updateNote} movieMeta={movieMeta}/>
        </div>
      )}

      {upFlash && (
        <div className="text-center mt-[12px] animate-[uf_1.5s_ease-out_forwards]">
          <span
            className="inline-block rounded-[20px] bg-[rgba(255,80,80,.12)] border border-[rgba(255,80,80,.25)] font-bold text-[#ff7070] uppercase tracking-[2px]"
            style={{ padding: "4px 14px", fontSize: mob ? 12 : 11 }}
          >
            🚨 Upset!
          </span>
        </div>
      )}

      <div className="flex justify-center" style={{ gap: mob ? 10 : 10, marginTop: mob ? 18 : 22 }}>
        {history.length > 0 && <Btn mob={mob} s onClick={undo}>← Undo</Btn>}
        <Btn mob={mob} s mu onClick={reset}>Reset</Btn>
        {history.length > 0 && <Btn mob={mob} s mu onClick={copyLink}>{copiedLink ? "✓!" : "🔗 Share"}</Btn>}
        {history.length > 0 && (
          <Btn mob={mob} s mu onClick={onDownloadPng}>
            {pngStatus && pngStatus !== "done" ? "⏳" : pngStatus === "done" ? "✓!" : "⬇ PNG"}
          </Btn>
        )}
      </div>

      {showBracketPanel && !isPlayIn && (
        <BV mob={mob} playInMatches={playInMatches} rounds={rounds} currentRound={currentRound} currentMatch={currentMatch}/>
      )}

      {!showBracketPanel && upNextPool && upNextIndex + 1 < upNextPool.length && (
        <div style={{ marginTop: mob ? 24 : 30 }}>
          <div
            className="uppercase font-bold text-[#5a5a7e] tracking-[2.5px]"
            style={{ fontSize: mob ? 11 : 10, marginBottom: mob ? 8 : 8 }}
          >
            Up Next
          </div>
          {upNextPool.slice(upNextIndex + 1, upNextIndex + (mob ? 3 : 5)).map((m, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-white/[0.025] rounded-[8px]"
              style={{ padding: mob ? "8px 12px" : "6px 12px", fontSize: mob ? 13 : 12, marginBottom: mob ? 4 : 4 }}
            >
              <span className="font-semibold text-[#9898b8] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{m.players[0].name}</span>
              <span className="text-[#4a4a65] tracking-[2px] mx-[8px] shrink-0" style={{ fontSize: mob ? 10 : 9 }}>VS</span>
              <span className="font-semibold text-[#9898b8] flex-1 text-right overflow-hidden text-ellipsis whitespace-nowrap">{m.players[1].name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
