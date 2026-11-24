// Codex (GPT-6 AI agent), November 23, 2026.
import { useEffect, useState } from 'react';
import { parseBracketState, serializeBracketState } from '../lib/bracketSerialization';
import { isNotes } from '../lib/utils';
import type { CloudSave } from '../hooks/useFirebaseSync';

export function BrowserSavePanel({ current, blocked, onImport }: {
  current: CloudSave; blocked: boolean; onImport: (save: CloudSave) => boolean;
}) {
  const [status, setStatus] = useState('Checking browser save…');
  const [copies, setCopies] = useState<{ label: string; save: CloudSave }[] | null>(null);
  const [error, setError] = useState('');
  const serialized = JSON.stringify(current);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const stored = { state: JSON.parse(localStorage.getItem('dbk-state') ?? 'null'), notes: JSON.parse(localStorage.getItem('dbk-notes') ?? '{}') };
        setStatus(JSON.stringify(stored) === serialized ? 'Saved in this browser (offline copy).' : 'Browser save is not verified. Download a copy before closing.');
      } catch { setStatus('Browser storage is unavailable. Download a copy before closing.'); }
    });
    return () => { active = false; };
  }, [serialized]);

  const check = () => {
    const found: { label: string; save: CloudSave }[] = [];
    const add = (label: string, raw: unknown, notes: unknown = {}) => {
      const state = parseBracketState(raw);
      if (state && isNotes(notes)) found.push({ label, save: { state: serializeBracketState(state), notes } });
    };
    try {
      add('Current browser save', JSON.parse(localStorage.getItem('dbk-state') ?? 'null'), JSON.parse(localStorage.getItem('dbk-notes') ?? '{}'));
      for (const key of Object.keys(localStorage)) {
        if (key !== 'dbk-pre-reroll' && key !== 'dbk-before-browser-import' && !key.startsWith('dbk-signout-recovery:') && !key.startsWith('dbk-sync-recovery:')) continue;
        const record = JSON.parse(localStorage.getItem(key) ?? 'null');
        if (!record) continue;
        const label = key === 'dbk-pre-reroll' ? 'Before reroll' : key === 'dbk-before-browser-import' ? 'Before browser import' : key.startsWith('dbk-signout') ? 'Before sign-out' : 'Saved sync choice';
        if (record.bracket) add(label, record.bracket, record.notes ?? {});
        for (const version of ['local', 'cloud']) if (record[version]) add(`${label}: ${version}`, record[version].state, record[version].notes ?? {});
      }
      setCopies(found);
      setError('');
    } catch { setError('Some browser data could not be read. Existing copies have been kept.'); setCopies(found); }
  };
  const button = 'min-h-[44px] rounded-[8px] border border-white/15 px-[12px] py-[8px] text-white disabled:opacity-50';
  return <section aria-label="Browser saves" className="my-[12px] rounded-[12px] border border-white/10 bg-[#12122a] p-[14px] text-[13px] text-[#b8b8d0]">
    <p role="status" className="mt-0">{status}</p>
    <p>Browser copies stay on this device and browser. Clearing site data removes them.</p>
    <button type="button" className={button} onClick={check}>Check browser saves</button>{' '}
    <a className={button} download="disney-bracket-browser-save.json" href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(current))}`}>Download browser copy</a>
    {error && <p role="alert">{error}</p>}
    {copies && <div><p>{copies.length ? 'Available browser copies — review before importing:' : 'No readable browser copies found.'}</p>
      {copies.map(({ label, save }, index) => <div key={index} className="my-[10px]">
        <p>{label}: {(save.state as { history: unknown[] }).history.length} picks, {Object.keys(save.notes).length} notes.</p>
        <button type="button" className={button} disabled={blocked} onClick={() => {
          if (onImport(save)) { setError(''); setCopies(null); }
          else setError('Import could not complete. Existing browser data has been kept.');
        }}>Import {label.toLowerCase()}</button>
      </div>)}
      <p>Import replaces the active bracket and notes. A recovery copy is kept first; cloud differences require a separate choice.</p>
    </div>}
  </section>;
}
