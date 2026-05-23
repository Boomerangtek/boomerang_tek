'use client';

import { useState } from 'react';

export const BOOMERANG_CA = 'BwEyBmL9drBdo4XJno8iGRvjiZcGL9FvUnq6xVNhpump';

const short = (a) => `${a.slice(0, 4)}…${a.slice(-4)}`;

export default function CopyCA({ className = '' }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BOOMERANG_CA);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      onClick={copy}
      title="Copy $BOOMERANG contract address"
      className={`group inline-flex items-center gap-2 rounded-full border border-line bg-white px-2.5 py-1.5 text-xs font-medium shadow-soft transition hover:border-boom-400 ${className}`}
    >
      <span className="rounded-full bg-boom-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-boom-700">
        CA
      </span>
      <span className="font-mono text-fg">{copied ? 'Copied!' : short(BOOMERANG_CA)}</span>
      {copied ? (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-boom-600" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l4 4 10-10" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-mut transition group-hover:text-boom-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
    </button>
  );
}
