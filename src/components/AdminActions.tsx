import React from 'react';
import { MovieMeta } from '../types.js';

interface AdminActionsProps {
  isBulkFetching: boolean;
  bulkRefresh: (force: boolean) => void;
  setCache: (cache: Record<number, MovieMeta>) => void;
  loadCache: () => Record<number, MovieMeta>;
  addLog: (msg: string) => void;
}

export function AdminActions({ isBulkFetching, bulkRefresh, setCache, loadCache, addLog }: AdminActionsProps) {
  return (
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
  );
}
