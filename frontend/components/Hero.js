'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Arrow } from './Icons';
import CopyCA from './CopyCA';

const coinUrl = (m) => `https://dd.dexscreener.com/ds-data/tokens/solana/${m}.png`;

// Floating coins around the boomerang — the point: ANY token, not just USDC.
const COINS = [
  { m: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', pos: 'left-0 top-8', size: 'h-14 w-14', delay: '0s' },     // USDC
  { m: 'So11111111111111111111111111111111111111112', pos: 'right-4 top-0', size: 'h-12 w-12', delay: '-2.2s' },   // SOL
  { m: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', pos: 'bottom-6 left-6', size: 'h-12 w-12', delay: '-4s' },   // BONK
  { m: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', pos: 'bottom-12 right-0', size: 'h-11 w-11', delay: '-1.1s' }, // WIF
];

export default function Hero() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';
  const telegramUrl = `https://t.me/${botUsername}`;

  const [thrown, setThrown] = useState(false);
  const spinnerRef = useRef(null);
  const hovering = useRef(false);
  const throwing = useRef(false);
  const vel = useRef(0); // deg per frame
  const rot = useRef(0);

  // Spin starts slow and accelerates the longer you hover; eases back when you
  // leave. A throw forces a fast spin for the duration of the flight.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const HOVER_CAP = 13; // max deg/frame while hovering
    const THROW_CAP = 26; // max deg/frame mid-throw
    const ACCEL = 0.16; // ramp-up per frame
    const FRICTION = 0.95; // decay per frame when idle
    let raf;
    const loop = () => {
      const active = hovering.current || throwing.current;
      const cap = throwing.current ? THROW_CAP : HOVER_CAP;
      if (active) {
        vel.current = Math.min(cap, vel.current + ACCEL);
      } else {
        vel.current *= FRICTION;
        if (vel.current < 0.02) vel.current = 0;
      }
      rot.current += vel.current;
      if (spinnerRef.current) {
        spinnerRef.current.style.transform = `rotate(${rot.current}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const throwBoomerang = () => {
    if (thrown) return;
    setThrown(true);
    throwing.current = true;
    vel.current = Math.max(vel.current, 16); // jump-start the spin
    setTimeout(() => {
      setThrown(false);
      throwing.current = false;
    }, 2200); // matches boomThrow duration
  };

  return (
    <section className="relative overflow-hidden px-5 pt-10 sm:pt-14">
      {/* Floating color blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="animate-blob absolute left-[8%] top-24 h-64 w-64 rounded-full bg-boom-300/30 blur-3xl" />
        <div className="animate-blob absolute right-[6%] top-40 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl [animation-delay:-4s]" />
        <div className="animate-blob absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl [animation-delay:-8s]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* ===== Banner ===== */}
        <div className="relative mb-12 h-56 w-full overflow-hidden rounded-2xl border border-line shadow-soft sm:h-72 lg:h-96">
          <Image
            src="/bannier.png"
            alt="Boomerang"
            fill
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-night-950/30" />
        </div>

        {/* ===== Hero ===== */}
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Copy */}
          <div>
            <div className="chip mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-boom-500" />
              The reward layer for Solana
            </div>

            <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-tight text-fg sm:text-6xl lg:text-7xl">
              Pay your holders<br className="hidden sm:block" /> in{' '}
              <span className="text-gradient">anything</span>.
            </h1>

            {/* Punchline — own the category, above the bank-coin meta */}
            <div className="mt-6 max-w-xl rounded-xl border border-line border-l-4 border-l-boom-400 bg-white p-4 shadow-soft">
              <p className="text-[15px] leading-relaxed text-mut">
                PumpFun buys back in one asset.{' '}
                <span className="font-semibold text-fg">Boomerang routes your fees into any token on Solana</span>{' '}
                — and pays it straight to your holders. In one click.
              </p>
            </div>

            {/* Flow */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm font-medium">
              <span className="rounded-full border border-line bg-white px-3 py-1 text-fg shadow-soft">Fees in</span>
              <Arrow className="h-4 w-4 text-boom-500" />
              <span className="rounded-full border border-line bg-white px-3 py-1 text-fg shadow-soft">Any token out</span>
              <Arrow className="h-4 w-4 text-boom-500" />
              <span className="rounded-full border border-line bg-white px-3 py-1 text-fg shadow-soft">Holders paid</span>
              <span className="text-xs text-mut">or</span>
              <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-700 shadow-soft">🔥 Burned</span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-base">
                Start on Telegram
                <Arrow className="h-4 w-4" />
              </a>
              <a href="#how" className="btn-ghost text-base">How it works</a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <CopyCA />
              <p className="text-sm text-mut">The switchboard for PumpFun creator fees.</p>
            </div>
          </div>

          {/* Big landing boomerang + floating coins */}
          <div className="relative mx-auto aspect-square w-full max-w-md">
            {/* soft glow */}
            <div className="absolute inset-10 rounded-full bg-boom-300/30 blur-3xl" />

            <div className="boomerang-hero absolute inset-4">
              <button
                type="button"
                onClick={throwBoomerang}
                onMouseEnter={() => (hovering.current = true)}
                onMouseLeave={() => (hovering.current = false)}
                onFocus={() => (hovering.current = true)}
                onBlur={() => (hovering.current = false)}
                aria-label="Throw the boomerang"
                title="Throw me!"
                className={`boom-throw relative block h-full w-full cursor-pointer ${
                  thrown ? 'is-thrown' : ''
                }`}
              >
                <div ref={spinnerRef} className="boom-spin relative h-full w-full">
                  <Image
                    src="/newlogopng.png"
                    alt="Boomerang"
                    fill
                    priority
                    className="object-contain drop-shadow-[0_18px_30px_rgba(16,24,40,0.18)]"
                  />
                </div>
              </button>
            </div>

            {COINS.map(({ m, pos, size, delay }) => (
              <img
                key={m}
                src={coinUrl(m)}
                alt=""
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                className={`absolute ${pos} ${size} animate-float-slow rounded-full border-2 border-white bg-white shadow-md`}
                style={{ animationDelay: delay }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
