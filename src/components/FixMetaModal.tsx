import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Btn } from './Btn.js';
import { getTmdbIdFromImdb, fetchTmdbPosters, fetchTmdbSearch, TmdbSearchResult } from '../lib/meta.js';
import type { Movie, MovieMeta } from '../types.js';

interface FixMetaModalProps {
  movie: Movie;
  onSave: (seed: number, patch: Partial<MovieMeta>) => void;
  onClose: () => void;
  mob: boolean;
}

export function FixMetaModal({ movie, onSave, onClose, mob }: FixMetaModalProps) {
  const [mode, setMode] = useState<"posters" | "search">("posters");
  
  // Posters mode
  const [posters, setPosters] = useState<string[]>([]);
  const [loadingPosters, setLoadingPosters] = useState(false);
  
  // Search mode
  const [query, setQuery] = useState(movie.name);
  const [results, setResults] = useState<TmdbSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => { onCloseRef.current = onClose; });
  
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCloseRef.current(); return; }
    };
    window.addEventListener("keydown", h);
    return () => {
      window.removeEventListener("keydown", h);
      previouslyFocused?.focus();
    };
  }, []);
  const tmdbKey = sessionStorage.getItem("tmdb-key") || import.meta.env.VITE_TMDB_KEY || "fa8cad87275234c1faee168084b21941";

  useEffect(() => {
    if (mode === "posters" && posters.length === 0 && tmdbKey) {
      setLoadingPosters(true);
      getTmdbIdFromImdb(movie.imdb.replace("https://www.imdb.com/title/", "").replace("/", ""), tmdbKey).then(id => {
        if (id) {
          fetchTmdbPosters(id, tmdbKey).then(p => {
            setPosters(p);
            setLoadingPosters(false);
          });
        } else {
          setLoadingPosters(false);
        }
      });
    }
  }, [mode, movie.imdb, posters.length, tmdbKey]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || !tmdbKey) return;
    setLoadingSearch(true);
    const res = await fetchTmdbSearch(query, tmdbKey);
    setResults(res);
    setLoadingSearch(false);
  };

  useEffect(() => {
    if (mode === "search" && results.length === 0 && query && tmdbKey) {
      handleSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handlePickPoster = (posterUrl: string) => {
    onSave(movie.seed, { poster: posterUrl });
    onClose();
  };

  const handlePickMovie = (res: TmdbSearchResult) => {
    onSave(movie.seed, {
      poster: res.poster_path ? `https://image.tmdb.org/t/p/w185${res.poster_path}` : undefined,
      plot: res.overview,
    });
    onClose();
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/75 z-[100] flex items-center justify-center">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="bg-[#12122a] border border-white/10 rounded-[16px] p-[24px_20px] max-w-[500px] w-[95%] outline-none animate-[su_0.2s_ease-out] flex flex-col max-h-[85vh]"
      >
        <h3 className="text-[#f0f0ff] mt-0 mb-[16px] text-[18px] font-semibold text-center">
          Fix Info: {movie.name}
        </h3>
        
        {!tmdbKey ? (
          <div className="text-center text-[#ff8a65] mb-[20px] p-[16px] bg-[#ff8a6511] rounded-[8px]">
            You need to add a TMDB API key in settings to search for alternate movies and posters.
          </div>
        ) : (
          <>
            <div className="flex bg-black/30 rounded-[8px] p-[4px] mb-[16px]">
              <button
                className={`flex-1 py-[8px] rounded-[6px] text-[13px] font-semibold transition-colors ${mode === "posters" ? "bg-[#4fc3f722] text-[#4fc3f7]" : "text-[#7a7a9e] hover:text-[#a0a0c0]"}`}
                onClick={() => setMode("posters")}
              >
                Alternate Posters
              </button>
              <button
                className={`flex-1 py-[8px] rounded-[6px] text-[13px] font-semibold transition-colors ${mode === "search" ? "bg-[#4fc3f722] text-[#4fc3f7]" : "text-[#7a7a9e] hover:text-[#a0a0c0]"}`}
                onClick={() => setMode("search")}
              >
                Wrong Movie?
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-[4px]">
              {mode === "posters" ? (
                <div>
                  {loadingPosters ? (
                    <div className="text-center text-[#8a8aa8] py-[40px]">Loading posters...</div>
                  ) : posters.length > 0 ? (
                    <div className="grid grid-cols-3 gap-[10px]">
                      {posters.map(p => (
                        <button key={p} onClick={() => handlePickPoster(p)} className="p-0 border hover:border-[#4fc3f7] border-transparent rounded-[8px] overflow-hidden transition-all bg-black cursor-pointer aspect-[2/3]">
                          <img src={p} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-[#8a8aa8] py-[40px]">No alternate posters found.</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <form onSubmit={handleSearch} className="flex gap-[8px] mb-[16px]">
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Movie Title..."
                      className="flex-1 box-border bg-black/30 border border-white/10 rounded-[8px] px-[12px] py-[9px] text-[#e0e0f0] text-[13px] outline-none"
                    />
                    <Btn mob={mob} s onClick={() => handleSearch()}>Search</Btn>
                  </form>
                  {loadingSearch ? (
                    <div className="text-center text-[#8a8aa8] flex-1 py-[20px]">Searching...</div>
                  ) : results.length > 0 ? (
                    <div className="flex flex-col gap-[12px]">
                      {results.map(r => (
                        <button
                          key={r.id}
                          onClick={() => handlePickMovie(r)}
                          className="flex gap-[12px] items-center p-[8px] text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#4fc3f755] rounded-[10px] cursor-pointer transition-all"
                        >
                          <div className="w-[44px] h-[66px] bg-black rounded-[4px] overflow-hidden shrink-0">
                            {r.poster_path && <img src={`https://image.tmdb.org/t/p/w92${r.poster_path}`} className="w-full h-full object-cover" alt="" />}
                          </div>
                          <div>
                            <div className="font-bold text-[#d0d0e8] text-[14px] mb-[2px]">{r.title}</div>
                            <div className="text-[#8a8aa8] text-[11px] mb-[4px]">{r.release_date ? r.release_date.split('-')[0] : 'Unknown Year'}</div>
                            <div className="text-[#6a6a8e] text-[10px] line-clamp-2 leading-[1.3]">{r.overview}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-[#8a8aa8] flex-1 py-[20px]">No results found.</div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-center mt-[20px] pt-[16px] border-t border-white/10">
          <Btn mob={mob} s onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}
