import { useState } from "react";
import { ALL_MOVIES, STATIC_META } from '../lib/data.js';
import { loadLS } from '../lib/utils.js';
import type { MovieMeta } from '../types.js';

export function useMovieMeta() {
  const [movieMeta, setMovieMeta] = useState<Record<number, MovieMeta>>(() => {
    const fromLS = loadLS<Record<number, MovieMeta>>("tmdb-meta-v1", {});
    const merged: Record<number, MovieMeta> = {};
    ALL_MOVIES.forEach(m => { merged[m.seed] = { ...STATIC_META[m.seed], ...fromLS[m.seed] }; });
    return merged;
  });

  const updateSingleMeta = (seed: number, patch: Partial<MovieMeta>) => {
    setMovieMeta(prev => {
      const next = { ...prev, [seed]: { ...(prev[seed] || {}), ...patch } };
      // Save to localStorage so it persists
      const fromLS = loadLS<Record<number, MovieMeta>>("tmdb-meta-v1", {});
      fromLS[seed] = { ...(fromLS[seed] || {}), ...patch };
      localStorage.setItem("tmdb-meta-v1", JSON.stringify(fromLS));
      return next;
    });
  };

  return {
    movieMeta,
    updateSingleMeta,
  };
}
