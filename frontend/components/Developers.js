'use client';

import { useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://boomerang.tips';

const ENDPOINTS = [
  { path: '/api/v1/stats', desc: 'Global Boomerang stats (SOL redistributed, active bots…).' },
  { path: '/api/v1/activity?limit=20', desc: 'Recent linked tokens and payouts.' },
  { path: '/api/v1/token/{address}', desc: 'Check if a token is linked + its reward token & stats.' },
];

function Endpoint({ path, desc }) {
  const [copied, setCopied] = useState(false);
  const full = `${BASE}${path}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="panel flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="rounded bg-boom-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-boom-700">
            GET
          </span>
          <code className="truncate font-mono text-sm text-fg">{path}</code>
        </div>
        <p className="mt-1 text-xs text-mut">{desc}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 self-start rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-mut transition hover:border-boom-400 hover:text-boom-700 sm:self-center"
      >
        {copied ? 'Copied!' : 'Copy URL'}
      </button>
    </div>
  );
}

export default function Developers() {
  return (
    <div id="developers" className="scroll-mt-20">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow mb-2">Developers</div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Build on Boomerang
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mut">
            A free, public, read-only API. No key required. Query token links, payouts and live stats.
          </p>
        </div>
        <a
          href="/api/v1"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost shrink-0 self-start"
        >
          View API root
        </a>
      </div>

      <div className="grid gap-3">
        {ENDPOINTS.map((e) => (
          <Endpoint key={e.path} {...e} />
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-night-850 p-4">
        <pre className="text-xs leading-relaxed text-mut">
{`$ curl ${BASE || ''}/api/v1/token/BwEy…pump

{
  "linked": true,
  "rewardToken": "EPjFW…Dt1v",
  "intervalMinutes": 30,
  "active": true,
  "stats": { "feesClaimedSol": "12.84", "holdersPaid": 312, ... }
}`}
        </pre>
      </div>
    </div>
  );
}
