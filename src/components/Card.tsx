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
}

export function Card({ movie, hovered, animating, disabled, onHover, onPick, notes, updateNote, mob = false, movieMeta }: CardProps) {
  const c = CLR[movie.studio];
  const [showCardNotes, setShowCardNotes] = useState(false);
  const note = notes?.[movie.seed] || "";
  const meta = movieMeta?.[movie.seed];
  const hasPoster = !!meta?.poster;
  const panelW = mob ? 66 : 78;
  const rTop = showCardNotes ? (mob ? "14px 14px 0 0" : "16px 16px 0 0") : (mob ? 14 : 16);

  const cardBg = `linear-gradient(135deg,${c.bg}f8 0%,${c.bg}dd 100%)`;
  const cardBorder = hovered ? `1.5px solid ${c.accent}55` : "1.5px solid rgba(255,255,255,.06)";
  const sparkling = !showCardNotes && !disabled && hovered;
  const cardBgOpaque = `linear-gradient(135deg,#0e0e21 0%,#0c0c1c 100%)`;

  return (
    <div style={{
      flex: mob ? "1 1 100%" : "1 1 320px",
      maxWidth: mob ? undefined : 560,
      width: mob ? "100%" : undefined,
      background: showCardNotes ? cardBg : "transparent",
      border: showCardNotes ? cardBorder : "none",
      borderRadius: mob ? 14 : 16,
      overflow: showCardNotes ? "hidden" : "visible",
      transition: "border-color .18s",
    }}>
      {/* Spark wrapper */}
      <div style={{
        position: "relative",
        transform: hovered && !animating && !mob ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 ${mob ? 14 : 22}px ${mob ? 36 : 54}px rgba(0,0,0,.5)` : `0 4px ${mob ? 14 : 18}px rgba(0,0,0,.35)`,
        transition: "transform .18s cubic-bezier(.25,.8,.25,1), box-shadow .18s",
        ...(sparkling ? {
          padding: "2px", borderRadius: mob ? 14 : 16, overflow: "hidden",
          background: `conic-gradient(from var(--spark-angle), #0a0a18 0%, #0a0a18 60%, rgba(157,143,224,.04) 68%, rgba(206,147,216,.13) 80%, rgba(249,168,212,.25) 89%, rgba(255,255,255,.35) 94%, #0a0a18 96%)`,
          animation: "spark-rotate 8s linear infinite",
        } : {}),
      }}>
        <button
          data-testid="movie-card"
          className={mob ? "mob-card" : ""}
          onClick={() => !disabled && onPick()}
          onMouseEnter={mob ? undefined : () => onHover(movie.seed)}
          onMouseLeave={mob ? undefined : () => onHover(null)}
          onTouchStart={mob ? () => onHover(movie.seed) : undefined}
          onTouchEnd={mob ? () => onHover(null) : undefined}
          style={{
            width: "100%", padding: 0, position: "relative", overflow: "hidden",
            background: showCardNotes ? "transparent" : (sparkling ? cardBgOpaque : cardBg),
            border: showCardNotes ? "none" : (sparkling ? "none" : cardBorder),
            borderRadius: sparkling ? (mob ? 12 : 14) : rTop,
            cursor: disabled ? "default" : "pointer",
            pointerEvents: disabled ? "none" : "auto",
            transition: "background .18s, box-shadow .18s",
            boxShadow: hovered ? `inset 0 1px 0 ${c.accent}18` : `inset 0 1px 0 rgba(255,255,255,.04)`,
            animation: animating ? "ch .35s ease forwards" : "none",
            display: "flex", flexDirection: "row", alignItems: "stretch",
            minHeight: mob ? 90 : 108, textAlign: "left",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Left panel: full-height poster OR decorative seed number */}
          <div style={{
            width: panelW, flexShrink: 0, position: "relative", overflow: "hidden",
            borderRadius: showCardNotes ? (mob ? "14px 0 0 0" : "16px 0 0 0") : (mob ? "14px 0 0 14px" : "16px 0 0 16px"),
          }}>
            {hasPoster ? (
              <>
                <img
                  src={meta!.poster}
                  alt=""
                  style={{
                    width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top",
                    display: "block", opacity: animating ? 0.45 : 1,
                    transition: "opacity .3s, transform .2s",
                    transform: hovered && !mob ? "scale(1.05)" : "scale(1)",
                  }}
                />
                <div style={{
                  position: "absolute", top: 0, right: 0, bottom: 0, width: "60%",
                  background: `linear-gradient(90deg,transparent,${c.bg}f0)`,
                  pointerEvents: "none",
                }} />
              </>
            ) : (
              <div style={{
                width: "100%", height: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", background: `${c.accent}08`, borderRight: `1px solid ${c.accent}10`,
              }}>
                <span style={{
                  fontSize: mob ? 30 : 36, fontWeight: 900, color: c.accent,
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
            flex: 1, padding: mob ? "11px 12px 11px 10px" : "13px 16px 13px 12px",
            display: "flex", flexDirection: "column", justifyContent: "center",
            gap: mob ? 4 : 5, minWidth: 0,
          }}>
            {/* Top row: seed (when poster) + studio + year + notes dot */}
            <div className="flex items-center gap-[6px]">
              {hasPoster && (
                <span style={{ fontSize: 9, fontWeight: 800, color: c.accent, opacity: 0.5, letterSpacing: 0.5 }}>
                  #{movie.seed}
                </span>
              )}
              <span style={{
                padding: "1px 7px", borderRadius: 20,
                background: BADGE_CLR[movie.studio].bg, color: BADGE_CLR[movie.studio].tx,
                fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
              }}>
                {movie.studio}
              </span>
              <span className="text-[10px] text-[#52526a]">{movie.year}</span>
              {note && !showCardNotes && (
                <span data-testid="notes-dot" className="w-[5px] h-[5px] rounded-full bg-[#ce93d8] shrink-0 ml-[2px]" />
              )}
            </div>

            {/* Title */}
            <div style={{
              fontSize: mob ? "clamp(15px,4.2vw,19px)" : "clamp(15px,1.85vw,20px)",
              fontWeight: 800,
              color: animating ? `${c.accent}70` : "#edeeff",
              lineHeight: 1.22, letterSpacing: -0.25,
              overflow: "hidden", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              transition: "color .18s",
            }}>
              {movie.name}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-[7px] flex-wrap">
              {meta?.runtime && (
                <span className="text-[10px] text-[#50506a]" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {meta.runtime}
                </span>
              )}
              {meta?.rating && (
                <span className="text-[10px] text-[#e5b800] font-bold">★ {meta.rating}</span>
              )}
            </div>

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

            {mob && (
              <div style={{ fontSize: 9, color: c.accent, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", opacity: 0.4 }}>
                Tap to pick
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

        {/* IMDb link sits outside <button> */}
        {movie.imdb && (
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

      <div className="text-center" style={{ marginTop: showCardNotes ? 0 : (mob ? 3 : 3) }}>
        <button
          aria-expanded={showCardNotes}
          aria-label={showCardNotes ? `Hide notes for ${movie.name}` : `Add notes for ${movie.name}`}
          onClick={e => { e.stopPropagation(); setShowCardNotes(!showCardNotes); }}
          className={[
            "bg-transparent border-none text-[#7a7a9e] cursor-pointer tracking-[0.5px]",
            mob ? "text-[11px] px-[14px] py-[5px] min-h-[32px]" : "text-[10px] px-[8px] py-[2px]",
          ].join(" ")}
        >
          {showCardNotes ? "hide notes ▲" : "notes ▼"}
        </button>
      </div>
      {showCardNotes && (
        <CardNotes seed={movie.seed} note={note} updateNote={updateNote} ac={c.accent} bg={c.bg} mob={mob} transparent />
      )}
    </div>
  );
}
