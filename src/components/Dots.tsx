import { useState } from "react";

const DOT_COLORS = ['255,255,255','255,255,255','255,255,255','249,168,212','206,147,216'];

interface DotConfig {
  w: number; h: number; op: number; l: number; t: number;
  dur: number; del: number; col: string; er: boolean;
}

interface DotsProps {
  mob: boolean;
}

export function Dots({ mob }: DotsProps) {
  const [allDots] = useState<DotConfig[]>(() =>
    Array.from({length:110}, () => ({
      w: Math.random()*3+.5, h: Math.random()*3+.5,
      op: Math.random()*.6+.1, l: Math.random()*100, t: Math.random()*100,
      dur: Math.random()*3+1.2, del: Math.random()*5,
      col: DOT_COLORS[Math.floor(Math.random()*DOT_COLORS.length)],
      er: Math.random() > 0.65,
    }))
  );
  const dots = mob ? allDots.slice(0, 40) : allDots;

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0">
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: d.w,
            height: d.h,
            background: `rgba(${d.col},${d.op})`,
            left: `${d.l}%`,
            top: `${d.t}%`,
            animation: `${d.er ? "tw2" : "tw"} ${d.dur}s ${d.er ? "linear" : "ease-in-out"} infinite`,
            animationDelay: `${d.del}s`,
          }}
        />
      ))}
    </div>
  );
}
