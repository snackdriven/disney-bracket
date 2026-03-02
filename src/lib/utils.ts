import type { Match, SerializedMatch, Movie, Phase, Notes, HistoryEntry, UpsetEntry } from '../types.js';

export function isMovie(v: unknown): v is Movie {
  return (
    typeof v === 'object' && v !== null &&
    typeof (v as Movie).seed === 'number' &&
    typeof (v as Movie).name === 'string' &&
    typeof (v as Movie).year === 'number' &&
    ((v as Movie).studio === 'Disney' || (v as Movie).studio === 'Pixar') &&
    typeof (v as Movie).imdb === 'string'
  );
}

export const loadLS = <T>(key: string, fallback: T): T => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
};

export const saveLS = (key: string, val: unknown): void => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ }
};

export const serMatch = (ms: Match[]): SerializedMatch[] =>
  ms.map(m => ({ p: [m.players[0], m.players[1]], w: m.winner ?? null }));

export const desMatch = (ms: unknown): Match[] => {
  if (!Array.isArray(ms)) return [];
  return (ms as SerializedMatch[]).flatMap(entry => {
    if (!entry || typeof entry !== 'object') return [];
    const { p, w } = entry as SerializedMatch;
    if (!Array.isArray(p) || !isMovie(p[0]) || !isMovie(p[1])) return [];
    const m: Match = { players: [p[0], p[1]] };
    if (w && isMovie(w)) m.winner = w;
    return [m];
  });
};

export const extractImdbId = (url: string | undefined): string | null =>
  url?.match(/tt\d+/)?.[0] ?? null;

export function isPhase(v: unknown): v is Phase {
  return v === "pi" || v === "m";
}

export function isNotes(v: unknown): v is Notes {
  return (
    typeof v === "object" && v !== null && !Array.isArray(v) &&
    Object.entries(v as object).every(([k, val]) => !isNaN(Number(k)) && typeof val === "string")
  );
}

export function isHistoryEntry(v: unknown): v is HistoryEntry {
  return (
    typeof v === "object" && v !== null &&
    isPhase((v as HistoryEntry).phase) &&
    typeof (v as HistoryEntry).matchIndex === "number" &&
    typeof (v as HistoryEntry).round === "number" &&
    typeof (v as HistoryEntry).wasUpset === "boolean"
  );
}

export function isUpsetEntry(v: unknown): v is UpsetEntry {
  return (
    typeof v === "object" && v !== null &&
    isMovie((v as UpsetEntry).winner) &&
    isMovie((v as UpsetEntry).loser) &&
    typeof (v as UpsetEntry).round === "string" &&
    typeof (v as UpsetEntry).seedDiff === "number"
  );
}
