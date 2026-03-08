import { ALL_MOVIES } from './data.js';
import { extractImdbId } from './utils.js';
import type { Movie, MovieMeta, ImgCache } from '../types.js';

export async function fetchMovieMeta(tmdbKey: string | null, omdbKey: string | null): Promise<Record<number, MovieMeta>> {
  const cache: Record<number, MovieMeta> = (() => { try { return JSON.parse(localStorage.getItem("tmdb-meta-v1")||"{}") as Record<number, MovieMeta>; } catch { return {}; } })();
  const missing = ALL_MOVIES.filter(m => (!cache[m.seed]?.poster || !cache[m.seed]?.plot) && extractImdbId(m.imdb));
  const BATCH = 20;
  for (let i = 0; i < missing.length; i += BATCH) {
    await Promise.all(missing.slice(i, i + BATCH).map(async m => {
      const id = extractImdbId(m.imdb);
      cache[m.seed] = cache[m.seed] || {};
      try {
        if (tmdbKey) {
          const r = await fetch(`https://api.themoviedb.org/3/find/${id}?external_source=imdb_id`, {
            headers: { Authorization: `Bearer ${tmdbKey}` },
          });
          const d = await r.json() as { movie_results?: Array<{ poster_path?: string; overview?: string }> };
          const mov = d.movie_results?.[0];
          if (mov?.poster_path) cache[m.seed].poster = `https://image.tmdb.org/t/p/w92${mov.poster_path}`;
          if (mov?.overview) cache[m.seed].plot = cache[m.seed].plot || mov.overview;
        }
        if (omdbKey) {
          const r = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${omdbKey}`);
          const d = await r.json() as { Runtime?: string; imdbRating?: string; Poster?: string; Plot?: string };
          if (d.Runtime && d.Runtime !== "N/A") cache[m.seed].runtime = d.Runtime;
          if (d.imdbRating && d.imdbRating !== "N/A") cache[m.seed].rating = d.imdbRating;
          if (!cache[m.seed].poster && d.Poster && d.Poster !== "N/A") cache[m.seed].poster = d.Poster;
          if (d.Plot && d.Plot !== "N/A") cache[m.seed].plot = d.Plot; // OMDB wins — shorter and cleaner
        }
      } catch { /* silent per-movie failure */ }
    }));
  }
  localStorage.setItem("tmdb-meta-v1", JSON.stringify(cache));
  return cache;
}

export async function fetchSingleMovieMeta(movie: Movie, tmdbKey: string | null, omdbKey: string | null): Promise<MovieMeta> {
  const id = extractImdbId(movie.imdb);
  const result: MovieMeta = {};
  if (!id) return result;
  try {
    if (tmdbKey) {
      const r = await fetch(`https://api.themoviedb.org/3/find/${id}?external_source=imdb_id`, {
        headers: { Authorization: `Bearer ${tmdbKey}` },
      });
      const d = await r.json() as { movie_results?: Array<{ poster_path?: string; overview?: string }> };
      const mov = d.movie_results?.[0];
      if (mov?.poster_path) result.poster = `https://image.tmdb.org/t/p/w92${mov.poster_path}`;
      if (mov?.overview) result.plot = mov.overview;
    }
    if (omdbKey) {
      const r = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${omdbKey}`);
      const d = await r.json() as { Runtime?: string; imdbRating?: string; Poster?: string; Plot?: string };
      if (d.Runtime && d.Runtime !== "N/A") result.runtime = d.Runtime;
      if (d.imdbRating && d.imdbRating !== "N/A") result.rating = d.imdbRating;
      if (!result.poster && d.Poster && d.Poster !== "N/A") result.poster = d.Poster;
      if (d.Plot && d.Plot !== "N/A") result.plot = d.Plot;
    }
  } catch { /* silent failure */ }
  return result;
}

export async function loadImages(metaMap: Record<number, MovieMeta>): Promise<ImgCache> {
  const imgs: ImgCache = {};
  await Promise.all(Object.entries(metaMap).map(([seed, meta]) => {
    if (!meta?.poster) return Promise.resolve();
    return new Promise<void>(res => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { imgs[Number(seed)] = img; res(); };
      img.onerror = () => res();
      img.src = meta.poster!;
    });
  }));
  return imgs;
}
