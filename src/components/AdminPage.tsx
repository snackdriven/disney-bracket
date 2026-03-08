import { useState, useCallback } from "react";
import { ALL_MOVIES } from '../lib/data.js';
import { fetchMovieMeta, fetchSingleMovieMeta } from '../lib/meta.js';
import type { Movie, MovieMeta } from '../types.js';

function loadCache(): Record<number, MovieMeta> {
  try { return JSON.parse(localStorage.getItem("tmdb-meta-v1") || "{}") as Record<number, MovieMeta>; }
  catch { return {}; }
}

function saveCache(c: Record<number, MovieMeta>) {
  localStorage.setItem("tmdb-meta-v1", JSON.stringify(c));
}

type BulkStatus = "idle" | "fetching" | "done" | "error";

interface EditDraft {
  poster: string;
  rating: string;
  runtime: string;
  plot: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
  padding: "6px 10px", color: "#e0e0f0", fontFamily: "monospace", fontSize: 11, outline: "none",
};

export function AdminPage() {
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
    const name = ALL_MOVIES.find(m => m.seed === seed)?.name ?? `seed ${seed}`;
    addLog(`Saved manual edits for ${name}.`);
    setEditingSeed(null);
  };

  const clearOne = (seed: number) => {
    const updated = { ...cache };
    delete updated[seed];
    updateCache(updated);
    const name = ALL_MOVIES.find(m => m.seed === seed)?.name ?? `seed ${seed}`;
    addLog(`Cleared cache for ${name}.`);
    if (editingSeed === seed) setEditingSeed(null);
  };

  const withPoster = ALL_MOVIES.filter(m => cache[m.seed]?.poster).length;
  const withRating = ALL_MOVIES.filter(m => cache[m.seed]?.rating).length;
  const withRuntime = ALL_MOVIES.filter(m => cache[m.seed]?.runtime).length;
  const withPlot = ALL_MOVIES.filter(m => cache[m.seed]?.plot).length;
  const total = ALL_MOVIES.length;
  const isBulkFetching = bulkStatus === "fetching";

  return (
    <div className="min-h-screen font-[Inter,sans-serif] text-[#e0e0f0]" style={{ background: "#06060f", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: "#6a6a8e", textTransform: "uppercase", marginBottom: 6 }}>Admin</div>
          <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 800, fontFamily: "'Outfit',sans-serif", background: "linear-gradient(135deg,#9d8fe0,#ce93d8 45%,#4fc3f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Metadata Manager
          </h1>
          <p style={{ margin: 0, color: "#6a6a8e", fontSize: 13 }}>
            Manage movie metadata cache · <a href={import.meta.env.BASE_URL} style={{ color: "#4fc3f7" }}>← Back to bracket</a>
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {([["Posters", withPoster], ["Ratings", withRating], ["Runtimes", withRuntime], ["Plots", withPlot]] as const).map(([label, count]) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: count === total ? "#4fc3f7" : count === 0 ? "#5a5a7e" : "#ce93d8" }}>{count}/{total}</div>
              <div style={{ fontSize: 11, color: "#6a6a8e", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* API Keys */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px 20px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8a8aa8", marginBottom: 14, letterSpacing: 0.5 }}>API Keys</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#6a6a8e", marginBottom: 4 }}>
                TMDB key (v3 auth) — <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" style={{ color: "#4fc3f7" }}>get one</a>
              </label>
              <input value={tmdbKey} onChange={e => setTmdbKey(e.target.value)} placeholder="32-char hex..." style={{ ...inputStyle, fontSize: 12, padding: "8px 12px" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#6a6a8e", marginBottom: 4 }}>
                OMDB key (ratings + runtime) — <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer" style={{ color: "#4fc3f7" }}>get one</a>
              </label>
              <input value={omdbKey} onChange={e => setOmdbKey(e.target.value)} placeholder="8-char hex..." style={{ ...inputStyle, fontSize: 12, padding: "8px 12px" }} />
            </div>
          </div>
          <button onClick={saveKeys} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "7px 16px", color: "#9898b8", fontSize: 12, cursor: "pointer" }}>
            Save Keys
          </button>
        </div>

        {/* Bulk actions */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button disabled={isBulkFetching} onClick={() => bulkRefresh(false)} style={{ background: isBulkFetching ? "rgba(79,195,247,0.06)" : "rgba(79,195,247,0.12)", border: "1px solid rgba(79,195,247,0.3)", borderRadius: 10, padding: "9px 20px", color: "#4fc3f7", fontSize: 13, fontWeight: 600, cursor: isBulkFetching ? "not-allowed" : "pointer", opacity: isBulkFetching ? 0.7 : 1 }}>
            {isBulkFetching ? "Fetching…" : "Fetch Missing"}
          </button>
          <button disabled={isBulkFetching} onClick={() => bulkRefresh(true)} style={{ background: "rgba(206,147,216,0.12)", border: "1px solid rgba(206,147,216,0.3)", borderRadius: 10, padding: "9px 20px", color: "#ce93d8", fontSize: 13, fontWeight: 600, cursor: isBulkFetching ? "not-allowed" : "pointer", opacity: isBulkFetching ? 0.7 : 1 }}>
            Refresh All
          </button>
          <button onClick={() => { localStorage.removeItem("tmdb-meta-v1"); setCache({}); addLog("Cache cleared."); }} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,100,100,0.25)", borderRadius: 10, padding: "9px 20px", color: "#e88", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Clear Cache
          </button>
          <button onClick={() => { setCache(loadCache()); addLog("Reloaded cache from localStorage."); }} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "9px 20px", color: "#6a6a8e", fontSize: 13, cursor: "pointer" }}>
            Reload
          </button>
        </div>

        {/* Log */}
        {log.length > 0 && (
          <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontFamily: "monospace", fontSize: 12, color: "#6a6a8e", maxHeight: 120, overflowY: "auto" }}>
            {log.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}

        {/* Movie table */}
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                {["#", "Movie", "Year", "Studio", "Poster", "Rating", "Runtime", "Plot", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#6a6a8e", fontWeight: 600, letterSpacing: 0.5, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_MOVIES.map((m, i) => {
                const meta = cache[m.seed];
                const isFetching = fetchingSeeds.has(m.seed);
                const isEditing = editingSeed === m.seed;
                const rowBg = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)";
                const rowBorder = i < ALL_MOVIES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none";
                const tick = (v?: string) => (
                  <span style={{ color: v ? "#4fc3f7" : "#3a3a5e", fontSize: 14 }}>{v ? "✓" : "·"}</span>
                );

                return (
                  <>
                    <tr key={m.seed} style={{ borderBottom: isEditing ? "none" : rowBorder, background: isEditing ? "rgba(159,139,224,0.06)" : rowBg }}>
                      <td style={{ padding: "8px 12px", color: "#4a4a6e", fontFamily: "monospace" }}>{m.seed}</td>
                      <td style={{ padding: "8px 12px", color: "#e0e0f0", fontWeight: 500, maxWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {meta?.poster
                            ? <img src={meta.poster} alt="" style={{ width: 24, height: 36, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} />
                            : <div style={{ width: 24, height: 36, background: "rgba(255,255,255,0.04)", borderRadius: 3, flexShrink: 0 }} />
                          }
                          {m.name}
                        </div>
                      </td>
                      <td style={{ padding: "8px 12px", color: "#6a6a8e" }}>{m.year}</td>
                      <td style={{ padding: "8px 12px", color: m.studio === "Disney" ? "#4fc3f7" : "#ff8a65", fontSize: 11 }}>{m.studio}</td>
                      <td style={{ padding: "8px 12px" }}>{tick(meta?.poster)}</td>
                      <td style={{ padding: "8px 12px", color: "#8a8aa8" }}>{meta?.rating || tick(meta?.rating)}</td>
                      <td style={{ padding: "8px 12px", color: "#8a8aa8" }}>{meta?.runtime || tick(meta?.runtime)}</td>
                      <td style={{ padding: "8px 12px" }}>{tick(meta?.plot)}</td>
                      <td style={{ padding: "8px 8px", whiteSpace: "nowrap" }}>
                        <button
                          disabled={isFetching || isBulkFetching}
                          onClick={() => refetchOne(m)}
                          title="Re-fetch from TMDB/OMDB"
                          style={{ background: "rgba(79,195,247,0.08)", border: "1px solid rgba(79,195,247,0.2)", borderRadius: 6, padding: "4px 10px", color: isFetching ? "#3a7a9e" : "#4fc3f7", fontSize: 11, cursor: isFetching ? "not-allowed" : "pointer", marginRight: 4 }}
                        >
                          {isFetching ? "…" : "↺"}
                        </button>
                        <button
                          onClick={() => isEditing ? setEditingSeed(null) : openEdit(m)}
                          title={isEditing ? "Cancel edit" : "Edit manually"}
                          style={{ background: isEditing ? "rgba(159,139,224,0.15)" : "rgba(255,255,255,0.05)", border: isEditing ? "1px solid rgba(159,139,224,0.4)" : "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", color: isEditing ? "#9d8fe0" : "#8a8aa8", fontSize: 11, cursor: "pointer", marginRight: 4 }}
                        >
                          {isEditing ? "✕" : "Edit"}
                        </button>
                        <button
                          onClick={() => clearOne(m.seed)}
                          title="Clear this movie's cache"
                          style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.15)", borderRadius: 6, padding: "4px 10px", color: "#c07070", fontSize: 11, cursor: "pointer" }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>

                    {isEditing && (
                      <tr key={`edit-${m.seed}`} style={{ borderBottom: rowBorder, background: "rgba(159,139,224,0.04)" }}>
                        <td colSpan={9} style={{ padding: "12px 16px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
                            <div>
                              <label style={{ display: "block", fontSize: 10, color: "#6a6a8e", marginBottom: 3, letterSpacing: 0.5 }}>POSTER URL</label>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                {editDraft.poster && (
                                  <img src={editDraft.poster} alt="" style={{ width: 30, height: 44, objectFit: "cover", borderRadius: 3, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                )}
                                <input value={editDraft.poster} onChange={e => setEditDraft(d => ({ ...d, poster: e.target.value }))} placeholder="https://..." style={inputStyle} />
                              </div>
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 10, color: "#6a6a8e", marginBottom: 3, letterSpacing: 0.5 }}>RATING</label>
                              <input value={editDraft.rating} onChange={e => setEditDraft(d => ({ ...d, rating: e.target.value }))} placeholder="e.g. 8.5" style={inputStyle} />
                            </div>
                            <div>
                              <label style={{ display: "block", fontSize: 10, color: "#6a6a8e", marginBottom: 3, letterSpacing: 0.5 }}>RUNTIME</label>
                              <input value={editDraft.runtime} onChange={e => setEditDraft(d => ({ ...d, runtime: e.target.value }))} placeholder="e.g. 88 min" style={inputStyle} />
                            </div>
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <label style={{ display: "block", fontSize: 10, color: "#6a6a8e", marginBottom: 3, letterSpacing: 0.5 }}>PLOT</label>
                            <textarea value={editDraft.plot} onChange={e => setEditDraft(d => ({ ...d, plot: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical", fontFamily: "Inter,sans-serif" }} />
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => saveEdit(m.seed)} style={{ background: "rgba(79,195,247,0.12)", border: "1px solid rgba(79,195,247,0.3)", borderRadius: 7, padding: "6px 16px", color: "#4fc3f7", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              Save
                            </button>
                            <button onClick={() => setEditingSeed(null)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 7, padding: "6px 16px", color: "#6a6a8e", fontSize: 12, cursor: "pointer" }}>
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
