import { useState } from "react";
import { loadLS, saveLS } from '../lib/utils.js';
import type { Notes } from '../types.js';

export function useNotes() {
  const [notes, setNotes] = useState<Notes>(() => {
    const raw = loadLS<Record<string, unknown>>("dbk-notes", {});
    const result: Notes = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string") result[Number(k)] = v;
    }
    return result;
  });
  const [showNotes, setShowNotes] = useState(false);

  const updateNote = (seed: number, text: string) => {
    const nn = { ...notes, [seed]: text };
    setNotes(nn); saveLS("dbk-notes", nn);
  };

  return { notes, setNotes, showNotes, setShowNotes, updateNote };
}
