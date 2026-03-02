import type { ColorScheme } from '../types.js';

export const CLR: Record<string, ColorScheme> = {
  Disney: { bg: "#0d0d1e", accent: "#4fc3f7", text: "#b0d4ff" },
  Pixar:  { bg: "#0d0d1e", accent: "#ff8a65", text: "#ffd0b8" },
};

export const BADGE_CLR: Record<string, { bg: string; tx: string }> = {
  Disney: { bg: "rgba(79,195,247,.12)",  tx: "#4fc3f7" },
  Pixar:  { bg: "rgba(255,138,101,.12)", tx: "#ff8a65" },
};
