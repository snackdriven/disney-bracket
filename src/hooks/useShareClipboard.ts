import { useState } from "react";
import { exportBracketText } from '../lib/bracket.js';
import type { Match, Movie } from '../types.js';

export function useShareClipboard(playInMatches: Match[], rounds: Match[][], champion: Movie | null, serialized?: object) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBracket, setCopiedBracket] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const copyLink = async () => {
    setCopiedLink(false);
    setShareError(null);
    try {
      const link = new URL(window.location.href);
      if (serialized) {
        const encoded = btoa(JSON.stringify(serialized));
        if (encoded.length > 8192) {
          setShareError('This bracket is too large for a share link. Use Export or download a recovery copy to keep the current draw.');
          return;
        }
        link.hash = encoded;
      }
      await navigator.clipboard.writeText(link.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } catch { setShareError('The current bracket link could not be copied. Use Export or download a recovery copy.'); }
  };

  const copyBracket = () => {
    const text = exportBracketText({ piM: playInMatches, rds: rounds, ch: champion });
    navigator.clipboard.writeText(text).then(() => {
      setCopiedBracket(true);
      setTimeout(() => setCopiedBracket(false), 1500);
    }).catch(() => { /* clipboard unavailable */ });
  };

  return { copiedLink, copiedBracket, copyLink, copyBracket, shareError };
}
