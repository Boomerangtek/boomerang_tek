'use client';

import { useEffect, useRef, useState } from 'react';

// "Why Boomerang" — boomerangs fly a realistic return loop and their
// sweep uncovers the text. Self-manages its in-view trigger.
export default function WhyBoomerang() {
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
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`wb-stage panel relative overflow-hidden px-7 py-14 sm:px-12 sm:py-16 ${
        played ? 'in' : ''
      }`}
    >
      {/* Flight layer — boomerangs loop out and back */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="wb-boom wb-boom--1">
          <img className="wb-spin" src="/newlogopng.png" alt="" />
        </div>
        <div className="wb-boom wb-boom--2">
          <img className="wb-spin" src="/newlogopng.png" alt="" />
        </div>
      </div>

      {/* Text — uncovered as the boomerangs sweep past */}
      <div className="relative z-10 max-w-2xl">
        <div className="wb-reveal eyebrow mb-3" style={{ transitionDelay: '150ms' }}>
          The missing layer
        </div>

        <h2
          className="wb-reveal font-display text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl"
          style={{ transitionDelay: '350ms' }}
        >
          The PumpFun buyback is{' '}
          <span className="text-gradient">incomplete</span>.
        </h2>

        <p
          className="wb-reveal mt-5 text-[15px] leading-relaxed text-mut"
          style={{ transitionDelay: '900ms' }}
        >
          PumpFun lets you buy back — but only in one asset. Want to reward holders in
          USDC, SOL, $TROLL, or your own ticker? Today you&apos;d have to build a whole
          project around it.
        </p>

        <p
          className="wb-reveal mt-4 text-[15px] leading-relaxed text-mut"
          style={{ transitionDelay: '1250ms' }}
        >
          That&apos;s a lot of effort for what should be a setting.{' '}
          <span className="font-semibold text-fg">Boomerang completes the system:</span>{' '}
          one bot, plugged into your dev wallet. You pick the token, the schedule, and the
          destination — airdrop it to holders, or burn it to shrink supply. We route. It
          gets done.
        </p>
      </div>
    </div>
  );
}
