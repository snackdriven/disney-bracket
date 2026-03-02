interface CardNotesProps {
  seed: number;
  note: string;
  updateNote: (seed: number, text: string) => void;
  ac: string;
  bg: string;
  mob: boolean;
  transparent?: boolean;
}

export function CardNotes({ seed, note, updateNote, ac, bg, mob, transparent }: CardNotesProps) {
  return (
    <div
      style={transparent ? { borderTop: "none" } : {
        background: `linear-gradient(155deg,${bg}ee,${bg}cc)`,
        border: `1px solid ${ac}22`,
        borderTop: "none",
        borderRadius: "0 0 14px 14px",
      }}
      className={transparent ? "border-t-0 px-[14px] pb-[14px] pt-[10px]" : (mob ? "px-[14px] pb-[14px] pt-[10px]" : "px-[14px] pb-[12px] pt-[10px]")}
    >
      <textarea
        value={note}
        onChange={e => updateNote(seed, e.target.value)}
        onClick={e => e.stopPropagation()}
        placeholder="Your thoughts..."
        rows={2}
        className={[
          "w-full box-border bg-black/25 border border-white/[0.08] rounded-[8px] text-[#d0d0e8]",
          "font-[inherit] resize-y outline-none leading-[1.5]",
          mob ? "px-[10px] py-[8px] text-[15px]" : "px-[8px] py-[6px] text-[11px]",
        ].join(" ")}
        onFocus={e => { e.target.style.borderColor = `${ac}44`; }}
        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.08)"; }}
      />
    </div>
  );
}
