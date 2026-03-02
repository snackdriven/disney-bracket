import { Btn } from './Btn.js';
import { BV } from './BV.js';
import type { Movie, Match } from '../types.js';

interface ChampionScreenProps {
  mob: boolean;
  champion: Movie;
  upsets: { seedDiff: number; winner: Movie; loser: Movie; round: string }[];
  copiedLink: boolean;
  copiedBracket: boolean;
  pngStatus: string | null;
  showBracketPanel: boolean;
  playInMatches: Match[];
  rounds: Match[][];
  reset: () => void;
  onToggleBracket: () => void;
  copyLink: () => void;
  copyBracket: () => void;
  onDownloadPng: () => void;
}

export function ChampionScreen({
  mob, champion, upsets, copiedLink, copiedBracket, pngStatus,
  showBracketPanel, playInMatches, rounds,
  reset, onToggleBracket, copyLink, copyBracket, onDownloadPng,
}: ChampionScreenProps) {
  return (
    <div
      className="text-center animate-[su_.5s_ease-out]"
      style={{ padding: mob ? "24px 12px" : "40px 20px" }}
    >
      <div
        className="animate-[cb_2s_ease-in-out_infinite]"
        style={{ fontSize: mob ? 42 : 56, marginBottom: mob ? 8 : 12 }}
      >
        👑
      </div>
      <div
        data-testid="champion-label"
        className="uppercase text-[#4fc3f7]"
        style={{ fontSize: mob ? 12 : 11, letterSpacing: mob ? 4 : 6, marginBottom: mob ? 8 : 10 }}
      >
        Your Champion
      </div>
      <div
        className="font-extrabold text-[#4fc3f7] animate-[wg_2s_ease-in-out_infinite]"
        style={{ fontSize: "clamp(28px,7vw,50px)", marginBottom: 6 }}
      >
        {champion.name}
      </div>
      <div className="text-[15px] text-[#9a9abe]">
        {champion.studio} · {champion.year} · #{champion.seed} seed
      </div>

      {upsets.length > 0 && (
        <div style={{ marginTop: 16, fontSize: mob ? 13 : 13 }} className="text-[#6a6a8e]">
          <div>{upsets.length} upset{upsets.length !== 1 ? "s" : ""} picked</div>
          {(() => {
            const big = upsets.reduce((a, b) => b.seedDiff > a.seedDiff ? b : a);
            return (
              <div className="text-[11px] text-[#505070] mt-[4px]">
                Biggest: #{big.winner.seed} {big.winner.name} over #{big.loser.seed} {big.loser.name}
              </div>
            );
          })()}
        </div>
      )}

      <div
        className="flex gap-[10px] justify-center flex-wrap"
        style={{ marginTop: mob ? 24 : 40 }}
      >
        <Btn mob={mob} p onClick={reset}>Run It Back</Btn>
        <Btn mob={mob} onClick={onToggleBracket}>{showBracketPanel ? "Hide" : "View"} Bracket</Btn>
        <Btn mob={mob} s mu onClick={copyLink}>{copiedLink ? "✓ Linked!" : "🔗 Share"}</Btn>
        <Btn mob={mob} s mu onClick={copyBracket}>{copiedBracket ? "✓ Copied!" : "📋 Export"}</Btn>
        <Btn mob={mob} s mu onClick={onDownloadPng}>
          {pngStatus === "fetching" ? "⏳ Fetching..." : pngStatus === "drawing" ? "⏳ Drawing..." : pngStatus === "done" ? "✓ Saved!" : "⬇ PNG"}
        </Btn>
      </div>

      {showBracketPanel && <BV mob={mob} playInMatches={playInMatches} rounds={rounds}/>}
    </div>
  );
}
