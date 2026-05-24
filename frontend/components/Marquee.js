'use client';

import { useEffect, useState } from 'react';
import { resolveToken } from '../lib/tokens';

const API = process.env.NEXT_PUBLIC_API_URL || '';

// Shown until live airdrops load (and as a fallback if there are none yet).
const FALLBACK = [
  'Your fees always come back',
  'Claim → Buy → Airdrop or Burn',
  'Paid proportionally to holders',
  'Pick any reward token',
  'Runs every 1–60 minutes',
  'Built on Solana',
];

export default function Marquee() {
  const [items, setItems] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API}/api/activity?limit=20`, { cache: 'no-store' });
        const data = await res.json();
        const meta = data.meta || {};
        const sym = (m) => meta[m]?.symbol || resolveToken(m).symbol;
        const airdrops = (data.events || [])
          .filter((e) => e.type === 'paid' && e.holderCount > 0)
          .map((e) => `🎁 $${sym(e.sourceToken)} paid ${e.holderCount} holders in $${sym(e.targetToken)}`);
        if (!cancelled && airdrops.length) setItems(airdrops);
      } catch {
        /* keep fallback */
      }
    }
    load();
    const t = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  // Duplicate so the CSS marquee loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="relative z-50 overflow-hidden border-b border-boom-200 bg-boom-50">
      <div className="marquee-track py-2">
        {loop.map((item, i) => (
          <span
            key={i}
            className="mx-5 flex items-center gap-5 whitespace-nowrap text-xs font-semibold tracking-wide text-boom-700"
          >
            {item}
            <span className="h-1 w-1 rounded-full bg-boom-500" />
          </span>
        ))}
      </div>
    </div>
  );
}
