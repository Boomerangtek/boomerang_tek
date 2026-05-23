'use client';

import { useEffect, useRef, useState } from 'react';
import { Coins, Chart, Bolt, Users } from './Icons';

const API = process.env.NEXT_PUBLIC_API_URL || '';

function Counter({ value, decimals = 0, prefix = '', start }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    const target = Number(value) || 0;
    if (target === 0) return setN(0);
    const dur = 1200;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, value]);

  const formatted =
    decimals > 0
      ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : Math.round(n).toLocaleString('en-US');
  return <span className="tabular-nums">{prefix}{formatted}</span>;
}

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export default function StatsBar() {
  const ref = useRef(null);
  const [start, setStart] = useState(false);
  const [solPrice, setSolPrice] = useState(0);
  const [stats, setStats] = useState({
    totalSolClaimed: 0,
    totalExecutions: 0,
    activeConfigs: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetch(`${API}/api/stats`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setStats((s) => ({ ...s, ...d })))
      .catch(() => {});
  }, []);

  // Live SOL price so we can show fees redistributed in USD, not SOL.
  useEffect(() => {
    fetch(`https://lite-api.jup.ag/price/v3?ids=${SOL_MINT}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const p = Number(d?.[SOL_MINT]?.usdPrice);
        if (p > 0) setSolPrice(p);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStart(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const items = [
    { Icon: Coins, label: 'Redistributed', value: (Number(stats.totalSolClaimed) || 0) * solPrice, decimals: 2, prefix: '$', tile: 'bg-boom-100 text-boom-600', ring: 'hover:border-boom-300' },
    { Icon: Bolt, label: 'Distributions run', value: stats.totalExecutions || 0, tile: 'bg-sky-100 text-sky-600', ring: 'hover:border-sky-300' },
    { Icon: Chart, label: 'Active bots', value: stats.activeConfigs || 0, tile: 'bg-amber-100 text-amber-600', ring: 'hover:border-amber-300' },
    { Icon: Users, label: 'Creators onboard', value: stats.totalUsers || 0, tile: 'bg-violet-100 text-violet-600', ring: 'hover:border-violet-300' },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ Icon, label, value, decimals, prefix, tile, ring }) => (
        <div key={label} className={`panel card-fun p-5 ${ring}`}>
          <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tile}`}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            <Counter value={value} decimals={decimals} prefix={prefix} start={start} />
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-mut">{label}</div>
        </div>
      ))}
    </div>
  );
}
