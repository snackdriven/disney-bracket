import { useState, useEffect, useMemo, useRef } from "react";
import { PLAYIN, PIP, RND, REG } from '../lib/data.js';
import { loadLS, saveLS, serMatch, desMatch, isMovie, isPhase, isHistoryEntry, isUpsetEntry } from '../lib/utils.js';
import { applyPick, applyUndo, resetState } from '../lib/bracket.js';
import type { Movie, Match, Phase, BracketState, HistoryEntry, UpsetEntry } from '../types.js';

/** Migrate v1 (abbreviated keys) to v2 (readable keys). */
function migrateV1(d: Record<string, unknown>): Partial<BracketState> {
  return {
    phase: isPhase(d.ph) ? d.ph : "pi",
    playInMatches: desMatch(d.piM),
    playInIndex: typeof d.piI === "number" ? d.piI : 0,
    rounds: ((d.rds as unknown[]) ?? []).map(r => desMatch(r)),
    currentRound: typeof d.cr === "number" ? d.cr : 0,
    currentMatch: typeof d.cm === "number" ? d.cm : 0,
    champion: isMovie(d.ch) ? d.ch : null,
    history: Array.isArray(d.hi) ? (d.hi as unknown[]).filter(isHistoryEntry) : [],
    upsets: Array.isArray(d.upsets) ? (d.upsets as unknown[]).filter(isUpsetEntry) : [],
  };
}

/** Parse saved state, migrating v1 if needed. */
function parseState(d: Record<string, unknown>): Partial<BracketState> {
  // Detect v1 by presence of abbreviated keys
  if (d._v === 1 || ('ph' in d && !('phase' in d))) return migrateV1(d);
  // v2: explicit validation of all fields
  return {
    phase: isPhase(d.phase) ? d.phase : "pi",
    champion: isMovie(d.champion) ? d.champion : null,
    history: Array.isArray(d.history) ? (d.history as unknown[]).filter(isHistoryEntry) : [],
    upsets: Array.isArray(d.upsets) ? (d.upsets as unknown[]).filter(isUpsetEntry) : [],
    playInIndex: typeof d.playInIndex === "number" ? d.playInIndex : 0,
    currentRound: typeof d.currentRound === "number" ? d.currentRound : 0,
    currentMatch: typeof d.currentMatch === "number" ? d.currentMatch : 0,
    playInMatches: desMatch(d.playInMatches),
    rounds: ((d.rounds as unknown[]) ?? []).map(r => desMatch(r)),
  };
}

