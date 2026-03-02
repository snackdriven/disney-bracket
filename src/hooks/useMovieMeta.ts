import { useState, useEffect } from "react";
import { ALL_MOVIES, STATIC_META } from '../lib/data.js';
import { loadLS } from '../lib/utils.js';
import { fetchMovieMeta, loadImages } from '../lib/meta.js';
import { drawBracket } from '../lib/canvas.js';
import type { Movie, Match, MovieMeta, ImgCache, UpsetEntry } from '../types.js';

interface BracketSnapshot {
  rounds: Match[][];
  playInMatches: Match[];
  ch: Movie | null;
  upsets: UpsetEntry[];
}

export function useMovieMeta() {
  const [movieMeta, setMovieMeta] = useState<Record<number, MovieMeta>>(() => {
    const fromLS = loadLS<Record<number, MovieMeta>>("tmdb-meta-v1", {});
    const merged: Record<number, MovieMeta> = {};
    ALL_MOVIES.forEach(m => { merged[m.seed] = { ...STATIC_META[m.seed], ...fromLS[m.seed] }; });
    return merged;
  });
  const [tmdbStatus, setTmdbStatus] = useState<string | null>(null);
  const [showTmdbModal, setShowTmdbModal] = useState(false);
  const [pngStatus, setPngStatus] = useState<string | null>(null);

  const handleFetchMeta = async (overrideTmdb?: string | null, overrideOmdb?: string | null) => {
    const tmdbKey = overrideTmdb !== undefined ? overrideTmdb : sessionStorage.getItem("tmdb-key");
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

  const handleDownloadPng = async (bracket: BracketSnapshot) => {
    setPngStatus("fetching");
    let imgs: ImgCache = {};
    try {
      const hasPoster = Object.values(movieMeta).some(m => m?.poster);
      const metaToUse = hasPoster
        ? movieMeta
        : await fetchMovieMeta(
            sessionStorage.getItem("tmdb-key"),
            sessionStorage.getItem("omdb-key"),
          );
      if (!hasPoster) setMovieMeta(metaToUse as Record<number, MovieMeta>);
      imgs = await loadImages(metaToUse as Record<number, MovieMeta>);
    } catch { /* text-only fallback */ }
    setPngStatus("drawing");
    await new Promise(r => setTimeout(r, 20));
    const canvas = document.createElement("canvas");
    canvas.width = 1920; canvas.height = 1080;
    drawBracket(canvas, { rounds: bracket.rounds, playInMatches: bracket.playInMatches, ch: bracket.ch, upsets: bracket.upsets, imgs });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "disney-and-pixar-bracket.png";
    a.click();
    setPngStatus("done");
    setTimeout(() => setPngStatus(null), 2000);
  };

  const metaCount = Object.values(movieMeta).filter(m => m?.poster || m?.rating).length;

  return {
    movieMeta,
    tmdbStatus,
    showTmdbModal,
    setShowTmdbModal,
    pngStatus,
    handleFetchMeta,
    handleDownloadPng,
    metaCount,
  };
}
