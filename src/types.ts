export type Studio = "Disney" | "Pixar";

export interface Movie {
  seed: number;
  name: string;
  year: number;
  studio: Studio;
  imdb: string;
}

// 2-tuple + optional winner mutated in place
export type Match = [Movie, Movie] & { winner?: Movie };

export type Phase = "pi" | "m";

export interface BracketState {
  ph: Phase;
  piM: Match[];      // 6 play-in matches
  piI: number;       // current play-in index (0-5)
  rds: Match[][];    // rds[round][matchIndex]
  cr: number;        // current round
  cm: number;        // current match
  ch: Movie | null;
  hi: HistoryEntry[];
  upsets: UpsetEntry[];
}

export interface HistoryEntry {
  p: Phase;
  i: number;
  r: number;
  wasUpset: boolean;
}

export interface UpsetEntry {
  winner: Movie;
  loser: Movie;
  round: string;
  seedDiff: number;
}

export interface SerializedMatch {
  p: [Movie, Movie];
  w: Movie | null;
}

export type Notes = Record<number, string>;
export type ImgCache = Record<number, HTMLImageElement>;

export interface MovieMeta {
  runtime?: string;
  rating?: string;
  plot?: string;
  poster?: string;
}
export type StaticMeta = Record<number, MovieMeta>;

export interface ColorScheme {
  bg: string;
  ac: string;
  gl: string;
  tx: string;
}
