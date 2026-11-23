import { useState } from 'react';

interface CoopRetiredScreenProps {
  originalUrl: string;
  onContinue: (url: string) => void;
}

export function CoopRetiredScreen({ originalUrl, onContinue }: CoopRetiredScreenProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(originalUrl);
      setCopied(true);
      setError('');
    } catch {
      setError('Select and copy the original room link below to keep it for recovery.');
    }
  };

  const continueSolo = () => {
    const next = new URL(originalUrl);
    const hash = new URLSearchParams(next.hash.slice(1));
    const authCallback = ['access_token', 'token_hash', 'id_token', 'error', 'error_description', 'code']
      .some(key => hash.has(key));
    const recovery = new URL(originalUrl);
    // Keep credentials in the live callback URL, not in the recovery record.
    if (authCallback) recovery.hash = '';
    try {
      localStorage.setItem('dbk-retired-room-link', recovery.href);
    } catch {
      if (!copied) {
        setError('Copy the original room link before continuing; this browser could not save its recovery copy.');
        return;
      }
    }
    next.searchParams.delete('room');
    // A room's bracket hash was not selected for import into the device bracket.
    if (!authCallback) next.hash = '';
    onContinue(next.href);
  };

  const buttonClass = 'min-h-[44px] rounded-[10px] border border-white/20 px-[16px] py-[12px] text-left font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4fc3f7]';
  return (
    <main className="min-h-screen bg-[#06060f] px-[20px] py-[48px] text-[#e0e0f0]">
      <section className="mx-auto max-w-[640px] space-y-[20px]" aria-labelledby="coop-retired-title">
        <h1 id="coop-retired-title" className="text-[26px] font-bold">Co-op rooms have been retired</h1>
        <p>Your existing saved data has not been changed. Continue with this device’s saved bracket, or keep this link for recovery.</p>
        <p>Room data is not loaded or deleted by this screen. Personal sign-in and cloud saves are still available in solo play.</p>
        <div className="flex flex-col gap-[12px]">
          <button className={`${buttonClass} bg-[#4fc3f7]/15`} onClick={continueSolo}>Continue solo with this device’s saved bracket</button>
          <button className={buttonClass} onClick={() => { void copyLink(); }}>{copied ? 'Room link copied' : 'Copy room link'}</button>
        </div>
        <label className="block space-y-[8px]">
          <span>Original room link</span>
          <textarea readOnly value={originalUrl} onFocus={event => event.currentTarget.select()}
            className="block min-h-[96px] w-full rounded-[10px] border border-white/20 bg-white/5 p-[12px] text-[13px]" />
        </label>
        <p className="text-[13px] text-[#a0a0c0]">Continuing saves a local recovery link when storage is available. It does not restore a room or an old backup.</p>
        {copied && <p role="status">Room link copied. Keep it somewhere you can find again.</p>}
        {error && <p role="alert" className="text-[#ffb4a8]">{error}</p>}
      </section>
    </main>
  );
}
