'use client';

import { useEffect, useRef, useState } from 'react';
import { Gift, Flame } from './Icons';

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
          Every 15 minutes we point our own bot at ourselves: 70% airdropped to holders,
          30% buyback &amp; burn. This isn&apos;t a feature pitch; it&apos;s what the bot
          does right now, on us.
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
    </div>
  );
}
