import { useState } from "react";
import { exportBracketText } from '../lib/bracket.js';
import type { Match, Movie } from '../types.js';

export function useShareClipboard(playInMatches: Match[], rounds: Match[][], champion: Movie | null) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBracket, setCopiedBracket] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    }).catch(() => { /* clipboard unavailable */ });
  };

  const copyBracket = () => {
    const text = exportBracketText({ piM: playInMatches, rds: rounds, ch: champion });
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBracket(true);
      setTimeout(() => setCopiedBracket(false), 1500);
    }).catch(() => { /* clipboard unavailable */ });
  };

  return { copiedLink, copiedBracket, copyLink, copyBracket };
}
