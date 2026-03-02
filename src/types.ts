export type Studio = "Disney" | "Pixar";

export interface Movie {
  seed: number;
  name: string;
  year: number;
  studio: Studio;
  imdb: string;
}

export interface Match {
  players: [Movie, Movie];
  winner?: Movie;
}

// Like Match but players may be null (display-only, not yet decided rounds)
export interface DisplayMatch {
  players: [Movie | null, Movie | null];
  winner?: Movie;
}

export type Phase = "pi" | "m";

export interface BracketState {
  phase: Phase;
  playInMatches: Match[];
  playInIndex: number;
  rounds: Match[][];
  currentRound: number;
  currentMatch: number;
  champion: Movie | null;
  history: HistoryEntry[];
  upsets: UpsetEntry[];
}

export interface HistoryEntry {
  phase: Phase;
  matchIndex: number;
  round: number;
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
  accent: string;
  text: string;
}
