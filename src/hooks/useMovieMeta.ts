import { useState, useEffect } from "react";
import { ALL_MOVIES, STATIC_META } from '../lib/data.js';
import { loadLS } from '../lib/utils.js';
import { fetchMovieMeta } from '../lib/meta.js';
import type { MovieMeta } from '../types.js';

export function useMovieMeta() {
  const [movieMeta, setMovieMeta] = useState<Record<number, MovieMeta>>(() => {
    const fromLS = loadLS<Record<number, MovieMeta>>("tmdb-meta-v1", {});
    const merged: Record<number, MovieMeta> = {};
    ALL_MOVIES.forEach(m => { merged[m.seed] = { ...STATIC_META[m.seed], ...fromLS[m.seed] }; });
    return merged;
  });
  const [tmdbStatus, setTmdbStatus] = useState<string | null>(null);
  const [showTmdbModal, setShowTmdbModal] = useState(false);

  const handleFetchMeta = async (overrideTmdb?: string | null, overrideOmdb?: string | null) => {
    const tmdbKey = overrideTmdb !== undefined ? overrideTmdb : (sessionStorage.getItem("tmdb-key") || import.meta.env.VITE_TMDB_KEY || "fa8cad87275234c1faee168084b21941");
    const omdbKey = overrideOmdb !== undefined ? overrideOmdb : sessionStorage.getItem("omdb-key");
    if (!tmdbKey && !omdbKey) { setShowTmdbModal(true); return; }
    setTmdbStatus("fetching");
    try {
      const map = await fetchMovieMeta(tmdbKey, omdbKey);
      setMovieMeta(map);
      setTmdbStatus("done");
    } catch {
      setTmdbStatus("error");
    }
    setTimeout(() => setTmdbStatus(null), 3000);
  };

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

  // Auto-fetch on mount if API keys exist and cache is incomplete
  useEffect(() => {
    const tmdbKey = sessionStorage.getItem("tmdb-key");
    const omdbKey = sessionStorage.getItem("omdb-key");
    const cachedPosters = (() => {
      try { return Object.values(JSON.parse(localStorage.getItem("tmdb-meta-v1")||"{}") as Record<string, MovieMeta>).filter(m => m?.poster).length; }
      catch { return 0; }
    })();
    if ((tmdbKey || omdbKey) && cachedPosters < ALL_MOVIES.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleFetchMeta(tmdbKey, omdbKey);
    }
  }, []); // intentional: mount-only, reads sessionStorage not state

  const metaCount = Object.values(movieMeta).filter(m => m?.poster || m?.rating).length;

  return {
    movieMeta,
    tmdbStatus,
    showTmdbModal,
    setShowTmdbModal,
    handleFetchMeta,
    updateSingleMeta,
    metaCount,
  };
}
