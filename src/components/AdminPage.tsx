import { useAdminState } from "../hooks/useAdminState.js";
import { AdminStats } from "./AdminStats.js";
import { AdminApiKeys } from "./AdminApiKeys.js";
import { AdminActions } from "./AdminActions.js";
import { AdminLog } from "./AdminLog.js";
import { AdminTable } from "./AdminTable.js";

export function AdminPage() {
  const {
    tmdbKey, setTmdbKey,
    omdbKey, setOmdbKey,
    cache, setCache,
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
    stats,
    isBulkFetching,
    loadCache,
  } = useAdminState();

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

        <AdminStats {...stats} />

        <AdminApiKeys
          tmdbKey={tmdbKey}
          setTmdbKey={setTmdbKey}
          omdbKey={omdbKey}
          setOmdbKey={setOmdbKey}
          saveKeys={saveKeys}
        />

        <AdminActions
          isBulkFetching={isBulkFetching}
          bulkRefresh={bulkRefresh}
          setCache={setCache}
          loadCache={loadCache}
          addLog={addLog}
        />

        <AdminLog log={log} />

        <AdminTable
          cache={cache}
          fetchingSeeds={fetchingSeeds}
          editingSeed={editingSeed}
          isBulkFetching={isBulkFetching}
          editDraft={editDraft}
          setEditDraft={setEditDraft}
          refetchOne={refetchOne}
          openEdit={openEdit}
          setEditingSeed={setEditingSeed}
          saveEdit={saveEdit}
          clearOne={clearOne}
        />
      </div>
    </div>
  );
}
