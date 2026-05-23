'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { resolveToken } from '../lib/tokens';
import { Arrow } from './Icons';

const API = process.env.NEXT_PUBLIC_API_URL || '';
const SOL_ADDR = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function short(a) {
  return a ? `${a.slice(0, 4)}…${a.slice(-4)}` : '';
}

function CoinChip({ address }) {
  const t = resolveToken(address);
  const [ok, setOk] = useState(Boolean(t.logo));
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-fg shadow-soft">
      {ok ? (
        <img src={t.logo} alt="" onError={() => setOk(false)} className="h-5 w-5 rounded-full" />
      ) : (
        <span className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: t.color }}>
          {t.symbol.replace('$', '').slice(0, 2)}
        </span>
      )}
      ${t.symbol}
      <span className="font-mono text-xs font-normal text-mut">{short(address)}</span>
    </span>
  );
}

export default function TokenSearch() {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | searching | done
  const [result, setResult] = useState(null);
  const [run, setRun] = useState(0);
  const runRef = useRef(0);

  async function onSubmit(e) {
    e.preventDefault();
    const ca = query.trim();
    setRun((r) => r + 1);

    if (!SOL_ADDR.test(ca)) {
      setResult({ kind: 'invalid' });
      setPhase('done');
      return;
    }

    const myRun = ++runRef.current;
    setPhase('searching');
    setResult(null);
    const started = Date.now();

    let res;
    try {
      const r = await fetch(`${API}/api/dashboard/${ca}`, { cache: 'no-store' });
      if (r.ok) res = { kind: 'found', data: await r.json(), ca };
      else if (r.status === 404) res = { kind: 'notfound', ca };
      else res = { kind: 'error' };
    } catch {
      res = { kind: 'error' };
    }

    // Let the boomerang visibly pass before revealing the answer
    const wait = Math.max(0, 1000 - (Date.now() - started));
    setTimeout(() => {
      if (runRef.current !== myRun) return;
      setResult(res);
      setPhase('done');
      setRun((r) => r + 1);
    }, wait);
  }

  return (
    <div id="check" className="scroll-mt-20">
      <div className="mb-6 text-center">
        <div className="eyebrow mb-2">Token check</div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Is a token linked to Boomerang?
        </h2>
        <p className="mt-2 text-sm text-mut">Paste a token contract address (CA) to find out.</p>
      </div>

      <form onSubmit={onSubmit} className="mx-auto flex max-w-2xl flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paste a Solana token address…"
          spellCheck={false}
          className="flex-1 rounded-lg border border-line bg-white px-4 py-3 font-mono text-sm text-fg shadow-soft outline-none transition focus:border-boom-400 focus:ring-2 focus:ring-boom-200"
        />
        <button type="submit" className="btn-primary justify-center" disabled={phase === 'searching'}>
          {phase === 'searching' ? 'Checking…' : 'Check'}
          <Arrow className="h-4 w-4" />
        </button>
      </form>

      {/* Result stage (boomerang sweeps across, then the answer reveals) */}
      <div className="relative mx-auto mt-5 min-h-[120px] max-w-2xl overflow-hidden">
        {phase === 'searching' && (
          <>
            <div key={run} className="boomerang-sweep pointer-events-none absolute top-1/2 z-10 h-14 w-14">
              <Image src="/newlogopng.png" alt="" fill className="object-contain drop-shadow-md" />
            </div>
            <div className="flex min-h-[120px] items-center justify-center text-sm font-medium text-mut">
              Throwing the boomerang…
            </div>
          </>
        )}

        {phase === 'done' && result && (
          <div key={run} className="reveal-pop">
            {result.kind === 'found' && (
              <div className="rounded-2xl border border-boom-300 bg-boom-50 p-5 shadow-soft">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-boom-500 text-white">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
                  </span>
                  <span className="font-display text-lg font-semibold text-fg">Linked to Boomerang</span>
                  <span className={`ml-auto chip ${result.data.config.isActive ? 'text-boom-700' : 'text-mut'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${result.data.config.isActive ? 'bg-boom-500' : 'bg-mut'}`} />
                    {result.data.config.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-wider text-mut">Token</p>
                    <CoinChip address={result.data.sourceToken.address} />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-wider text-mut">Rewards paid in</p>
                    <CoinChip address={result.data.targetToken.address} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-boom-200 pt-4">
                  <span className="text-sm text-mut">Runs every {result.data.config.intervalMinutes} min</span>
                  <Link href={`/${result.ca}`} className="btn-primary !py-2">
                    Open dashboard <Arrow className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {result.kind === 'notfound' && (
              <div className="rounded-2xl border border-line bg-white p-5 text-center shadow-soft">
                <p className="font-display text-lg font-semibold text-fg">Not linked yet</p>
                <p className="mt-1 text-sm text-mut">
                  This token isn’t running Boomerang. Set it up in the Telegram bot to start rewarding holders.
                </p>
              </div>
            )}

            {result.kind === 'invalid' && (
              <div className="rounded-2xl border border-amber/40 bg-white p-5 text-center shadow-soft">
                <p className="text-sm font-medium text-fg">That doesn’t look like a Solana address.</p>
                <p className="mt-1 text-sm text-mut">Paste a valid token mint (32–44 characters).</p>
              </div>
            )}

            {result.kind === 'error' && (
              <div className="rounded-2xl border border-line bg-white p-5 text-center shadow-soft">
                <p className="text-sm text-mut">Couldn’t check right now — please try again.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
