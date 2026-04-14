import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { auth, googleProvider } from '../lib/firebase.js';
import { signInWithPopup } from "firebase/auth";
import { Btn } from './Btn.js';

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  const signIn = async () => {
    setErr(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error: unknown) {
      console.error(error);
      const e = error as Error;
      setErr(e.message || "Failed to sign in. Please try again.");
      setLoading(false);
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
          Sign In to Sync
        </h3>
        
        <p className="text-[#8a8aa8] text-[13px] mt-0 mb-[24px] leading-[1.6]">
          Sign in with Google to automatically save your bracket and notes to the cloud, so you can resume on any device.
        </p>
        
        {err && <p className="text-[#ff8a65] text-[13px] mt-0 mb-[16px] leading-[1.5]">{err}</p>}
        
        <div className="flex flex-col gap-[12px]">
          <button 
            disabled={loading}
            onClick={signIn}
            className="w-full relative flex items-center justify-center gap-[12px] bg-white text-black font-semibold text-[14px] py-[12px] rounded-[8px] cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <Btn mob={false} s mu onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}
