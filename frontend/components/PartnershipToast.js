'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'boomerang_troll_partnership_v1';
const X_POST = 'https://x.com/Boomerang_tek';

export default function PartnershipToast() {
  const [show, setShow] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return; // already dismissed
    const t1 = setTimeout(() => setShow(true), 900);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (show) requestAnimationFrame(() => setEntered(true));
  }, [show]);

  function dismiss() {
    setEntered(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setTimeout(() => setShow(false), 300);
  }

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-[60] w-[min(92vw,360px)] transition-all duration-300 ease-out ${
        entered ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
      role="dialog"
      aria-label="Partnership announcement"
    >
      <div className="overflow-hidden rounded-2xl border border-line bg-night-900 shadow-soft">
        <div className="relative">
          <img src="/trollmode.jpg" alt="$Boomerang × $TROLL — Troll Mode" className="h-36 w-full object-cover" />
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <span className="absolute bottom-2 left-2 rounded-full bg-purple-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            New partnership
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-display text-base font-bold tracking-tight text-fg">
            $Boomerang × $TROLL 🪃👹
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-mut">
            Introducing <span className="font-semibold text-fg">Troll Mode</span> — the airdrop reward is
            randomized every cycle. USDC, SOL, $TROLL, or a surprise ticker. They get paid. They get trolled.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <a
              href={X_POST}
              target="_blank"
              rel="noopener noreferrer"
              onClick={dismiss}
              className="btn-primary flex-1 justify-center py-2 text-sm"
            >
              Read the announcement
            </a>
            <button onClick={dismiss} className="btn-ghost px-3 py-2 text-sm">
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
