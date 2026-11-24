import { useState } from "react";
import { useIsMobile } from './hooks/useIsMobile.js';
import { useBracketState } from './hooks/useBracketState.js';
import { useShareClipboard } from './hooks/useShareClipboard.js';
import { useNotes } from './hooks/useNotes.js';
import { useFirebaseSync } from './hooks/useFirebaseSync.js';
import { useMovieMeta } from './hooks/useMovieMeta.js';
import { MAIN } from './lib/data.js';
import { saveLS, isNotes } from './lib/utils.js';
import { Dots } from './components/Dots.js';
import { AuthModal } from './components/AuthModal.js';
import { NotesPanel } from './components/NotesPanel.js';
import { FullBracket } from './components/FullBracket.js';
import { SyncStrip } from './components/SyncStrip.js';
import { SyncStatusPanel } from './components/SyncStatusPanel.js';
import { MatchView } from './components/MatchView.js';
import { FixMetaModal } from './components/FixMetaModal.js';

import { ChampionScreen } from './components/ChampionScreen.js';
import { MobileMenuModal } from './components/MobileMenuModal.js';
import { Sweet16RerollModal } from './components/Sweet16RerollModal.js';
import type { Movie } from './types.js';

export default function App() {
  const mob = useIsMobile();

  const { notes, setNotes, showNotes, setShowNotes, updateNote: rawUpdateNote } = useNotes();

  const bracketState = useBracketState();
  const {
    playInMatches, rounds, currentRound, currentMatch,
    champion, history, upsets,
    isPlayIn, activeMatch, progress, roundLabel,
    regionName,
    serialized, applyServerState,
    pick: rawPick, undo: rawUndo, reset,
  } = bracketState;

  const [hoveredSeed, setHoveredSeed] = useState<number | null>(null);
  const [showBracketPanel, setShowBracketPanel] = useState(false);
  const [showFullBracket, setShowFullBracket] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [fixingMovie, setFixingMovie] = useState<Movie | null>(null);
  const [rerollNotice, setRerollNotice] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [showUnsavedSignOut, setShowUnsavedSignOut] = useState(false);
  const [signOutRecoveryExported, setSignOutRecoveryExported] = useState(false);

  const { copiedLink, copiedBracket, copyLink, copyBracket, shareError } = useShareClipboard(playInMatches, rounds, champion, serialized);

  const handleSignOut = async () => {
    if (await forcePush()) {
      import("./lib/firebase.js").then(m => m.auth.signOut());
    } else {
      setShowUnsavedSignOut(true);
      setSignOutRecoveryExported(false);
    }
  };

  const handleReset = () => {
    if (loadingSavedWork && !bracketState.restoreError) return;
    if (window.confirm("Are you sure you want to reset your bracket? This cannot be undone.")) {
      reset();
      setShowBracketPanel(false);
      setShowFullBracket(false);
    }
  };

  const { fbUser, syncStatus, showAuthModal, setShowAuthModal, forcePush,
    authReady, syncReady, syncError, syncConflict, syncRecovery, retrySync, resolveSyncConflict } = useFirebaseSync({
    serialized,
    notes,
    enabled: !bracketState.restoreError,
    onPull: (state, serverNotes) => {
      if (!applyServerState(state)) return false;
      if (serverNotes && isNotes(serverNotes)) { setNotes(serverNotes); saveLS("dbk-notes", serverNotes); }
      return true;
    },
  });

  const { movieMeta, updateSingleMeta } = useMovieMeta();

  const m64 = [...MAIN, ...playInMatches.map(m => m.winner).filter((w): w is Movie => !!w)];
  const loadingSavedWork = !authReady || (!!fbUser && !syncReady);
  const pick = (winner: Movie) => { if (!loadingSavedWork) rawPick(winner); };
  const undo = () => { if (!loadingSavedWork) rawUndo(); };
  const updateNote = (seed: number, value: string) => { if (!loadingSavedWork && !bracketState.restoreError) rawUpdateNote(seed, value); };
  const viewBracket = { ...bracketState, undo };
  const syncPanel = !bracketState.restoreError && <SyncStatusPanel authReady={authReady} signedIn={!!fbUser} syncReady={syncReady}
    syncStatus={syncStatus} syncError={syncError} syncConflict={syncConflict} syncRecovery={syncRecovery}
    retrySync={retrySync} resolveSyncConflict={resolveSyncConflict} />;

  const exportRecovery = (previous: boolean) => {
    try {
      const raw = previous ? localStorage.getItem('dbk-pre-reroll') : bracketState.sourceConflict
        ? JSON.stringify({ ...bracketState.sourceConflict, notes }) : bracketState.rejectedSave || JSON.stringify({ bracket: serialized, notes });
      if (!raw) throw new Error('No recovery copy is available.');
      const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = previous ? 'disney-bracket-before-reroll.json' : 'disney-bracket-recovery.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadError('');
      return true;
    } catch { setDownloadError('The recovery download could not be created. Keep this page open and try again.'); return false; }
  };
  const signOutKeepingRecovery = async (exported = false) => {
    try {
      if (!exported) localStorage.setItem(`dbk-signout-recovery:${fbUser?.uid ?? 'device'}`, JSON.stringify({ bracket: serialized, notes, rejected: bracketState.rejectedSave, sources: bracketState.sourceConflict }));
      const { auth } = await import('./lib/firebase.js');
      await auth.signOut();
      setShowUnsavedSignOut(false);
    } catch { setDownloadError('Recovery could not be saved or sign-out failed. Export a recovery copy before trying again.'); }
  };
  const rerollControls = (
    <div className="shrink-0 px-[16px] py-[8px] text-center text-[13px]">
      {mob && <button className="mr-[10px] min-h-[44px] rounded-[10px] border border-white/15 px-[12px]" aria-label="Open menu" onClick={() => setShowMobileMenu(true)}>Menu</button>}
      {bracketState.restoreError && <div role="alert" className="mb-[8px] rounded-[10px] border border-[#ffb4a8]/30 p-[12px] text-[#ffb4a8]">
        <p>{bracketState.restoreError}</p>
        {bracketState.sourceConflict && <div className="my-[8px] text-[#e0e0f0]">
          <p>This device: {bracketState.sourceConflict.device?.history.length ?? 'unreadable'} picks. Link: {bracketState.sourceConflict.link.history.length} picks. Both versions will be preserved before you choose.</p>
          <button className="min-h-[44px] px-[10px] underline disabled:opacity-40" disabled={!bracketState.sourceConflict.device} onClick={() => bracketState.resolveSourceConflict('device')}>Keep this device’s bracket</button>
          <button className="min-h-[44px] px-[10px] underline" onClick={() => bracketState.resolveSourceConflict('link')}>Use link bracket</button>
        </div>}
        <button className="min-h-[44px] underline" onClick={() => exportRecovery(false)}>Export recovery copy</button>
        <button className="ml-[12px] min-h-[44px] underline" onClick={handleReset}>Reset after keeping recovery</button>
      </div>}
      {bracketState.canRerollSweet16 && <button
        className="min-h-[44px] rounded-[10px] border border-[#ce93d8]/30 bg-[#ce93d8]/10 px-[16px] py-[10px] font-semibold text-[#dfb7e5] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4fc3f7]"
        disabled={!!bracketState.animatingSeed || loadingSavedWork} onClick={() => { if (!loadingSavedWork) { setRerollNotice(''); bracketState.openRerollPreview(); } }}>
        Reroll Sweet 16
      </button>}
      {bracketState.hasRerollBackup && <button className="ml-[12px] min-h-[44px] text-[#b8b8d0] underline" onClick={() => exportRecovery(true)}>Export previous bracket</button>}
      {rerollNotice && <p role="status" className="mt-[8px] text-[#b6eaff]">{rerollNotice}</p>}
      {downloadError && <p role="alert" className="mt-[8px] text-[#ffb4a8]">{downloadError}</p>}
      {shareError && <p role="alert" className="mt-[8px] text-[#ffb4a8]">{shareError} <button className="min-h-[44px] underline" onClick={() => exportRecovery(false)}>Download current bracket</button></p>}
      {showUnsavedSignOut && <section role="alert" className="my-[10px] rounded-[10px] border border-[#ffd54f]/30 p-[12px]">
        <p>Your cloud save has not completed. Stay and retry, or keep a recovery copy and sign out to continue solo.</p>
        <button className="min-h-[44px] px-[10px] underline" onClick={() => { setShowUnsavedSignOut(false); retrySync(); }}>Stay & retry</button>
        <button className="min-h-[44px] px-[10px] underline" onClick={() => { void signOutKeepingRecovery(); }}>Keep recovery & sign out</button>
        <button className="min-h-[44px] px-[10px] underline" onClick={() => { if (exportRecovery(false)) setSignOutRecoveryExported(true); }}>Export recovery before sign-out</button>
        {signOutRecoveryExported && <button className="min-h-[44px] px-[10px] underline" onClick={() => { void signOutKeepingRecovery(true); }}>I kept my recovery — sign out</button>}
      </section>}
    </div>
  );
  const rerollModal = bracketState.rerollPreview && <Sweet16RerollModal
    {...bracketState.rerollPreview} pending={bracketState.rerollPending} error={bracketState.rerollError}
    onShuffle={bracketState.shuffleRerollPreview} onCancel={bracketState.cancelRerollPreview}
    onConfirm={() => {
      if (!loadingSavedWork && bracketState.confirmRerollPreview()) {
        setShowFullBracket(false); setShowNotes(false);
        setRerollNotice('Sweet 16 rerolled. Your Round of 32 winners and earlier choices are saved.');
      }
    }} />;

  if (mob) {
    return (
      <div className="h-[100dvh] flex flex-col font-[Inter,sans-serif] text-[#e0e0f0] bg-[#06060f] overflow-hidden relative">
        {rerollModal}
        {showAuthModal && <AuthModal onClose={()=>setShowAuthModal(false)}/>}
        {fixingMovie && <FixMetaModal mob={mob} movie={fixingMovie} onClose={() => setFixingMovie(null)} onSave={updateSingleMeta} />}
        {showMobileMenu && (
          <MobileMenuModal
             onClose={() => setShowMobileMenu(false)}
             showFullBracket={showFullBracket} setShowFullBracket={setShowFullBracket}
             showNotes={showNotes} setShowNotes={setShowNotes}
             onReset={handleReset} 
             fbUser={fbUser} syncStatus={syncStatus} onSignInClick={() => setShowAuthModal(true)}
             onSignOutClick={handleSignOut}
          />
        )}
        
        {/* Refined Native-App Style Header */}
        <header className="shrink-0 flex flex-col items-center justify-center pt-[max(env(safe-area-inset-top),16px)] pb-[12px] bg-gradient-to-b from-[#06060f] via-[#06060f]/90 to-transparent sticky top-0 z-[100] pointer-events-none">
           <div className="flex items-center gap-[8px] mb-[4px]">
             <span className="w-[16px] h-[1px] bg-gradient-to-r from-transparent to-[#4fc3f7]/60 rounded-full" />
             <div className="text-[9px] text-[#4fc3f7] uppercase tracking-[3px] font-black opacity-90 drop-shadow-[0_0_8px_rgba(79,195,247,0.4)]">
                 {isPlayIn ? "Play-In Round" : roundLabel}
             </div>
             <span className="w-[16px] h-[1px] bg-gradient-to-l from-transparent to-[#4fc3f7]/60 rounded-full" />
           </div>
           
           <h1 className="text-[20px] font-black tracking-[-0.5px] text-white leading-none drop-shadow-lg flex items-center gap-[4px]">
             Disney <span className="text-[#ce93d8] opacity-80 text-[18px] font-light">×</span> Pixar
           </h1>
           
           <div className="w-[160px] h-[3px] bg-white/5 rounded-full overflow-hidden mt-[12px] shadow-inner relative">
             <div 
               className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#ce93d8] to-[#4fc3f7] rounded-full transition-all duration-300" 
               style={{ width: `${progress}%`, boxShadow: "0 0 10px rgba(79,195,247,0.5)" }}
             />
           </div>
        </header>

        {syncPanel}
        {rerollControls}
        <main className="flex-1 relative flex flex-col overflow-y-auto w-full">
           {showNotes ? <NotesPanel mob={mob} notes={notes} updateNote={updateNote}/> :
            showFullBracket ? <FullBracket mob={mob} sweet16Rerolled={bracketState.sweet16Rerolled} playInMatches={playInMatches} rounds={rounds} pool64={m64} currentRound={currentRound} currentMatch={currentMatch} isPlayIn={isPlayIn} upsets={upsets}/> :
            champion ? (
              <ChampionScreen
                mob={mob} champion={champion} upsets={upsets} copiedLink={copiedLink} copiedBracket={copiedBracket}
                showBracketPanel={showBracketPanel} playInMatches={playInMatches} rounds={rounds}
                reset={handleReset} onToggleBracket={() => setShowBracketPanel(!showBracketPanel)}
                copyLink={copyLink} copyBracket={copyBracket}
              />
            ) :
            activeMatch ? (
              <MatchView
                mob={mob} bracket={viewBracket} disabled={loadingSavedWork || !!bracketState.restoreError} hoveredSeed={hoveredSeed} setHoveredSeed={setHoveredSeed}
                copiedLink={copiedLink} showBracketPanel={showBracketPanel} notes={notes} movieMeta={movieMeta}
                updateNote={updateNote} pick={pick} reset={handleReset} copyLink={copyLink} onFixMovie={setFixingMovie}
              />
            ) : null}
            
        </main>

        {/* Bottom Nav */}
        <footer className={`shrink-0 bg-[#12122a] border-t border-white/[0.05] pb-[env(safe-area-inset-bottom)] z-10 w-full transition-all duration-300 ${activeMatch && !champion && !showFullBracket && !showNotes ? "translate-y-0 opacity-100 h-auto" : "translate-y-full opacity-0 h-0 overflow-hidden"}`}>
          <div className="flex justify-around items-center h-[60px] px-[8px]">
             <button onClick={() => setShowMobileMenu(true)} className="flex flex-col items-center justify-center p-[8px] text-[#8a8aae]">
                <span className="text-[20px]">☰</span>
             </button>
             <button onClick={undo} disabled={history.length === 0 || loadingSavedWork} className="flex flex-col items-center justify-center p-[8px] disabled:opacity-30 text-[#8a8aae] transition-opacity">
                <span className="text-[20px]">↩</span>
             </button>
             <button onClick={copyLink} className="flex flex-col items-center justify-center p-[8px] text-[#8a8aae]">
                <span className="text-[18px]">{copiedLink ? "✓" : "🔗"}</span>
             </button>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-[9999] font-[Inter,sans-serif] text-[#e0e0f0]">
      {rerollModal}
      <a
        href="#main-content"
        onFocus={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        onBlur={e => { e.currentTarget.style.transform = 'translateY(-100%)'; }}
        className="fixed top-0 left-0 z-[99999] bg-[#12122a] text-[#e0e0f0] px-[16px] py-[8px] no-underline rounded-[0_0_8px_8px] border border-white/15 text-[13px]"
        style={{ transform: 'translateY(-100%)' }}
      >
        Skip to content
      </a>
      {showAuthModal && <AuthModal onClose={()=>setShowAuthModal(false)}/>}
      {fixingMovie && <FixMetaModal mob={mob} movie={fixingMovie} onClose={() => setFixingMovie(null)} onSave={updateSingleMeta} />}
      <Dots mob={mob}/>

      <div
        id="main-content"
        className={[
          "relative z-[1] max-w-[1200px] mx-auto",
          mob ? "px-[16px] pt-[16px] pb-[32px]" : "px-[32px] pt-[20px] pb-[40px]",
        ].join(" ")}
      >
        {/* Header */}
        <div className={["text-center", mob ? "mb-[12px]" : "mb-[28px]"].join(" ")}>
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
          style={{ height: mob ? 8 : 5, marginBottom: mob ? 6 : 6 }}
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
          fbUser={fbUser}
          syncStatus={syncStatus}
          onSignInClick={() => setShowAuthModal(true)}
          onSignOutClick={handleSignOut}
        />
        {syncPanel}
        {rerollControls}

        {/* Full Bracket + Notes toggles */}
        <div
          className={[
            "flex overflow-x-auto pb-[6px] gap-[8px] items-center",
            mob ? "mb-[12px] px-[16px] -mx-[16px]" : "mb-[16px] justify-center flex-wrap",
          ].join(" ")}
          style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`
            #main-content > div.flex.overflow-x-auto::-webkit-scrollbar { display: none; }
          `}</style>
          
          <button
            aria-expanded={showFullBracket}
            className={mob ? "mob-btn" : ""}
            onClick={() => setShowFullBracket(!showFullBracket)}
            style={{
              background: showFullBracket ? "rgba(79,195,247,.12)" : "rgba(255,255,255,.04)",
              border: showFullBracket ? "1px solid rgba(79,195,247,.3)" : "1px solid rgba(255,255,255,.08)",
              color: showFullBracket ? "#4fc3f7" : "#8a8aae",
              padding: mob ? "8px 16px" : "6px 18px", borderRadius: 10,
              fontSize: mob ? 13 : 12, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5,
              transition: "all .15s", minHeight: mob ? 40 : undefined,
              whiteSpace: "nowrap", flexShrink: 0,
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
              padding: mob ? "8px 16px" : "6px 18px", borderRadius: 10,
              fontSize: mob ? 13 : 12, fontWeight: 600, cursor: "pointer", letterSpacing: 0.5,
              transition: "all .15s", minHeight: mob ? 40 : undefined,
              whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            {showNotes ? "Hide Notes" : "📝 Notes"}
          </button>
          
        </div>

        {showNotes && <NotesPanel mob={mob} notes={notes} updateNote={updateNote}/>}

        {showFullBracket && <FullBracket mob={mob} sweet16Rerolled={bracketState.sweet16Rerolled} playInMatches={playInMatches} rounds={rounds} pool64={m64} currentRound={currentRound} currentMatch={currentMatch} isPlayIn={isPlayIn} upsets={upsets}/>}

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
            showBracketPanel={showBracketPanel}
            playInMatches={playInMatches}
            rounds={rounds}
            reset={handleReset}
            onToggleBracket={() => setShowBracketPanel(!showBracketPanel)}
            copyLink={copyLink}
            copyBracket={copyBracket}
          />
        ) : activeMatch ? (
          <MatchView
            mob={mob}
            bracket={viewBracket}
            disabled={loadingSavedWork || !!bracketState.restoreError}
            hoveredSeed={hoveredSeed}
            setHoveredSeed={setHoveredSeed}
            copiedLink={copiedLink}
            showBracketPanel={showBracketPanel}
            notes={notes}
            movieMeta={movieMeta}
            updateNote={updateNote}
            pick={pick}
            reset={handleReset}
            copyLink={copyLink}
            onFixMovie={setFixingMovie}
          />
        ) : null}

      </div>
    </div>
  );
}
