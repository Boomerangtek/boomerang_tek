'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '';

function timeLeft(endsAt) {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return 'resolving…';
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function Logo({ image, symbol, size = 'h-7 w-7' }) {
  const [broken, setBroken] = useState(!image);
  if (image && !broken) {
    return <img src={image} alt="" onError={() => setBroken(true)} className={`${size} shrink-0 rounded-full border border-line object-cover`} />;
  }
  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full border border-line bg-sky-100 text-[10px] font-extrabold text-sky-700`}>
      {(symbol || '?').replace('$', '').slice(0, 3).toUpperCase()}
    </div>
  );
}

export default function LiveVotes() {
  const [votes, setVotes] = useState(null);
  const [, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API}/api/vote/active`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setVotes(data.votes || []);
      } catch {
        if (!cancelled) setVotes([]);
      }
    }
    load();
    const poll = setInterval(load, 10000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(tick);
    };
  }, []);

  if (!votes || votes.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
        </span>
        <h2 className="text-sm font-semibold text-fg">Live votes</h2>
        <span className="text-xs text-mut">· {votes.length} active</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {votes.map((v) => (
          <div key={v.cycleId} className="panel flex items-center gap-3 p-3">
            <Logo image={v.image} symbol={v.symbol} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-fg">${v.symbol || v.token.slice(0, 4)}</span>
                <span className="shrink-0 font-mono text-[11px] text-mut">{timeLeft(v.endsAt)}</span>
              </div>
              <div className="truncate text-xs text-mut">
                {v.leader
                  ? <>🏆 ${v.leader.symbol || '—'} leading · {Math.round(v.leader.share * 100)}%</>
                  : 'no votes yet'}
                {' · '}{v.voters} voters
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
