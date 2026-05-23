'use client';

import { useEffect, useRef, useState } from 'react';
import { resolveToken, randomDemoEvent } from '../lib/tokens';

const API = process.env.NEXT_PUBLIC_API_URL || '';
const MAX_ROWS = 6;

function relTime(iso, now) {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (s < 3) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/** Coin avatar: tries the CDN logo, falls back to a colored ticker badge. */
function Coin({ token, size = 'h-9 w-9' }) {
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

function Row({ event, now }) {
  const target = resolveToken(event.targetToken);
  const source = resolveToken(event.sourceToken);
  const isPaid = event.type === 'paid';

  return (
    <li className="animate-feedin flex items-center gap-3 border-b border-line/70 px-4 py-2.5 last:border-b-0">
      <Coin token={isPaid ? target : source} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-fg">
          {isPaid ? (
            <>
              <span className="font-semibold text-boom-600">Paid</span>
              <span className="truncate">${target.symbol}</span>
              {event.holderCount ? (
                <span className="text-mut">· {event.holderCount} holders</span>
              ) : null}
            </>
          ) : (
            <>
              <span className="font-semibold text-amber">Linked</span>
              <span className="truncate">${source.symbol}</span>
            </>
          )}
        </div>
        <div className="text-xs text-mut">
          {isPaid ? `holders of $${source.symbol}` : `rewards in $${target.symbol}`}
        </div>
      </div>
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-mut">
        {relTime(event.time, now)}
      </span>
    </li>
  );
}

export default function LiveFeed() {
  const [events, setEvents] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const demoId = useRef(0);
  const demoMode = useRef(false);

  // Initial load: prefer real data from the bot; otherwise run a demo stream.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API}/api/activity?limit=${MAX_ROWS}`, { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (Array.isArray(data.events) && data.events.length > 0) {
          setEvents(data.events.map((e, i) => ({ ...e, id: `r${i}-${e.time}` })));
          return; // real data wins; polling below keeps it fresh
        }
      } catch {
        /* backend offline → demo */
      }
      if (!cancelled) startDemo();
    }

    function startDemo() {
      demoMode.current = true;
      // seed a few so it isn't empty on first paint
      const seed = Array.from({ length: MAX_ROWS }, () => {
        const ev = randomDemoEvent(demoId.current++);
        ev.time = new Date(Date.now() - Math.random() * 120000).toISOString();
        return ev;
      });
      setEvents(seed);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tick relative timestamps + drive the demo / poll real data.
  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 1000);

    const pump = setInterval(async () => {
      if (demoMode.current) {
        setEvents((prev) => [randomDemoEvent(demoId.current++), ...prev].slice(0, MAX_ROWS));
      } else {
        try {
          const res = await fetch(`${API}/api/activity?limit=${MAX_ROWS}`, { cache: 'no-store' });
          const data = await res.json();
          if (Array.isArray(data.events) && data.events.length > 0) {
            setEvents(data.events.map((e, i) => ({ ...e, id: `r${i}-${e.time}` })));
          }
        } catch {
          /* ignore transient errors */
        }
      }
    }, 2800);

    return () => {
      clearInterval(clock);
      clearInterval(pump);
    };
  }, []);

  return (
    <div className="panel-glow overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-boom-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-boom-400" />
          </span>
          <span className="text-sm font-semibold text-fg">Live activity</span>
        </div>
        <span className="chip">Auto-updating</span>
      </div>

      <ul>
        {events.map((e) => (
          <Row key={e.id} event={e} now={now} />
        ))}
      </ul>
    </div>
  );
}
