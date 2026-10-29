import { useState, useRef, useCallback, useEffect } from "react";
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

  const pendingUpdatesRef = useRef<Record<number, Partial<MovieMeta>>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushUpdates = useCallback(() => {
    const keys = Object.keys(pendingUpdatesRef.current);
    if (keys.length === 0) return;

    const fromLS = loadLS<Record<number, MovieMeta>>("tmdb-meta-v1", {});
    for (const key of keys) {
      const seed = Number(key);
      const patch = pendingUpdatesRef.current[seed];
      fromLS[seed] = { ...(fromLS[seed] || {}), ...patch };
    }
    localStorage.setItem("tmdb-meta-v1", JSON.stringify(fromLS));
    pendingUpdatesRef.current = {};
  }, []);

  const updateSingleMeta = useCallback((seed: number, patch: Partial<MovieMeta>) => {
    setMovieMeta(prev => ({ ...prev, [seed]: { ...(prev[seed] || {}), ...patch } }));

    pendingUpdatesRef.current[seed] = {
      ...(pendingUpdatesRef.current[seed] || {}),
      ...patch
    };

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(flushUpdates, 250);
  }, [flushUpdates]);

  // Ensure any pending updates are saved when the hook unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        flushUpdates();
      }
    };
  }, [flushUpdates]);

  return {
    movieMeta,
    updateSingleMeta,
  };
}
