import { auth } from '../lib/firebase.js';

interface SyncStripProps {
  mob: boolean;
  fbUser: { uid: string; email?: string | null } | null;
  syncStatus: string;
  onSignInClick: () => void;
}

export function SyncStrip({ mob, fbUser, syncStatus, onSignInClick }: SyncStripProps) {
  return (
    <div
      className={[
        "flex justify-end items-center gap-[8px] flex-wrap",
        mob ? "mb-[12px]" : "mb-[16px]",
      ].join(" ")}
    >
      <a
        href="https://snackdriven.github.io/bad-movie-bracket/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Visit Bad Movie Bracket"
        title="something worse this way comes"
        className="flex items-center justify-center w-[28px] h-[28px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-full no-underline opacity-50 hover:opacity-100 transition-all text-[#3a3a52]"
      >
        <span style={{ fontSize: 14 }}>💀</span>
      </a>

      {fbUser ? (
        <div className="flex items-center gap-[8px] bg-white/[0.03] border border-white/[0.08] rounded-full px-[12px] py-[4px] min-h-[28px]">
          <div className="flex items-center gap-[6px] text-[#8a8aae]" style={{ fontSize: mob ? 12 : 11 }}>
            <span className={syncStatus === "error" ? "text-[#ff8a65]" : "text-[#ce93d8]"}>
              {syncStatus === "syncing" ? "⏳" : syncStatus === "synced" ? "✓" : syncStatus === "error" ? "⚠" : "🔄"}
            </span>
            <span className="font-semibold text-[#a0a0c0] max-w-[100px] truncate">{fbUser.email?.split('@')[0] || "Account"}</span>
          </div>
          <div className="w-[1px] h-[12px] bg-white/[0.1]"/>
          <button
            onClick={() => auth.signOut()}
            className="bg-transparent border-none text-[#5a5a7e] hover:text-[#ff8a65] cursor-pointer p-0 font-medium transition-colors"
            style={{ fontSize: mob ? 12 : 11 }}
            title="Sign out"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={onSignInClick}
          className="flex items-center justify-center w-[28px] h-[28px] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-full transition-all cursor-pointer text-[#8a8aae] hover:text-[#d0d0e8]"
          title="Sign In / Sync Bracket"
        >
          <span style={{ fontSize: 14 }}>👤</span>
        </button>
      )}
    </div>
  );
}
