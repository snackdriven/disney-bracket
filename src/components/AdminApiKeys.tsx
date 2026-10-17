import React from 'react';

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
  padding: "6px 10px", color: "#e0e0f0", fontFamily: "monospace", fontSize: 11, outline: "none",
};

interface AdminApiKeysProps {
  tmdbKey: string;
  setTmdbKey: (key: string) => void;
  omdbKey: string;
  setOmdbKey: (key: string) => void;
  saveKeys: () => void;
}

export function AdminApiKeys({ tmdbKey, setTmdbKey, omdbKey, setOmdbKey, saveKeys }: AdminApiKeysProps) {
  return (
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
  );
}
