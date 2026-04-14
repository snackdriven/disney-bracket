import { useState } from "react";
import { FACTS } from '../lib/data.js';
import { CLR, BADGE_CLR } from '../lib/theme.js';
import { CardNotes } from './CardNotes.js';
import type { Movie, Notes, MovieMeta } from '../types.js';

interface CardProps {
  movie: Movie;
  hovered: boolean;
  animating: boolean;
  disabled: boolean;
  onHover: (seed: number | null) => void;
  onPick: () => void;
  notes: Notes;
  updateNote: (seed: number, text: string) => void;
  mob?: boolean;
  movieMeta: Record<number, MovieMeta>;
  onFixMovie?: (movie: Movie) => void;
}

export function Card({ movie, hovered, animating, disabled, onHover, onPick, notes, updateNote, mob = false, movieMeta, onFixMovie }: CardProps) {
  const c = CLR[movie.studio];
  const [showCardNotes, setShowCardNotes] = useState(false);
  const note = notes?.[movie.seed] || "";
  const meta = movieMeta?.[movie.seed];
  const hasPoster = !!meta?.poster;
  const panelW = mob ? "38%" : 78;
  const rTop = showCardNotes ? (mob ? "14px 14px 0 0" : "16px 16px 0 0") : (mob ? 14 : 16);

  const cardBg = `linear-gradient(135deg,${c.bg}f8 0%,${c.bg}dd 100%)`;
  const cardBorder = hovered ? `1.5px solid ${c.accent}55` : "1.5px solid rgba(255,255,255,.06)";
  const sparkling = !showCardNotes && !disabled && hovered;
  const cardBgOpaque = `linear-gradient(135deg,#0e0e21 0%,#0c0c1c 100%)`;

  return (
    <div style={{
      flex: mob ? "1" : "1 1 320px",
      height: mob ? "100%" : undefined,
      maxWidth: mob ? undefined : 560,
      width: mob ? "100%" : undefined,
      background: showCardNotes ? cardBg : "transparent",
      border: showCardNotes ? cardBorder : "none",
      borderRadius: mob ? 14 : 16,
      overflow: showCardNotes ? "hidden" : "visible",
      transition: "border-color .18s",
      display: "flex", flexDirection: "column",
    }}>
      {/* Spark wrapper */}
      <div style={{
        position: "relative",
        flex: mob ? 1 : undefined,
        display: "flex", flexDirection: "column",
        transform: hovered && !animating && !mob ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 ${mob ? 14 : 22}px ${mob ? 36 : 54}px rgba(0,0,0,.5)` : `0 4px ${mob ? 14 : 18}px rgba(0,0,0,.35)`,
        transition: "transform .18s cubic-bezier(.25,.8,.25,1), box-shadow .18s",
        ...(sparkling ? {
          padding: "2px", borderRadius: mob ? 14 : 16, overflow: "hidden",
          background: `conic-gradient(from var(--spark-angle), #0a0a18 0%, #0a0a18 60%, rgba(157,143,224,.04) 68%, rgba(206,147,216,.13) 80%, rgba(249,168,212,.25) 89%, rgba(255,255,255,.35) 94%, #0a0a18 96%)`,
          animation: "spark-rotate 8s linear infinite",
        } : {}),
      }}>
        <div 
           className={mob ? "flex flex-row overflow-x-auto snap-x snap-mandatory scrollbar-none w-full h-full" : "w-full h-full"}
           style={mob ? { scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" } : {}}
        >
        <button
          data-testid="movie-card"
          className={mob ? "mob-card snap-start shrink-0 w-full relative" : "relative w-full"}
          onClick={() => !disabled && onPick()}
          onMouseEnter={mob ? undefined : () => onHover(movie.seed)}
          onMouseLeave={mob ? undefined : () => onHover(null)}
          onTouchStart={mob ? () => onHover(movie.seed) : undefined}
          onTouchEnd={mob ? () => onHover(null) : undefined}
          style={{
            padding: 0, overflow: "hidden",
            background: showCardNotes ? "transparent" : (sparkling ? cardBgOpaque : cardBg),
            border: showCardNotes ? "none" : (sparkling ? "none" : cardBorder),
            borderRadius: sparkling ? (mob ? 12 : 14) : rTop,
            cursor: disabled ? "default" : "pointer",
            pointerEvents: disabled ? "none" : "auto",
            transition: "background .18s, box-shadow .18s",
            boxShadow: hovered ? `inset 0 1px 0 ${c.accent}18` : `inset 0 1px 0 rgba(255,255,255,.04)`,
            animation: animating ? "ch .35s ease forwards" : "none",
            display: "flex", flexDirection: "row", alignItems: "stretch",
            ...(mob ? { minHeight: 0 } : { minHeight: 108 }),
            textAlign: "left", WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Left panel: full-height poster OR decorative seed number */}
          <div style={{
            width: mob ? "40%" : panelW, flexShrink: 0, position: "relative", overflow: "hidden",
            borderRadius: showCardNotes ? (mob ? "14px 0 0 0" : "16px 0 0 0") : (mob ? "14px 0 0 14px" : "16px 0 0 16px"),
          }}>
            {hasPoster ? (
              <>
                <img
                  src={meta!.poster}
                  alt=""
                  style={{
                    width: "100%", height: "100%", 
                    objectFit: "cover", objectPosition: "center top",
                    display: "block", opacity: animating ? 0.45 : 1,
                    transition: "opacity .3s, transform .2s",
                    transform: hovered && !mob ? "scale(1.05)" : "scale(1)",
                  }}
                />
                <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10" />
              </>
            ) : (
              <div style={{
                width: "100%", height: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", background: `${c.accent}08`, borderRight: `1px solid ${c.accent}10`,
              }}>
                <span style={{
                  fontSize: mob ? 36 : 36, fontWeight: 900, color: c.accent,
                  opacity: hovered ? 0.22 : 0.1, lineHeight: 1, userSelect: "none",
                  transition: "opacity .18s", fontVariantNumeric: "tabular-nums",
                }}>
                  {movie.seed}
                </span>
              </div>
            )}
          </div>

          {/* Content area */}
          <div style={{
            flex: 1, padding: mob ? "16px 12px 16px 14px" : "13px 16px 13px 12px",
            display: "flex", flexDirection: "column", 
            justifyContent: mob ? "center" : "flex-start", 
            alignItems: "stretch",
            gap: mob ? 6 : 5, minWidth: 0, width: "100%",
          }}>
            {/* Top row: seed (when poster) + studio + year + notes dot */}
            <div className={`flex items-center ${mob ? 'flex-wrap' : ''} gap-[6px]`}>
              {hasPoster && (
                <span style={{ fontSize: mob ? 11 : 9, fontWeight: 800, color: c.accent, opacity: 0.5, letterSpacing: 0.5 }}>
                  #{movie.seed}
                </span>
              )}
              <span style={{
                padding: "1px 7px", borderRadius: 20,
                background: BADGE_CLR[movie.studio].bg, color: BADGE_CLR[movie.studio].tx,
                fontSize: mob ? 10 : 9, fontWeight: 700, letterSpacing: 0.4,
              }}>
                {movie.studio}
              </span>
              <span className={`text-[${mob ? 11 : 10}px] text-[#52526a]`}>{movie.year}</span>
              {note && !showCardNotes && (
                <span data-testid="notes-dot" className="w-[5px] h-[5px] rounded-full bg-[#ce93d8] shrink-0 ml-[2px]" />
              )}
            </div>

            {/* Title */}
            <div style={{
              fontSize: mob ? "clamp(18px,5.5vw,26px)" : "clamp(15px,1.85vw,20px)",
              fontWeight: 800,
              color: animating ? `${c.accent}70` : "#edeeff",
              lineHeight: 1.15, letterSpacing: -0.25,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: mob ? 4 : 2, WebkitBoxOrient: "vertical",
              transition: "color .18s",
            }}>
              {movie.name}
            </div>

            {/* Stats row */}
            <div className={`flex items-center gap-[7px] flex-wrap mt-[4px]`}>
              {meta?.runtime && (
                <span className={`text-[${mob ? 11 : 10}px] text-[#50506a]`} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {meta.runtime}
                </span>
              )}
              {meta?.rating && (
                <span className={`text-[${mob ? 11 : 10}px] text-[#e5b800] font-bold`}>★ {meta.rating}</span>
              )}
              {mob && movie.imdb && (
                <a
                  href={movie.imdb}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="px-[6px] py-[1px] rounded-[4px] bg-[#e5b800]/10 border border-[#e5b800]/20 text-[#c49a00] text-[9px] font-bold tracking-[0.5px] uppercase no-underline"
                >
                  IMDb ↗
                </a>
              )}
            </div>

            {/* Mobile Plot Preview (inline on Page 1) */}
            {mob && meta?.plot && (
              <div 
                className="mt-[4px] text-[#8a8a9e] text-[11px] leading-[1.4] overflow-hidden"
                style={{ 
                  display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" 
                }}
              >
                {meta.plot}
              </div>
            )}

            {/* Swipe Indicator Hint for Mobile */}
            {mob && (FACTS[movie.name] || meta?.plot) && (
              <div className="absolute right-[8px] top-1/2 -translate-y-1/2 flex items-center justify-center opacity-40 pointer-events-none animate-pulse">
                <span className="text-[14px]">›</span>
              </div>
            )}

            {/* Plot — desktop hover only */}
            {!mob && !showCardNotes && meta?.plot && (
              <div style={{
                fontSize: 11, color: "#7a7a9e", lineHeight: 1.5,
                overflow: "hidden", display: "-webkit-box",
                WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                maxHeight: hovered ? "54px" : "0px",
                opacity: hovered ? 1 : 0,
                transition: "opacity .2s, max-height .22s",
                marginTop: hovered ? 3 : 0,
              }}>
                {meta.plot}
              </div>
            )}

            {/* Trivia — only when notes open */}
            {showCardNotes && FACTS[movie.name] && (
              <div className="text-[11px] text-[#7a7a9e] leading-[1.55] mt-[2px]">
                {FACTS[movie.name]}
              </div>
            )}
          </div>

          {/* Hover: left accent bar */}
          <div style={{
            position: "absolute", left: 0, top: "15%", bottom: "15%", width: 3,
            background: `linear-gradient(180deg,transparent,${c.accent}cc,transparent)`,
            borderRadius: 2, opacity: hovered && !mob ? 1 : 0, transition: "opacity .18s",
          }} />

          {/* Desktop pick hint */}
          {hovered && !mob && !animating && !meta?.plot && (
            <div style={{
              position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
              fontSize: 11, color: c.accent, fontWeight: 700, letterSpacing: 1, opacity: 0.7,
            }}>
              Pick →
            </div>
          )}
        </button>

        {/* --- PAGE 2: SWIPEABLE SYNOPSIS FOR MOBILE --- */}
        {mob && (FACTS[movie.name] || meta?.plot || onFixMovie) && (
          <div 
            className="snap-start shrink-0 w-full h-full relative"
            style={{ 
              background: showCardNotes ? "transparent" : `linear-gradient(135deg,#0e0e1a 0%,#0c0c16 100%)`,
              borderRadius: sparkling ? 12 : rTop,
            }}
          >
            <div className="absolute inset-0 p-[16px] flex flex-col items-center">
               <div className="flex-1 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 text-center">
                 <h4 className="text-[12px] uppercase tracking-[2px] text-[#ce93d8] mb-[8px] font-black">
                   {FACTS[movie.name] ? "Fun Fact" : "Synopsis"}
                 </h4>
                 <p className="text-[13px] text-[#9a9aac] leading-[1.6]">
                   {FACTS[movie.name] || meta?.plot}
                 </p>
               </div>

               <div className="flex gap-[12px] mt-auto pt-[16px] border-t border-white/5 w-full justify-center">
                  <button
                    onClick={e => { e.stopPropagation(); setShowCardNotes(!showCardNotes); }}
                    className={`bg-white/5 border rounded-[8px] px-[12px] py-[8px] text-[11px] uppercase font-bold tracking-[1px] transition-colors ${showCardNotes ? 'border-[#ce93d8]/40 text-[#ce93d8]' : 'border-white/10 text-[#7a7a9e]'}`}
                  >
                    📝 Note
                  </button>
                  {onFixMovie && (
                    <button
                      onClick={e => { e.stopPropagation(); onFixMovie(movie); }}
                      className="bg-[#4fc3f7]/5 border border-[#4fc3f7]/20 text-[#4fc3f7]/80 rounded-[8px] px-[12px] py-[8px] text-[11px] uppercase font-bold tracking-[1px]"
                    >
                      ⚙️ Fix
                    </button>
                  )}
               </div>
            </div>
            
            {/* Nav hint to swipe back */}
            <div className="absolute left-[8px] top-1/2 -translate-y-1/2 flex items-center justify-center opacity-40 pointer-events-none animate-pulse">
                <span className="text-[14px]">‹</span>
            </div>
          </div>
        )}

        </div> {/* END SNAP SCROLL CONTAINER */}

        {/* IMDb link sits outside <button> (Desktop Only) */}
        {!mob && movie.imdb && (
          <a
            href={movie.imdb}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`IMDb page for ${movie.name}`}
            onClick={e => e.stopPropagation()}
            style={{
              position: "absolute", bottom: sparkling ? 10 : 8, right: sparkling ? 10 : 8,
              padding: "1px 5px", borderRadius: 3, background: "#e5b80010", color: "#c49a00",
              fontSize: 9, fontWeight: 700, textDecoration: "none",
              border: "1px solid #e5b80018", letterSpacing: 0.3, zIndex: 1,
            }}
          >
            IMDb ↗
          </a>
        )}
      </div>

      {!mob && (
        <div className="text-center flex justify-center items-center" style={{ marginTop: showCardNotes ? 0 : 3 }}>
          <button
            aria-expanded={showCardNotes}
            aria-label={showCardNotes ? `Hide notes for ${movie.name}` : `Add notes for ${movie.name}`}
            onClick={e => { e.stopPropagation(); setShowCardNotes(!showCardNotes); }}
            className="bg-transparent border-none text-[#7a7a9e] cursor-pointer tracking-[0.5px] text-[10px] px-[8px] py-[2px]"
          >
            {showCardNotes ? "hide notes ▲" : "notes ▼"}
          </button>
          {onFixMovie && (
            <button
              onClick={e => { e.stopPropagation(); onFixMovie(movie); }}
              className="bg-transparent border-none text-[#4fc3f7] opacity-60 hover:opacity-100 cursor-pointer tracking-[0.5px] text-[10px] px-[8px] py-[2px]"
              title="Fix wrong movie or tricky poster"
            >
              ✏️ fix
            </button>
          )}
        </div>
      )}
      {showCardNotes && (
        <CardNotes seed={movie.seed} note={note} updateNote={updateNote} ac={c.accent} bg={c.bg} mob={mob} transparent />
      )}
    </div>
  );
}
