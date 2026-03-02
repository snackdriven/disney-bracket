import React from "react";

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  p?: boolean;
  s?: boolean;
  mu?: boolean;
  mob: boolean;
}

export function Btn({ children, onClick, p, s, mu, mob }: BtnProps) {
  const base = [
    "rounded-[10px] transition-all duration-150 cursor-pointer font-semibold",
    "leading-none webkit-tap-highlight-transparent",
    mob ? "mob-btn min-h-[48px]" : "",
  ];

  const size = s
    ? (mob ? "px-[18px] py-[10px] text-[13px]" : "px-[16px] py-[6px] text-[12px]")
    : (mob ? "px-[26px] py-[14px] text-[15px]" : "px-[24px] py-[10px] text-[14px]");

  const variant = p
    ? "bg-gradient-to-br from-[#4fc3f7] to-[#2196f3] border-0 text-white font-bold"
    : mu
    ? "bg-white/[0.03] border border-white/[0.06] text-[#9898b8]"
    : "bg-white/[0.06] border border-white/10 text-[#b0b0cc]";

  return (
    <button
      className={[...base, size, variant].filter(Boolean).join(" ")}
      onClick={onClick}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {children}
    </button>
  );
}
