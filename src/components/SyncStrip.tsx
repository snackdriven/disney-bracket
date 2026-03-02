import { supabase } from '../lib/supabase.js';

interface SyncStripProps {
  mob: boolean;
  sbUser: { id: string; email?: string } | null;
  syncStatus: string;
  tmdbStatus: string | null;
  metaCount: number;
  onSignInClick: () => void;
  onTmdbClick: () => void;
}

export function SyncStrip({ mob, sbUser, syncStatus, tmdbStatus, metaCount, onSignInClick, onTmdbClick }: SyncStripProps) {
  return (
    <div
      className={[
        "flex justify-end items-center gap-[8px] flex-wrap",
        mob ? "mb-[8px] text-[12px]" : "mb-[10px] text-[11px]",
      ].join(" ")}
    >
      {sbUser ? (
        <>
          <span className="text-[#6a6a8e]">
            {syncStatus === "syncing" ? "⏳ Syncing..." : syncStatus === "synced" ? "✓ Synced" : syncStatus === "error" ? "⚠ Sync error" : "☁ Synced"}
            {" "}{sbUser.email}
          </span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-none border-none text-[#5a5a7e] cursor-pointer"
            style={{ fontSize: mob ? 12 : 11 }}
          >
            Sign out
          </button>
        </>
      ) : (
        <button
          onClick={onSignInClick}
          className="bg-none border-none text-[#6a6a8e] cursor-pointer tracking-[0.5px]"
          style={{ fontSize: mob ? 12 : 11 }}
        >
          ☁ Sync across devices
        </button>
      )}
      <a
        href="https://snackdriven.github.io/bad-movie-bracket/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit Bad Movie Bracket"
        title="something worse this way comes"
        className="no-underline opacity-50 text-[#3a3a52]"
        style={{ fontSize: mob ? 12 : 11 }}
      >
        💀
      </a>
      <span className="text-[#4a4a65]">·</span>
      <button
        onClick={onTmdbClick}
        className="bg-none border-none cursor-pointer"
        style={{ color: metaCount > 0 ? "#6a6a8e" : "#4fc3f7", fontSize: mob ? 12 : 11 }}
      >
        {tmdbStatus === "fetching" ? "⏳ Fetching..." : metaCount > 0 ? `🎬 ${metaCount} movies loaded` : "🎬 Add posters & ratings"}
      </button>
    </div>
  );
}
