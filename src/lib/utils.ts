import type { Match, SerializedMatch } from '../types.js';

export const loadLS = <T>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
};

export const saveLS = (key: string, val: unknown): void => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ }
};

export const serMatch = (ms: Match[]): SerializedMatch[] =>
  ms.map(m => ({ p: [m[0], m[1]], w: m.winner ?? null }));

export const desMatch = (ms: unknown): Match[] => {
  if (!Array.isArray(ms)) return [];
  return (ms as SerializedMatch[]).map(({ p, w }) => {
    const m = [p[0], p[1]] as Match;
    if (w) m.winner = w;
    return m;
  });
};

export const extractImdbId = (url: string | undefined): string | null =>
  url?.match(/tt\d+/)?.[0] ?? null;
