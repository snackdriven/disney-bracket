import { useState, useCallback } from "react";
import { ALL_MOVIES } from '../lib/data.js';
import { fetchMovieMeta, fetchSingleMovieMeta } from '../lib/meta.js';
import type { Movie, MovieMeta } from '../types.js';

const MOVIES_BY_SEED = new Map(ALL_MOVIES.map(m => [m.seed, m]));

function loadCache(): Record<number, MovieMeta> {
  try { return JSON.parse(localStorage.getItem("tmdb-meta-v1") || "{}") as Record<number, MovieMeta>; }
  catch { return {}; }
}

function saveCache(c: Record<number, MovieMeta>) {
  localStorage.setItem("tmdb-meta-v1", JSON.stringify(c));
}

export type BulkStatus = "idle" | "fetching" | "done" | "error";

export interface EditDraft {
  poster: string;
  rating: string;
  runtime: string;
  plot: string;
}

export function useAdminState() {
  const [tmdbKey, setTmdbKey] = useState(sessionStorage.getItem("tmdb-key") || "");
  const [omdbKey, setOmdbKey] = useState(sessionStorage.getItem("omdb-key") || "");
  const [cache, setCache] = useState<Record<number, MovieMeta>>(loadCache);
  const [bulkStatus, setBulkStatus] = useState<BulkStatus>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [fetchingSeeds, setFetchingSeeds] = useState<Set<number>>(new Set());
  const [editingSeed, setEditingSeed] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft>({ poster: "", rating: "", runtime: "", plot: "" });

  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);

  const updateCache = (updated: Record<number, MovieMeta>) => {
    saveCache(updated);
    setCache({ ...updated });
  };

  const saveKeys = () => {
    if (tmdbKey.trim()) sessionStorage.setItem("tmdb-key", tmdbKey.trim());
    else sessionStorage.removeItem("tmdb-key");
    if (omdbKey.trim()) sessionStorage.setItem("omdb-key", omdbKey.trim());
    else sessionStorage.removeItem("omdb-key");
    addLog("API keys saved to sessionStorage.");
  };

  const bulkRefresh = useCallback(async (force: boolean) => {
    const t = tmdbKey.trim() || null;
    const o = omdbKey.trim() || null;
    if (!t && !o) { addLog("No API keys set. Enter at least one key above."); return; }
    if (force) {
      localStorage.removeItem("tmdb-meta-v1");
      addLog("Cache cleared. Fetching all movies...");
    } else {
      addLog("Fetching missing metadata...");
    }
    setBulkStatus("fetching");
    try {
      const result = await fetchMovieMeta(t, o);
      updateCache(result);
      const withPoster = Object.values(result).filter(m => m?.poster).length;
      const withRating = Object.values(result).filter(m => m?.rating).length;
      addLog(`Done. ${withPoster}/${ALL_MOVIES.length} posters, ${withRating}/${ALL_MOVIES.length} ratings.`);
      setBulkStatus("done");
    } catch (e) {
      addLog(`Error: ${e instanceof Error ? e.message : String(e)}`);
      setBulkStatus("error");
    }
    setTimeout(() => setBulkStatus("idle"), 3000);
  }, [tmdbKey, omdbKey]);

  const refetchOne = async (movie: Movie) => {
    const t = tmdbKey.trim() || null;
    const o = omdbKey.trim() || null;
    if (!t && !o) { addLog(`No API keys — can't refetch ${movie.name}.`); return; }
    setFetchingSeeds(prev => new Set(prev).add(movie.seed));
    try {
      const fresh = await fetchSingleMovieMeta(movie, t, o);
      const updated = { ...cache, [movie.seed]: fresh };
      updateCache(updated);
      addLog(`Refetched ${movie.name}: poster=${!!fresh.poster}, rating=${fresh.rating ?? "—"}, runtime=${fresh.runtime ?? "—"}`);
    } catch (e) {
      addLog(`Error refetching ${movie.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
    setFetchingSeeds(prev => { const s = new Set(prev); s.delete(movie.seed); return s; });
  };

  const openEdit = (movie: Movie) => {
    const meta = cache[movie.seed] ?? {};
    setEditDraft({ poster: meta.poster ?? "", rating: meta.rating ?? "", runtime: meta.runtime ?? "", plot: meta.plot ?? "" });
    setEditingSeed(movie.seed);
  };

  const saveEdit = (seed: number) => {
    const updated = {
      ...cache,
      [seed]: {
        ...(cache[seed] ?? {}),
        ...(editDraft.poster.trim() ? { poster: editDraft.poster.trim() } : {}),
        ...(editDraft.rating.trim() ? { rating: editDraft.rating.trim() } : {}),
        ...(editDraft.runtime.trim() ? { runtime: editDraft.runtime.trim() } : {}),
        ...(editDraft.plot.trim() ? { plot: editDraft.plot.trim() } : {}),
      },
    };
    updateCache(updated);
    const name = MOVIES_BY_SEED.get(seed)?.name ?? `seed ${seed}`;
    addLog(`Saved manual edits for ${name}.`);
    setEditingSeed(null);
  };

  const clearOne = (seed: number) => {
    const updated = { ...cache };
    delete updated[seed];
    updateCache(updated);
    const name = MOVIES_BY_SEED.get(seed)?.name ?? `seed ${seed}`;
    addLog(`Cleared cache for ${name}.`);
    if (editingSeed === seed) setEditingSeed(null);
  };

  const { withPoster, withRating, withRuntime, withPlot } = ALL_MOVIES.reduce(
    (acc, m) => {
      const meta = cache[m.seed];
      if (meta?.poster) acc.withPoster++;
      if (meta?.rating) acc.withRating++;
      if (meta?.runtime) acc.withRuntime++;
      if (meta?.plot) acc.withPlot++;
      return acc;
    },
    { withPoster: 0, withRating: 0, withRuntime: 0, withPlot: 0 }
  );
  const total = ALL_MOVIES.length;
  const isBulkFetching = bulkStatus === "fetching";

  return {
    tmdbKey, setTmdbKey,
    omdbKey, setOmdbKey,
    cache, setCache,
    bulkStatus,
    log, addLog,
    fetchingSeeds,
    editingSeed, setEditingSeed,
    editDraft, setEditDraft,
    saveKeys,
    bulkRefresh,
    refetchOne,
    openEdit,
    saveEdit,
    clearOne,
    stats: {
      withPoster,
      withRating,
      withRuntime,
      withPlot,
      total
    },
    isBulkFetching,
    loadCache,
  };
}
