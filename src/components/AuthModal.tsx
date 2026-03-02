import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { supabase } from '../lib/supabase.js';
import { Btn } from './Btn.js';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => { onCloseRef.current = onClose; });
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCloseRef.current(); return; }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => {
      window.removeEventListener("keydown", h);
      previouslyFocused?.focus();
    };
  }, []);
  const sendLink = async () => {
    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (error) {
      setErr(error.status === 429 ? "Too many requests — wait a minute and try again." : error.message);
    } else {
      setSent(true);
    }
  };
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="bg-[#12122a] border border-white/10 rounded-[16px] p-[28px_24px] max-w-[380px] w-[90%] outline-none animate-[su_0.2s_ease-out]"
      >
        <h3 id="auth-modal-title" className="text-[#f0f0ff] mt-0 mb-[8px] text-[18px] font-semibold">
          Sync Across Devices
        </h3>
        {sent ? (
          <p className="text-[#8a8aa8] text-[14px] leading-[1.6] m-0">
            Check your email for a magic link. Close this when you're signed in.
          </p>
        ) : (
          <>
            <p className="text-[#8a8aa8] text-[13px] mt-0 mb-[16px] leading-[1.6]">
              Enter your email — we'll send a link. Your bracket and notes sync automatically once you're signed in.
            </p>
            {err && <p className="text-[#ff8a65] text-[13px] mt-0 mb-[12px] leading-[1.5]">{err}</p>}
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendLink()}
              type="email"
              placeholder="you@example.com"
              className="w-full box-border bg-black/30 border border-white/10 rounded-[8px] px-[12px] py-[10px] text-[#e0e0f0] text-[14px] outline-none mb-[16px]"
            />
            <div className="flex gap-[8px] justify-end">
              <Btn mob={false} s mu onClick={onClose}>Cancel</Btn>
              <Btn mob={false} s onClick={sendLink}>Send Magic Link</Btn>
            </div>
          </>
        )}
        {sent && (
          <div className="mt-[12px] text-right">
            <Btn mob={false} s mu onClick={onClose}>Close</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
