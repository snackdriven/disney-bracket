import { useState } from "react";
import { useIsMobile } from './hooks/useIsMobile.js';
import { useBracketState } from './hooks/useBracketState.js';
import { useShareClipboard } from './hooks/useShareClipboard.js';
import { useNotes } from './hooks/useNotes.js';
import { useSupabaseSync } from './hooks/useSupabaseSync.js';
import { useMovieMeta } from './hooks/useMovieMeta.js';
import { MAIN } from './lib/data.js';
import { saveLS, isNotes } from './lib/utils.js';
import { Dots } from './components/Dots.js';
import { AuthModal } from './components/AuthModal.js';
import { TmdbModal } from './components/TmdbModal.js';
import { NotesPanel } from './components/NotesPanel.js';
import { FullBracket } from './components/FullBracket.js';
import { SyncStrip } from './components/SyncStrip.js';
import { MatchView } from './components/MatchView.js';
import { ChampionScreen } from './components/ChampionScreen.js';
import type { Movie } from './types.js';

export default function App() {
  const mob = useIsMobile();

  const { notes, setNotes, showNotes, setShowNotes, updateNote } = useNotes();

  const {
    phase, playInMatches, playInIndex, rounds, currentRound, currentMatch,
    champion, history, upsets,
    isPlayIn, activeMatch, progress, roundLabel, matchNumber, matchTotal,
    regionName, upNextPool, upNextIndex,
    animatingSeed,
    upFlash,
    serialized, applyServerState,
    pick, undo, reset,
  } = useBracketState();

  const [hoveredSeed, setHoveredSeed] = useState<number | null>(null);
  const [showBracketPanel, setShowBracketPanel] = useState(false);
  const [showFullBracket, setShowFullBracket] = useState(false);

  const { copiedLink, copiedBracket, copyLink, copyBracket } = useShareClipboard(playInMatches, rounds, champion);

  const handleReset = () => {
    reset();
    setShowBracketPanel(false);
    setShowFullBracket(false);
  };

  const { sbUser, syncStatus, showAuthModal, setShowAuthModal } = useSupabaseSync({
    serialized,
    notes,
    onPull: (state, serverNotes) => {
      applyServerState(state);
      if (serverNotes && isNotes(serverNotes)) { setNotes(serverNotes); saveLS("dbk-notes", serverNotes); }
    },
  });

  const {
    movieMeta, tmdbStatus, showTmdbModal, setShowTmdbModal,
    pngStatus, handleFetchMeta, handleDownloadPng, metaCount,
  } = useMovieMeta();

  const m64 = [...MAIN, ...playInMatches.map(m => m.winner).filter((w): w is Movie => !!w)];

  return (
    <div className="min-h-screen relative z-[9999] font-[Inter,sans-serif] text-[#e0e0f0]">
      <a
        href="#main-content"
        onFocus={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        onBlur={e => { e.currentTarget.style.transform = 'translateY(-100%)'; }}
        className="fixed top-0 left-0 z-[99999] bg-[#12122a] text-[#e0e0f0] px-[16px] py-[8px] no-underline rounded-[0_0_8px_8px] border border-white/15 text-[13px]"
        style={{ transform: 'translateY(-100%)' }}
      >
        Skip to content
      </a>
      {showTmdbModal && <TmdbModal onSave={(t,o)=>{ setShowTmdbModal(false); handleFetchMeta(t,o); }} onClose={()=>setShowTmdbModal(false)}/>}
      {showAuthModal && <AuthModal onClose={()=>setShowAuthModal(false)}/>}
      <Dots mob={mob}/>

      <div
        id="main-content"
        className={[
          "relative z-[1] max-w-[1200px] mx-auto",
          mob ? "px-[16px] pt-[16px] pb-[32px]" : "px-[32px] pt-[20px] pb-[40px]",
        ].join(" ")}
      >
        {/* Header */}
        <div className={["text-center", mob ? "mb-[20px]" : "mb-[28px]"].join(" ")}>
          <div className={[
            "uppercase text-[#6a6a8e] text-[11px]",
            mob ? "tracking-[5px] mb-[4px]" : "tracking-[7px] mb-[6px]",
          ].join(" ")}>
            Settle it once and for all
          </div>
          <h1 style={{
            fontSize: "clamp(28px,5vw,42px)", fontWeight: 800, margin: "0 0 4px",
            fontFamily: "'Outfit',sans-serif",
            background: "linear-gradient(135deg,#9d8fe0,#ce93d8 45%,#4fc3f7)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Disney & Pixar: The Bracket
          </h1>
          <div className="text-[13px] text-[#7a7a9e]">
            {mob ? "70 movies · 69 matchups · 1 champion" : "70 movies · 6 play-in games · 69 matchups · 1 champion"}
          </div>
        </div>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Bracket completion"
          className="bg-white/[0.05] rounded-[20px] overflow-hidden"
          style={{ height: mob ? 6 : 5, marginBottom: mob ? 6 : 6 }}
        >
          <div
            className="h-full rounded-[20px] transition-[width_.5s]"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg,#9d8fe0,#ce93d8,#4fc3f7)" }}
          />
        </div>

        {/* Progress label row */}
        <div
          className={[
            "flex justify-between text-[#6a6a8e]",
            mob ? "text-[12px] mb-[10px]" : "text-[11px] mb-[14px]",
          ].join(" ")}
        >
          <span>{history.length}/69 decided</span>
          <span data-testid="round-label">{roundLabel}{regionName ? ` · ${regionName}` : ""}</span>
        </div>

        <SyncStrip
          mob={mob}
          sbUser={sbUser}
          syncStatus={syncStatus}
          tmdbStatus={tmdbStatus}
          metaCount={metaCount}
          onSignInClick={() => setShowAuthModal(true)}
          onTmdbClick={() => { if (tmdbStatus === "fetching") return; if (!sessionStorage.getItem("tmdb-key")) setShowTmdbModal(true); else handleFetchMeta(); }}
        />

        {/* Full Bracket + Notes toggles */}
        <div
          className={[
            "text-center flex justify-center flex-wrap",
            mob ? "mb-[14px] gap-[10px]" : "mb-[16px] gap-[8px]",
          ].join(" ")}
        >
          <button
            aria-expanded={showFullBracket}
            className={mob ? "mob-btn" : ""}
            onClick={() => setShowFullBracket(!showFullBracket)}
            style={{
              background: showFullBracket ? "rgba(79,195,247,.12)" : "rgba(255,255,255,.04)",
              border: showFullBracket ? "1px solid rgba(79,195,247,.3)" : "1px solid rgba(255,255,255,.08)",
              color: showFullBracket ? "#4fc3f7" : "#8a8aae",
              padding: mob ? "10px 18px" : "6px 18px", borderRadius: 10,
              fontSize: mob ? 13 : 12, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5,
              transition: "all .15s", minHeight: mob ? 48 : undefined,
            }}
          >
            {showFullBracket ? "Hide Bracket" : "📋 Full Bracket"}
          </button>
          <button
            aria-expanded={showNotes}
            className={mob ? "mob-btn" : ""}
            onClick={() => setShowNotes(!showNotes)}
            style={{
              background: showNotes ? "rgba(206,147,216,.12)" : "rgba(255,255,255,.04)",
              border: showNotes ? "1px solid rgba(206,147,216,.3)" : "1px solid rgba(255,255,255,.08)",
              color: showNotes ? "#ce93d8" : "#8a8aae",
              padding: mob ? "10px 18px" : "6px 18px", borderRadius: 10,
              fontSize: mob ? 13 : 12, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5,
              transition: "all .15s", minHeight: mob ? 48 : undefined,
            }}
          >
            {showNotes ? "Hide Notes" : "📝 Notes"}
          </button>
        </div>

        {showNotes && <NotesPanel mob={mob} notes={notes} updateNote={updateNote}/>}

        {showFullBracket && <FullBracket mob={mob} playInMatches={playInMatches} rounds={rounds} pool64={m64} currentRound={currentRound} currentMatch={currentMatch} isPlayIn={isPlayIn} upsets={upsets}/>}

        {/* Play-In badge */}
        {isPlayIn && (
          <div className={["text-center animate-[fi_.4s]", mob ? "mb-[16px]" : "mb-[20px]"].join(" ")}>
            <div
              className="inline-block rounded-[20px] bg-[rgba(79,195,247,.08)] border border-[rgba(79,195,247,.2)] font-bold text-[#4fc3f7] uppercase animate-[pp_3s_ease-in-out_infinite]"
              style={{ padding: mob ? "8px 16px" : "6px 18px", fontSize: mob ? 13 : 12, letterSpacing: mob ? 1 : 2 }}
            >
              {mob ? "🎬 Play-In Round" : "🎬 Play-In — Bottom 12 fight for 6 spots"}
            </div>
          </div>
        )}

        {/* Main content: champion, active match, or null */}
        {champion ? (
          <ChampionScreen
            mob={mob}
            champion={champion}
            upsets={upsets}
            copiedLink={copiedLink}
            copiedBracket={copiedBracket}
            pngStatus={pngStatus}
            showBracketPanel={showBracketPanel}
            playInMatches={playInMatches}
            rounds={rounds}
            reset={handleReset}
            onToggleBracket={() => setShowBracketPanel(!showBracketPanel)}
            copyLink={copyLink}
            copyBracket={copyBracket}
            onDownloadPng={() => handleDownloadPng({ rounds, playInMatches, ch: champion, upsets })}
          />
        ) : activeMatch ? (
          <MatchView
            mob={mob}
            phase={phase}
            isPlayIn={isPlayIn}
            playInIndex={playInIndex}
            currentRound={currentRound}
            currentMatch={currentMatch}
            matchNumber={matchNumber}
            matchTotal={matchTotal}
            activeMatch={activeMatch}
            animatingSeed={animatingSeed}
            hoveredSeed={hoveredSeed}
            setHoveredSeed={setHoveredSeed}
            upFlash={upFlash}
            history={history}
            copiedLink={copiedLink}
            pngStatus={pngStatus}
            showBracketPanel={showBracketPanel}
            playInMatches={playInMatches}
            rounds={rounds}
            upNextPool={upNextPool}
            upNextIndex={upNextIndex}
            notes={notes}
            movieMeta={movieMeta}
            updateNote={updateNote}
            pick={pick}
            undo={undo}
            reset={handleReset}
            copyLink={copyLink}
            onDownloadPng={() => handleDownloadPng({ rounds, playInMatches, ch: champion, upsets })}
          />
        ) : null}
      </div>
    </div>
  );
}
