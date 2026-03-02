import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { supabase } from '../lib/supabase.js';
import type { Notes } from '../types.js';

interface SyncProps {
  serialized: object;
  notes: Notes;
  onPull: (state: unknown, notes: unknown) => void;
}

export function useSupabaseSync({ serialized, notes, onPull }: SyncProps) {
  const [sbUser, setSbUser] = useState<{ id: string; email?: string } | null>(null);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Keep onPull ref current so auth init effect (runs once) always calls latest version.
  const onPullRef = useRef(onPull);
  useLayoutEffect(() => { onPullRef.current = onPull; });

  // Token-hash exchange — handles magic link clicks (token_hash approach).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    if (tokenHash && type === "email") {
      const clean = window.location.pathname;
      window.history.replaceState(null, "", clean);
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
    }
  }, []);

  // Auth init — runs once on mount.
  useEffect(() => {
    let pulled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSbUser(session?.user ?? null);
      if (session?.user && !pulled && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        pulled = true;
        supabase.from("disney_bracket").select("notes,state").maybeSingle().then(({ data, error }) => {
          if (error || !data) return;
          onPullRef.current(data.state ?? null, data.notes ?? null);
        });
      }
      if (event === "SIGNED_OUT") pulled = false;
    });
    return () => subscription.unsubscribe();
  }, []); // intentional: onPull accessed via ref, runs once

  // Auto-push on state change (debounced 2s).
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!sbUser) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      setSyncStatus("syncing");
      const { error } = await supabase.from("disney_bracket").upsert({
        user_id: sbUser.id, notes, state: serialized, updated_at: new Date().toISOString(),
      });
      setSyncStatus(error ? "error" : "synced");
      if (!error) setTimeout(() => setSyncStatus("idle"), 3000);
    }, 2000);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [serialized, notes, sbUser]);

  return { sbUser, syncStatus, showAuthModal, setShowAuthModal };
}
