import { useState } from "react";
import { ALL_MOVIES, STATIC_META } from '../lib/data.js';
import { loadLS } from '../lib/utils.js';
import type { MovieMeta } from '../types.js';

export function useMovieMeta() {
  const [movieMeta, setMovieMeta] = useState<Record<number, MovieMeta>>(() => {
    const fromLS = loadLS<Record<number, MovieMeta>>("tmdb-meta-v1", {});
    const merged: Record<number, MovieMeta> = {};
    for (let i = 0; i < ALL_MOVIES.length; i++) {
      const seed = ALL_MOVIES[i].seed;
      const lsMeta = fromLS[seed];
      merged[seed] = lsMeta ? { ...STATIC_META[seed], ...lsMeta } : STATIC_META[seed];
    }
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
