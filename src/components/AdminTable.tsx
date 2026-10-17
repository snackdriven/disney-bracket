import React from 'react';
import { ALL_MOVIES } from '../lib/data.js';
import { AdminTableRow } from './AdminTableRow.js';
import { Movie, MovieMeta } from '../types.js';
import { EditDraft } from '../hooks/useAdminState.js';

interface AdminTableProps {
  cache: Record<number, MovieMeta>;
  fetchingSeeds: Set<number>;
  editingSeed: number | null;
  isBulkFetching: boolean;
  editDraft: EditDraft;
  setEditDraft: React.Dispatch<React.SetStateAction<EditDraft>>;
  refetchOne: (m: Movie) => void;
  openEdit: (m: Movie) => void;
  setEditingSeed: (seed: number | null) => void;
  saveEdit: (seed: number) => void;
  clearOne: (seed: number) => void;
}

export function AdminTable({
  cache,
  fetchingSeeds,
  editingSeed,
  isBulkFetching,
  editDraft,
  setEditDraft,
  refetchOne,
  openEdit,
  setEditingSeed,
  saveEdit,
  clearOne
}: AdminTableProps) {
  return (
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
          {ALL_MOVIES.map((m, i) => (
            <AdminTableRow
              key={m.seed}
              movie={m}
              index={i}
              totalLength={ALL_MOVIES.length}
              meta={cache[m.seed]}
              isFetching={fetchingSeeds.has(m.seed)}
              isBulkFetching={isBulkFetching}
              isEditing={editingSeed === m.seed}
              editDraft={editDraft}
              setEditDraft={setEditDraft}
              refetchOne={refetchOne}
              openEdit={openEdit}
              setEditingSeed={setEditingSeed}
              saveEdit={saveEdit}
              clearOne={clearOne}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
