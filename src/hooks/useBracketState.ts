import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { RND, REG } from '../lib/data.js';
import { loadLS } from '../lib/utils.js';
import { applyPick, applyUndo, resetState, canRerollSweet16, buildSweet16Preview, applySweet16Reroll } from '../lib/bracket.js';
import { parseBracketState, serializeBracketState } from '../lib/bracketSerialization.js';
import type { Movie, Match, BracketState } from '../types.js';

interface RerollPreview {
  matches: Match[];
  removedPickCount: number;
  removesChampion: boolean;
  generation: number;
}

function initialState() {
  const hash = window.location.hash.slice(1);
  if (hash && !hash.includes('access_token') && !hash.includes('token_hash')) {
    try {
      const state = parseBracketState(JSON.parse(atob(hash)));
      if (state) return { state, error: null, rejected: null };
    } catch { /* An unrelated or malformed hash must not hide a valid device save. */ }
  }
  let raw: string | null = null;
  try {
    raw = localStorage.getItem('dbk-state');
    if (!raw) return { state: resetState(), error: null, rejected: null };
    const state = parseBracketState(JSON.parse(raw));
    if (state) return { state, error: null, rejected: null };
  } catch { /* Preserve raw input and suspend persistence instead of overwriting it. */ }
  return { state: resetState(), error: 'Your saved bracket could not be loaded. Saving is paused so it is not overwritten.', rejected: raw };
}

export type UseBracketStateReturn = ReturnType<typeof useBracketState>;

