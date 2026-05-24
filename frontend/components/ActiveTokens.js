'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { resolveToken } from '../lib/tokens';
import Countdown from './Countdown';

const API = process.env.NEXT_PUBLIC_API_URL || '';

const compact = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);

/** Coin avatar: real image → DexScreener CDN → colored ticker badge. */
function Coin({ mint, image }) {
  const fallback = resolveToken(mint);
  const [src, setSrc] = useState(image || fallback.logo);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setSrc(src === image ? fallback.logo : null)}
        className="h-8 w-8 shrink-0 rounded-full border border-line bg-night-850 object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-[10px] font-extrabold text-white"
      style={{ background: fallback.color }}
    >
      {fallback.symbol.replace('$', '').slice(0, 3)}
    </div>
  );
}

export default function ActiveTokens() {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API}/api/v1/tokens`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled && Array.isArray(data.tokens)) setTokens(data.tokens);
      } catch {
        /* ignore transient errors */
      }
    }
    load();
    const t = setInterval(load, 20000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div id="bots" className="scroll-mt-20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">Live</div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Tokens running Boomerang
          </h2>
        </div>
        <span className="chip shrink-0 text-boom-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-boom-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-boom-400" />
          </span>
          {tokens.length} active
        </span>
      </div>

      {tokens.length === 0 ? (
        <div className="panel px-6 py-10 text-center text-sm text-mut">No active bots right now.</div>
      ) : (
        <div className="panel divide-y divide-line/70 overflow-hidden">
          {tokens.map((t) => {
            const symbol = t.symbol || resolveToken(t.address).symbol;
            const rewardSymbol = t.rewardSymbol || resolveToken(t.rewardToken).symbol;
            return (
              <Link
                key={t.address}
                href={`/${t.address}`}
                className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-boom-50"
              >
                <Coin mint={t.address} image={t.image} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="truncate text-sm font-semibold text-fg">
                      {t.name || `$${symbol}`}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] text-mut">${symbol}</span>
                  </div>
                  <div className="truncate text-xs text-mut">
                    → ${rewardSymbol} · every {t.intervalMinutes}m
                    {t.marketCap ? ` · MC $${compact(t.marketCap)}` : ''}
                    {t.distributions > 0 ? ` · ${t.distributions} payouts` : ''}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-boom-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-boom-500" />
                    Active
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] text-mut">
                    next <Countdown intervalMinutes={t.intervalMinutes} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