export function useBracketState() {
  const [init] = useState<Partial<BracketState> | null>(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const d = JSON.parse(atob(hash)) as Record<string, unknown>;
        return parseState(d);
      }
    } catch { /* ignore malformed hash */ }
    const s = loadLS<Record<string, unknown> | null>("dbk-state", null);
    if (!s) return null;
    try {
      return parseState(s);
    } catch {
      return null;
    }
  });

  const [phase, setPhase] = useState<Phase>(() => init?.phase || "pi");
  const defaultPlayInMatches: Match[] = PIP.map(([a, b]) => ({ players: [PLAYIN[a], PLAYIN[b]] as [Movie, Movie] }));
  const [playInMatches, setPlayInMatches] = useState<Match[]>(() => init?.playInMatches || defaultPlayInMatches);
  const [playInIndex, setPlayInIndex] = useState<number>(() => init?.playInIndex ?? 0);
  const [rounds, setRounds] = useState<Match[][]>(() => init?.rounds || []);
  const [currentRound, setCurrentRound] = useState<number>(() => init?.currentRound ?? 0);
  const [currentMatch, setCurrentMatch] = useState<number>(() => init?.currentMatch ?? 0);
  const [champion, setChampion] = useState<Movie | null>(() => init?.champion || null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => init?.history || []);
  const [upsets, setUpsets] = useState<UpsetEntry[]>(() => init?.upsets ?? []);

  const animatingRef = useRef(false);
  const pendingPickRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [animatingSeed, setAnimatingSeed] = useState<number | null>(null);
  const [upFlash, setUpFlash] = useState(false);

  // Wire format consumed by useSupabaseSync and URL sharing.
  const serialized = useMemo(() => ({
    _v: 2,
    phase, playInMatches: serMatch(playInMatches), playInIndex,
    rounds: rounds.map(r => serMatch(r)), currentRound, currentMatch,
    champion, history, upsets,
  }), [phase, playInMatches, playInIndex, rounds, currentRound, currentMatch, champion, history, upsets]);

  // Persist bracket state to localStorage and URL hash.
  // Guard: don't overwrite the hash while Supabase auth tokens are still there.
  useEffect(() => {
    saveLS("dbk-state", serialized);
    const hashHasAuth = window.location.hash.includes("access_token") || window.location.hash.includes("token_hash");
    if (!hashHasAuth && (history.length > 0 || champion)) {
      try {
        const encoded = btoa(JSON.stringify(serialized));
        if (encoded.length <= 8192) {
          window.history.replaceState(null, "", "#" + encoded);
        }
      } catch { /* btoa failure */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, champion]); // history.length omitted: serialized already captures history

  // Easter egg: press ? to open the repo
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "?" && !(e.target as Element).closest("input,textarea")) window.open("https://github.com/snackdriven/disney-bracket", "_blank", "noopener,noreferrer"); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // Derived values
  const isPlayIn = phase === "pi";
  const activeMatch = isPlayIn ? playInMatches[playInIndex] : rounds[currentRound]?.[currentMatch];
  const progress = champion ? 100 : (history.length / 69) * 100;
  const roundLabel = isPlayIn ? "Play-In Round" : (RND[currentRound] || "");
  const matchNumber = isPlayIn ? playInIndex + 1 : currentMatch + 1;
  const matchTotal = isPlayIn ? 6 : (rounds[currentRound]?.length || 0);
  // Matches per region per round: 8 in R64, 4 in R32, 2 in Sweet 16
  const matchesPerRegion = currentRound === 0 ? 8 : currentRound === 1 ? 4 : 2;
  const regionIndex = !isPlayIn && currentRound <= 2 ? Math.floor(currentMatch / matchesPerRegion) : -1;
  const regionName = regionIndex >= 0 && regionIndex < 4 ? REG[regionIndex] : "";
  const upNextPool = isPlayIn ? playInMatches : rounds[currentRound];
  const upNextIndex = isPlayIn ? playInIndex : currentMatch;

  const applyState = (ns: BracketState) => {
    setPhase(ns.phase); setPlayInMatches(ns.playInMatches); setPlayInIndex(ns.playInIndex);
    setRounds(ns.rounds); setCurrentRound(ns.currentRound); setCurrentMatch(ns.currentMatch);
    setChampion(ns.champion); setHistory(ns.history); setUpsets(ns.upsets);
  };

  const applyServerState = (raw: unknown) => {
    if (!raw) return;
    const s = raw as Record<string, unknown>;
    try {
      const parsed = parseState(s);
      setPhase(parsed.phase ?? "pi");
      setPlayInMatches(parsed.playInMatches ?? defaultPlayInMatches);
      setPlayInIndex(parsed.playInIndex ?? 0);
      setRounds(parsed.rounds ?? []);
      setCurrentRound(parsed.currentRound ?? 0);
      setCurrentMatch(parsed.currentMatch ?? 0);
      setChampion(parsed.champion ?? null);
      setHistory(parsed.history ?? []);
      setUpsets(parsed.upsets ?? []);
      // Persist the validated state. playInMatches and rounds must be re-serialized
      // (parsed holds live Match objects; localStorage expects SerializedMatch format).
      saveLS("dbk-state", {
        _v: 2, ...parsed,
        playInMatches: serMatch(parsed.playInMatches ?? []),
        rounds: (parsed.rounds ?? []).map(r => serMatch(r)),
      });
    } catch { /* ignore malformed server data */ }
  };

  const pick = (w: Movie) => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    const opponent = activeMatch.players[0].seed === w.seed ? activeMatch.players[1] : activeMatch.players[0];
    const isUpset = w.seed > opponent.seed;
    setAnimatingSeed(w.seed);
    if (isUpset) { setUpFlash(true); setTimeout(() => setUpFlash(false), 1500); }
    // Capture state now so the timeout uses the pre-animation snapshot, not stale closure values.
    const snap: BracketState = { phase, playInMatches, playInIndex, rounds, currentRound, currentMatch, champion, history, upsets };
    pendingPickRef.current = setTimeout(() => {
      pendingPickRef.current = null;
      animatingRef.current = false;
      setAnimatingSeed(null);
      applyState(applyPick(snap, w));
    }, 320);
  };

  const undo = () => {
    if (pendingPickRef.current) {
      clearTimeout(pendingPickRef.current);
      pendingPickRef.current = null;
      animatingRef.current = false;
      setAnimatingSeed(null);
    }
    applyState(applyUndo({ phase, playInMatches, playInIndex, rounds, currentRound, currentMatch, champion, history, upsets }));
  };

  const reset = () => {
    applyState(resetState());
    setUpFlash(false);
    localStorage.removeItem("dbk-state");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  };

  return {
    phase, playInMatches, playInIndex, rounds, currentRound, currentMatch,
    champion, history, upsets,
    isPlayIn, activeMatch, progress, roundLabel, matchNumber, matchTotal,
    regionName, upNextPool, upNextIndex,
    animatingSeed,
    upFlash,
    serialized, applyServerState,
    pick, undo, reset,
  };
}
