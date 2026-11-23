import type { Match } from '../types';
import { useEffect, useRef } from 'react';

interface Props {
  matches: Match[];
  removedPickCount: number;
  removesChampion: boolean;
  pending: boolean;
  error: string | null;
  onShuffle: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function Sweet16RerollModal({ matches, removedPickCount, removesChampion, pending, error, onShuffle, onCancel, onConfirm }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const callbacks = useRef({ onCancel, pending });
  useEffect(() => { callbacks.current = { onCancel, pending }; }, [onCancel, pending]);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancel.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !callbacks.current.pending) {
        event.preventDefault();
        callbacks.current.onCancel();
      }
      if (event.key !== 'Tab') return;
      const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keydown);
      if (opener?.isConnected) opener.focus();
    };
  }, []);
  const buttonClass = 'min-h-[44px] rounded-[10px] border border-white/20 px-[16px] py-[12px] font-semibold disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4fc3f7]';
  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-[16px] backdrop-blur-sm">
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="reroll-title" aria-describedby="reroll-description"
        className="max-h-[90dvh] w-full max-w-[640px] overflow-y-auto rounded-[20px] border border-white/15 bg-[#12122a] p-[20px] text-[#e0e0f0] shadow-2xl">
        <h2 id="reroll-title" className="mb-[8px] text-[24px] font-extrabold">Reroll Sweet 16</h2>
        <p id="reroll-description" className="mb-[16px] text-[14px] text-[#b8b8d0]">Your original 16 Round of 32 winners, mixed across regions. Earlier picks and movie notes stay saved.</p>
        <ol className="mb-[16px] grid gap-[6px]" aria-label="Proposed Sweet 16 matchups">
          {matches.map((match, index) => (
            <li key={index} className="grid grid-cols-[1fr_auto_1fr] items-center gap-[8px] rounded-[8px] bg-white/5 p-[10px] text-[13px]">
              <span className="text-right">{match.players[0].name}</span><span className="text-[#8a8aae]">vs</span><span>{match.players[1].name}</span>
            </li>
          ))}
        </ol>
        {removedPickCount > 0 ? (
          <div className="mb-[16px] rounded-[10px] border border-[#ffd54f]/30 bg-[#ffd54f]/5 p-[12px] text-[14px]">
            <p>{removedPickCount} Sweet 16 and later picks will be cleared.</p>
            {removesChampion && <p>Your current champion will be removed.</p>}
            <p className="mt-[8px]">Keep my Round of 32 winners and restart Sweet 16. A recovery copy is saved before replacing results.</p>
          </div>
        ) : <p className="mb-[16px] text-[14px] text-[#b8b8d0]">No completed picks will be cleared.</p>}
        {error && <p role="alert" className="mb-[12px] text-[14px] text-[#ffb4a8]">{error}</p>}
        <div className="flex flex-wrap justify-end gap-[10px]">
          <button ref={cancel} className={buttonClass} disabled={pending} onClick={onCancel}>Cancel</button>
          <button className={buttonClass} disabled={pending} onClick={onShuffle}>Shuffle again</button>
          <button className={`${buttonClass} bg-[#4fc3f7]/15 text-[#b6eaff]`} disabled={pending} onClick={onConfirm}>
            {removedPickCount > 0 ? 'Apply reroll & restart Sweet 16' : 'Apply reroll'}
          </button>
        </div>
      </div>
    </div>
  );
}