export function useBracketState() {
  const [init] = useState(initialState);
  const [state, setState] = useState<BracketState>(init.state);
  const stateRef = useRef(state);
  const [restoreError, setRestoreError] = useState<string | null>(init.error);
  const [rejectedSave, setRejectedSave] = useState<string | null>(init.rejected);
  const [rerollPreview, setRerollPreview] = useState<RerollPreview | null>(null);
  const previewRef = useRef<RerollPreview | null>(null);
  const [rerollError, setRerollError] = useState<string | null>(null);
  const [hasRerollBackup, setHasRerollBackup] = useState(() => {
    try { return !!localStorage.getItem('dbk-pre-reroll'); } catch { return false; }
  });
  const generation = useRef(0);
  const animatingRef = useRef(false);
  const pendingPickRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [animatingSeed, setAnimatingSeed] = useState<number | null>(null);
  const [upFlash, setUpFlash] = useState(false);
  const serialized = useMemo(() => serializeBracketState(state), [state]);

  const cancelPending = useCallback(() => {
    if (pendingPickRef.current) clearTimeout(pendingPickRef.current);
    if (flashRef.current) clearTimeout(flashRef.current);
    pendingPickRef.current = null;
    flashRef.current = null;
    animatingRef.current = false;
    setAnimatingSeed(null);
    setUpFlash(false);
  }, []);

  const applyState = (next: BracketState) => {
    cancelPending();
    generation.current++;
    previewRef.current = null;
    setRerollPreview(null);
    stateRef.current = next;
    setState(next);
  };

  useEffect(() => () => {
    if (pendingPickRef.current) clearTimeout(pendingPickRef.current);
    if (flashRef.current) clearTimeout(flashRef.current);
  }, [cancelPending]);

  useEffect(() => {
    if (restoreError) return;
    try { localStorage.setItem('dbk-state', JSON.stringify(serialized)); }
    catch { queueMicrotask(() => setRestoreError('This device could not save your bracket. Export a recovery copy before closing this page.')); }
    const hashHasAuth = window.location.hash.includes('access_token') || window.location.hash.includes('token_hash');
    if (hashHasAuth) return;
    try {
      const encoded = btoa(JSON.stringify(serialized));
      const hash = (state.history.length > 0 || state.champion) && encoded.length <= 8192 ? '#' + encoded : '';
      // Never leave an old, smaller hash that could roll a newer local save back on reload.
      window.history.replaceState(null, '', window.location.pathname + window.location.search + hash);
    } catch {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [serialized, state.history.length, state.champion, restoreError]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target as Element).closest('input,textarea')) window.open('https://github.com/snackdriven/disney-bracket', '_blank', 'noopener,noreferrer');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Another tab changing the save makes an open preview stale. Keep this tab's work in memory.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== 'dbk-state' || e.newValue === JSON.stringify(serializeBracketState(stateRef.current))) return;
      generation.current++;
      previewRef.current = null;
      setRerollPreview(null);
      cancelPending();
      setRestoreError('This bracket changed in another tab. Saving is paused; export this copy before reloading to choose which to keep.');
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [cancelPending]);

  const applyServerState = (raw: unknown) => {
    if (raw == null) return;
    const parsed = parseBracketState(raw);
    if (!parsed) {
      setRejectedSave(typeof raw === 'string' ? raw : JSON.stringify(raw));
      setRestoreError('The incoming saved bracket could not be loaded. Your current bracket has been kept and saving is paused.');
      cancelPending();
      generation.current++;
      previewRef.current = null;
      setRerollPreview(null);
      return;
    }
    applyState(parsed);
  };

  const pick = (winner: Movie) => {
    if (animatingRef.current || previewRef.current || restoreError) return;
    const snap = stateRef.current;
    const match = snap.phase === 'pi' ? snap.playInMatches[snap.playInIndex] : snap.rounds[snap.currentRound]?.[snap.currentMatch];
    if (!match || !match.players.some(p => p.seed === winner.seed)) return;
    const opponent = match.players.find(p => p.seed !== winner.seed)!;
    animatingRef.current = true;
    const sourceGeneration = generation.current;
    setAnimatingSeed(winner.seed);
    if (winner.seed > opponent.seed) {
      setUpFlash(true);
      flashRef.current = setTimeout(() => setUpFlash(false), 1500);
    }
    pendingPickRef.current = setTimeout(() => {
      pendingPickRef.current = null;
      if (generation.current !== sourceGeneration) return;
      applyState(applyPick(snap, winner));
    }, 320);
  };

  const undo = () => {
    if (restoreError) return;
    applyState(applyUndo(stateRef.current));
  };

  const reset = () => {
    // Explicit user reset is the only path allowed to replace an unresolved bad save.
    if (rejectedSave) {
      try { localStorage.setItem('dbk-rejected-save', rejectedSave); }
      catch { setRestoreError('The rejected save could not be backed up. Export it before resetting.'); return; }
    }
    setRestoreError(null);
    setRejectedSave(null);
    setRerollError(null);
    applyState(resetState());
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  };

  const roomPresent = () => new URLSearchParams(window.location.search).has('room');
  const openRerollPreview = () => {
    if (roomPresent() || restoreError || animatingRef.current || !canRerollSweet16(stateRef.current)) return;
    const preview = {
      matches: buildSweet16Preview(stateRef.current),
      removedPickCount: stateRef.current.history.filter(e => e.phase === 'm' && e.round >= 2).length,
      removesChampion: !!stateRef.current.champion,
      generation: generation.current,
    };
    previewRef.current = preview;
    setRerollPreview(preview);
    setRerollError(null);
  };
  const shuffleRerollPreview = () => {
    const previous = previewRef.current;
    if (!previous || previous.generation !== generation.current || roomPresent()) return;
    const next = { ...previous, matches: buildSweet16Preview(stateRef.current, Math.random, previous.matches) };
    previewRef.current = next;
    setRerollPreview(next);
    setRerollError(null);
  };
  const cancelRerollPreview = () => {
    previewRef.current = null;
    setRerollPreview(null);
    setRerollError(null);
  };
  const confirmRerollPreview = () => {
    const preview = previewRef.current;
    if (!preview || preview.generation !== generation.current || roomPresent() || restoreError) return;
    const next = applySweet16Reroll(stateRef.current, preview.matches);
    if (next === stateRef.current) return;
    if (preview.removedPickCount > 0) {
      try {
        localStorage.setItem('dbk-pre-reroll', JSON.stringify({
          bracket: serializeBracketState(stateRef.current), notes: loadLS('dbk-notes', {}), savedAt: new Date().toISOString(),
        }));
        setHasRerollBackup(true);
      } catch {
        setRerollError('The recovery backup could not be saved. Your existing bracket has not changed. Free storage or export it and try again.');
        return;
      }
    }
    applyState(next);
    setRerollError(null);
  };

  const { phase, playInMatches, playInIndex, rounds, currentRound, currentMatch, champion, history, sweet16Rerolled } = state;
  const isPlayIn = phase === 'pi';
  const activeMatch = isPlayIn ? playInMatches[playInIndex] : rounds[currentRound]?.[currentMatch];
  const matchesPerRegion = currentRound === 0 ? 8 : currentRound === 1 ? 4 : 2;
  const regionIndex = !isPlayIn && currentRound <= 2 && !(sweet16Rerolled && currentRound === 2) ? Math.floor(currentMatch / matchesPerRegion) : -1;

  return {
    ...state, isPlayIn, activeMatch, progress: champion ? 100 : history.length / 69 * 100,
    roundLabel: isPlayIn ? 'Play-In Round' : RND[currentRound] || '',
    matchNumber: isPlayIn ? playInIndex + 1 : currentMatch + 1,
    matchTotal: isPlayIn ? 6 : rounds[currentRound]?.length || 0,
    regionName: regionIndex >= 0 && regionIndex < 4 ? REG[regionIndex] : '',
    upNextPool: isPlayIn ? playInMatches : rounds[currentRound],
    upNextIndex: isPlayIn ? playInIndex : currentMatch,
    animatingSeed, upFlash, serialized, applyServerState, pick, undo, reset,
    canRerollSweet16: !roomPresent() && !restoreError && canRerollSweet16(state),
    rerollPreview, rerollError, rerollPending: false, hasRerollBackup, restoreError, rejectedSave,
    openRerollPreview, shuffleRerollPreview, cancelRerollPreview, confirmRerollPreview,
  };
}
