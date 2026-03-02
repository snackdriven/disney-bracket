import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Btn } from './Btn.js';

interface TmdbModalProps {
  onSave: (tmdb: string, omdb: string) => void;
  onClose: () => void;
}

export function TmdbModal({ onSave, onClose }: TmdbModalProps) {
  const [tmdb, setTmdb] = useState(sessionStorage.getItem("tmdb-key") || "");
  const [omdb, setOmdb] = useState(sessionStorage.getItem("omdb-key") || "");
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => { onCloseRef.current = onClose; });
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCloseRef.current(); return; }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => {
      window.removeEventListener("keydown", h);
      previouslyFocused?.focus();
    };
  }, []); // intentional: onClose accessed via ref
  const save = () => {
    if (tmdb.trim()) sessionStorage.setItem("tmdb-key", tmdb.trim());
    if (omdb.trim()) sessionStorage.setItem("omdb-key", omdb.trim());
    onSave(tmdb.trim(), omdb.trim());
  };
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tmdb-modal-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="bg-[#12122a] border border-white/10 rounded-[16px] p-[28px_24px] max-w-[440px] w-[90%] outline-none animate-[su_0.2s_ease-out]"
      >
        <h3 id="tmdb-modal-title" className="text-[#f0f0ff] mt-0 mb-[6px] text-[18px] font-semibold">
          Movie Posters, Ratings & Runtimes
        </h3>
        <p className="text-[#8a8aa8] text-[12px] mt-0 mb-[18px] leading-[1.6]">
          Keys stored locally, never sent anywhere else. Both are free.
        </p>

        <label className="block text-[#9898b8] text-[11px] mb-[4px] tracking-[0.5px]">
          TMDB API key (v3) —{" "}
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-[#4fc3f7]">
            get one here
          </a>
        </label>
        <input
          value={tmdb}
          onChange={e => setTmdb(e.target.value)}
          placeholder="32-char hex..."
          className="w-full box-border bg-black/30 border border-white/10 rounded-[8px] px-[12px] py-[9px] text-[#e0e0f0] font-mono text-[12px] outline-none mb-[14px]"
        />

        <label className="block text-[#9898b8] text-[11px] mb-[4px] tracking-[0.5px]">
          OMDB API key —{" "}
          <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer" className="text-[#4fc3f7]">
            get one here
          </a>
          <span className="text-[#5a5a7e]"> (for IMDb ratings + runtimes)</span>
        </label>
        <input
          value={omdb}
          onChange={e => setOmdb(e.target.value)}
          placeholder="8-char hex..."
          className="w-full box-border bg-black/30 border border-white/10 rounded-[8px] px-[12px] py-[9px] text-[#e0e0f0] font-mono text-[12px] outline-none mb-[18px]"
        />

        <div className="flex gap-[8px] justify-end">
          <Btn mob={false} s mu onClick={onClose}>Cancel</Btn>
          <Btn mob={false} s onClick={save}>Save & Fetch</Btn>
        </div>
      </div>
    </div>
  );
}
