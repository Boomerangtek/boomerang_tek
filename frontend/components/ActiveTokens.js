'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { resolveToken } from '../lib/tokens';

const API = process.env.NEXT_PUBLIC_API_URL || '';

/** Coin avatar: CDN logo, falling back to a colored ticker badge. */
function Coin({ mint, size = 'h-9 w-9' }) {
  const token = resolveToken(mint);
  const [ok, setOk] = useState(Boolean(token.logo));
  if (ok) {
    return (
      <img
        src={token.logo}
        alt={token.symbol}
        onError={() => setOk(false)}
        className={`${size} shrink-0 rounded-full border border-line bg-night-850 object-cover`}
      />
    );
  }
  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-full border border-line text-[10px] font-extrabold text-white`}
      style={{ background: token.color }}
    >
      {token.symbol.replace('$', '').slice(0, 3)}
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
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-2">Live</div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Tokens running Boomerang
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-mut">
            Every token below has the bot active right now, paying holders on a schedule.
          </p>
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
        <div className="panel px-6 py-12 text-center text-sm text-mut">
          No active bots right now.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tokens.map((t) => {
            const source = resolveToken(t.address);
            const reward = resolveToken(t.rewardToken);
            return (
              <Link
                key={t.address}
                href={`/${t.address}`}
                className="panel card-fun flex items-center gap-3 p-4 hover:border-boom-300"
              >
                <Coin mint={t.address} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                    <span className="truncate">${source.symbol}</span>
                    <span className="text-mut">→ ${reward.symbol}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-mut">
                    every {t.intervalMinutes} min
                    {t.distributions > 0 ? ` · ${t.distributions} payouts` : ''}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-boom-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-boom-700">
                  Active
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
