import type { CloudSave, SyncConflict } from '../hooks/useFirebaseSync.js';

export interface SyncStatusPanelProps {
  authReady: boolean;
  signedIn: boolean;
  syncReady: boolean;
  syncStatus: string;
  syncError: string | null;
  syncConflict: SyncConflict | null;
  syncRecovery?: SyncConflict | null;
  localTransitionPending?: boolean;
  retrySync: () => void;
  resolveSyncConflict: (choice: 'local' | 'cloud') => Promise<boolean>;
}

function describeSave(label: string, save: CloudSave): string {
  const state = save.state as { history?: unknown[]; hi?: unknown[]; champion?: { name?: string } | null; ch?: { name?: string } | null };
  const picks = (state.history ?? state.hi ?? []).length;
  const noteCount = Object.keys(save.notes).length;
  const champion = state.champion ?? state.ch;
  return `${label}: ${picks} pick${picks === 1 ? '' : 's'}, ${noteCount} movie note${noteCount === 1 ? '' : 's'}, ${champion?.name ? `champion ${champion.name}` : 'no champion'}`;
}

export function SyncStatusPanel({
  authReady, signedIn, syncReady, syncStatus, syncError, syncConflict, syncRecovery,
  retrySync, resolveSyncConflict, localTransitionPending = false,
}: SyncStatusPanelProps) {
  const panelClass = 'my-[12px] rounded-[12px] border border-white/10 bg-[#12122a] p-[14px] text-[13px] text-[#b8b8d0]';
  const buttonClass = 'min-h-[44px] rounded-[8px] border border-white/15 px-[12px] py-[8px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4fc3f7] disabled:opacity-50';
  if (!authReady) return <div role="status" className={panelClass}>Saving in this browser. Checking sign-in… You can keep playing.</div>;
  if (!signedIn) return null;
  const pending = syncStatus === 'syncing' || localTransitionPending;
  return (
    <>
      {syncConflict ? (
        <section aria-label="Choose a saved bracket" className={panelClass}>
          <h2 className="m-0 text-[15px] font-bold text-white">Choose which bracket to continue</h2>
          <p>This device and your cloud save have different work. Neither will be replaced until you choose. Both versions will be kept for recovery.</p>
          <p>{describeSave('This device', syncConflict.local)}</p>
          <p>{describeSave('Cloud', syncConflict.cloud)}</p>
          <div className="flex flex-wrap gap-[8px]">
            <button type="button" className={buttonClass} disabled={pending} onClick={() => { void resolveSyncConflict('cloud'); }}>Use cloud bracket</button>
            <button type="button" className={buttonClass} disabled={pending} onClick={() => { void resolveSyncConflict('local'); }}>Keep this device’s bracket</button>
          </div>
          <p className="mb-0 text-[12px] text-[#8a8aae]">Use cloud replaces this device’s active bracket and notes. Keep this device replaces the cloud bracket and notes.</p>
          {pending && <p role="status">Saving your choice…</p>}
        </section>
      ) : !syncReady && !syncError ? (
        <div role="status" className={panelClass}>Saving in this browser while cloud sync loads. You can keep playing; cloud changes will be checked before syncing.</div>
      ) : null}
      {syncError && (
        <div role="alert" className={panelClass}>
          <p className="mt-0 text-[#ffb8a0]">Cloud save needs attention: {syncError}</p>
          <p>Browser saving stays active. You can keep playing here and retry cloud sync later.</p>
          <button type="button" className={buttonClass} onClick={retrySync}>Retry cloud save</button>
        </div>
      )}
      {syncRecovery && (
        <details className={panelClass}>
          <summary className="cursor-pointer">Saved versions for recovery</summary>
          <p>Both versions from your last cloud-save choice are retained in this browser.</p>
          <a className="inline-block min-h-[44px] py-[10px] text-[#4fc3f7] underline" download="disney-bracket-sync-recovery.json"
            href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(syncRecovery, null, 2))}`}>
            Download both recovered versions
          </a>
        </details>
      )}
    </>
  );
}
