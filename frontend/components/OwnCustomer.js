'use client';

import { useEffect, useRef, useState } from 'react';
import { Gift, Flame, Clock, Swap, Users, Arrow, X } from './Icons';

const X_URL = 'https://x.com/Boomerang_tek';

const STEPS = [
  { Icon: X, title: 'Vote on X', body: 'Reply to our post on X with a token’s CA — that reply is your vote.' },
  { Icon: Clock, title: 'Snapshot every 15 min', body: 'We snapshot the votes and the most-backed token wins the cycle.' },
  { Icon: Swap, title: 'Swap the fees', body: '70% of the fees buy the winning token at Jupiter best price.' },
  { Icon: Users, title: 'Airdrop pro-rata', body: 'Sent to every $Boomerang holder by their share — then it loops.' },
];

export default function OwnCustomer() {
  const ref = useRef(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlayed(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} id="onus" className="scroll-mt-20">
      <div className="mb-8 max-w-2xl">
        <div className="eyebrow mb-2">We&apos;re our own first customer</div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Boomerang runs on Boomerang
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mut">
          Every 15 minutes we point our own bot at ourselves — and the community decides
          the payout by voting on X. This isn&apos;t a feature pitch; it&apos;s what the
          bot does right now, on us.
        </p>
      </div>

      {/* The split: 70% holders / 30% buyback + burn */}
      <div className="panel p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold">
          <span className="text-boom-700">70% → holders</span>
          <span className="text-orange-600">30% → buyback &amp; burn</span>
        </div>
        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-black/5">
          <div
            className="bg-boom-500 transition-[width] duration-1000 ease-out"
            style={{ width: played ? '70%' : '0%' }}
          />
          <div
            className="bg-orange-500 transition-[width] delay-300 duration-1000 ease-out"
            style={{ width: played ? '30%' : '0%' }}
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-boom-100 text-boom-600">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-fg">70% airdropped to holders</h3>
              <p className="mt-1 text-sm leading-relaxed text-mut">
                Paid pro-rata to every $Boomerang holder — in a token the community picks,
                fresh every cycle.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Flame className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-fg">30% buyback &amp; burn</h3>
              <p className="mt-1 text-sm leading-relaxed text-mut">
                We buy back $Boomerang and burn it. Supply shrinks a little every 15
                minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How the rotating token is picked — the live loop */}
      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-fg">How the token rotates</h3>
          <span className="chip text-boom-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-boom-500" />
            Live · On loop · Forever
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ Icon, title, body }, i) => (
            <div key={title} className="panel card-fun relative p-5 hover:border-boom-300">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-boom-100 text-boom-600">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="font-display text-lg font-bold text-night-800">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-fg">{title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-mut">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payoff + CTA */}
      <div className="panel-glow mt-8 flex flex-col items-center justify-between gap-5 px-7 py-7 text-center sm:flex-row sm:text-left">
        <p className="text-[15px] leading-relaxed text-mut">
          <span className="font-semibold text-fg">Hold $Boomerang</span> → get paid in
          whatever the community is hyped on, every 15 minutes.
        </p>
        <a href={X_URL} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0">
          <X className="h-4 w-4" />
          Vote on X
          <Arrow className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
