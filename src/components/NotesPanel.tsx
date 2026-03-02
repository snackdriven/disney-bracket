import { useState } from "react";
import { BRACKET_ORDER } from '../lib/data.js';
import { CLR } from '../lib/theme.js';
import type { Movie, Notes, ColorScheme } from '../types.js';

interface NotesPanelProps {
  notes: Notes;
  updateNote: (seed: number, text: string) => void;
  mob: boolean;
}

export function NotesPanel({ notes, updateNote, mob }: NotesPanelProps) {
  const [filter, setFilter] = useState("");
  const filtered = BRACKET_ORDER.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div
      className={[
        "bg-white/[0.03] border border-[rgba(206,147,216,.15)] animate-[fi_.3s]",
        mob ? "mb-[20px] p-[16px] rounded-[14px]" : "mb-[24px] p-[20px] rounded-[16px]",
      ].join(" ")}
    >
      <div className={mob ? "mb-[12px]" : "mb-[14px]"}>
        <h3
          data-testid="notes-panel-header"
          className={[
            "mt-0 font-bold text-[#ce93d8] tracking-[0.5px]",
            mob ? "text-[16px]" : "text-[15px]",
          ].join(" ")}
        >
          Movie Notes
        </h3>
      </div>

      <input
        data-testid="notes-search"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        placeholder="Search movies..."
        className={[
          "w-full box-border bg-black/20 border border-white/[0.06] rounded-[10px]",
          "text-[#d0d0e8] font-[inherit] outline-none",
          mob ? "px-[14px] py-[12px] text-[16px] mb-[12px]" : "px-[12px] py-[8px] text-[12px] mb-[12px]",
        ].join(" ")}
        onFocus={e => { e.target.style.borderColor = "rgba(206,147,216,.3)"; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.06)"; }}
      />

      <div
        className="overflow-y-auto pr-[4px]"
        style={{ maxHeight: mob ? 320 : 400, WebkitOverflowScrolling: "touch" }}
      >
        {filtered.map(m => {
          const note = notes[m.seed] || "";
          const c = CLR[m.studio];
          return <NoteRow key={m.seed} m={m} note={note} c={c} updateNote={updateNote} mob={mob} />;
        })}
      </div>
    </div>
  );
}

interface NoteRowProps {
  m: Movie;
  note: string;
  c: ColorScheme;
  updateNote: (seed: number, text: string) => void;
  mob: boolean;
}

function NoteRow({ m, note, c, updateNote, mob }: NoteRowProps) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={[
        "bg-white/[0.02] rounded-[10px]",
        mob ? "mb-[6px]" : "mb-[6px]",
      ].join(" ")}
      style={{ border: `1px solid ${note ? `${c.accent}18` : "rgba(255,255,255,.04)"}` }}
    >
      <button
        data-testid="notes-panel-item"
        onClick={() => setOpen(!open)}
        className={[
          "w-full bg-transparent border-none cursor-pointer flex items-center gap-[8px] text-left",
          mob ? "p-[12px] min-h-[48px]" : "p-[8px_12px]",
        ].join(" ")}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <span
          className="shrink-0 font-bold opacity-60"
          style={{ fontSize: mob ? 10 : 8, color: c.accent, width: mob ? 24 : 24 }}
        >
          #{m.seed}
        </span>
        <span className={[
          "font-semibold text-[#d0d0e8] flex-1 overflow-hidden text-ellipsis whitespace-nowrap",
          mob ? "text-[14px]" : "text-[12px]",
        ].join(" ")}>
          {m.name}
        </span>
        {!mob && (
          <span className="text-[9px] opacity-50" style={{ color: c.text }}>
            {m.studio} · {m.year}
          </span>
        )}
        {note && (
          <span className="w-[6px] h-[6px] rounded-full bg-[#ce93d8] shrink-0" />
        )}
        <span className={[
          "text-[#6a6a8e] shrink-0",
          mob ? "text-[11px]" : "text-[9px]",
        ].join(" ")}>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div className={mob ? "px-[12px] pb-[12px]" : "px-[12px] pb-[10px]"}>
          <textarea
            value={note}
            onChange={e => updateNote(m.seed, e.target.value)}
            placeholder={`Thoughts on ${m.name}...`}
            rows={2}
            className={[
              "w-full box-border bg-black/20 border border-white/[0.06] rounded-[8px]",
              "text-[#d0d0e8] font-[inherit] resize-y outline-none leading-[1.5]",
              mob ? "px-[10px] py-[8px] text-[15px]" : "px-[8px] py-[6px] text-[11px]",
            ].join(" ")}
            onFocus={e => { e.target.style.borderColor = `${c.accent}44`; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.06)"; }}
          />
        </div>
      )}
    </div>
  );
}
