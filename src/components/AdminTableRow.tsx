import React from 'react';
import { Movie, MovieMeta } from '../types.js';
import { EditDraft } from '../hooks/useAdminState.js';

interface AdminTableRowProps {
  movie: Movie;
  index: number;
  totalLength: number;
  meta?: MovieMeta;
  isFetching: boolean;
  isBulkFetching: boolean;
  isEditing: boolean;
  editDraft: EditDraft;
  setEditDraft: React.Dispatch<React.SetStateAction<EditDraft>>;
  refetchOne: (m: Movie) => void;
  openEdit: (m: Movie) => void;
  setEditingSeed: (seed: number | null) => void;
  saveEdit: (seed: number) => void;
  clearOne: (seed: number) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", background: "rgba(0,0,0,0.3)",
  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
  padding: "6px 10px", color: "#e0e0f0", fontFamily: "monospace", fontSize: 11, outline: "none",
};

export function AdminTableRow({
  movie: m,
  index: i,
  totalLength,
  meta,
  isFetching,
  isBulkFetching,
  isEditing,
  editDraft,
  setEditDraft,
  refetchOne,
  openEdit,
  setEditingSeed,
  saveEdit,
  clearOne
}: AdminTableRowProps) {
  const rowBg = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)";
  const rowBorder = i < totalLength - 1 ? "1px solid rgba(255,255,255,0.04)" : "none";
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
}
