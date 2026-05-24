'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PerformanceChart from '../../components/PerformanceChart';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { Coins, Bolt, Swap, Gift, Arrow } from '../../components/Icons';
import Countdown from '../../components/Countdown';

function shortenAddress(a) {
  return a ? `${a.slice(0, 4)}…${a.slice(-4)}` : '';
}
function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n || 0);
}
function formatCompact(n) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);
}
function tokenLabel(t) {
  return t?.symbol || shortenAddress(t?.address);
}

/** Token logo with graceful fallback to a lettered badge. */
function TokenLogo({ token, size = 'h-11 w-11' }) {
  const [broken, setBroken] = useState(false);
  if (token?.image && !broken) {
    return (
      <img
        src={token.image}
        alt=""
        onError={() => setBroken(true)}
        className={`${size} shrink-0 rounded-full border border-line bg-night-850 object-cover`}
      />
    );
  }
  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full border border-line bg-boom-100 text-xs font-extrabold text-boom-700`}>
      {tokenLabel(token).replace('$', '').slice(0, 3).toUpperCase()}
    </div>
  );
}

export default function TokenDashboard() {
  const params = useParams();
  const tokenAddress = params.tokenAddress;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('1m');
  const [copied, setCopied] = useState(false);

  const copyCA = async () => {
    try {
      await navigator.clipboard.writeText(tokenAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/dashboard/${tokenAddress}`);
        if (!response.ok) throw new Error('Token not found or not active');
        setData(await response.json());
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [tokenAddress]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="panel px-10 py-12 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-boom-400" />
          <p className="text-sm font-medium text-fg">Loading dashboard…</p>
          <p className="mt-1 text-xs text-mut">Fetching live data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="panel max-w-md px-8 py-10 text-center">
          <h1 className="font-display text-xl font-semibold text-fg">Token not found</h1>
          <p className="mt-2 text-sm text-mut">
            This token doesn’t have an active Boomerang configuration yet.
          </p>
          <Link href="/" className="btn-primary mt-6">
            Go home <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const solClaimed = (Number(data.stats.totalSolClaimed) / 1e9).toFixed(3);

  // Reward-token amounts are stored in raw base units — convert with the
  // reward token's decimals so we show real token counts, not huge integers.
  const rewardDecimals = Number(data.targetToken.decimals ?? 0);
  const toUnits = (raw) => Number(raw || 0) / 10 ** rewardDecimals;
  const rewardSym = tokenLabel(data.targetToken);

  const STATS = [
    { Icon: Coins, label: 'Fees claimed', value: `${solClaimed} SOL`, accent: true },
    { Icon: Bolt, label: 'Distributions', value: formatNumber(data.stats.totalExecutions) },
    { Icon: Swap, label: 'Bought back', value: formatCompact(toUnits(data.stats.totalBoughtBack)) },
    { Icon: Gift, label: 'Airdropped', value: formatCompact(toUnits(data.stats.totalAirdropped)) },
  ];

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-6xl px-5 py-8">
        {/* Token header — identity, copiable CA, what the bot does */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <TokenLogo token={data.sourceToken} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <h1 className="font-display text-xl font-bold tracking-tight text-fg">
                  {data.sourceToken.name || tokenLabel(data.sourceToken)}
                </h1>
                <span className="text-sm font-medium text-mut">${tokenLabel(data.sourceToken)}</span>
                {data.sourceToken.marketCap ? (
                  <span className="rounded-full bg-boom-100 px-2 py-0.5 text-[11px] font-semibold text-boom-700">
                    MC ${formatCompact(data.sourceToken.marketCap)}
                  </span>
                ) : null}
              </div>
              <button
                onClick={copyCA}
                title="Copy contract address"
                className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-mut transition hover:text-fg"
              >
                {shortenAddress(data.sourceToken.address)}
                {copied ? (
                  <span className="text-boom-600">Copied!</span>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip ${data.config.isActive ? 'text-boom-700' : 'text-mut'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${data.config.isActive ? 'bg-boom-400' : 'bg-mut'}`} />
              {data.config.isActive ? 'Active' : 'Paused'} · every {data.config.intervalMinutes} min
            </span>
            {data.config.trollMode ? (
              <span className="chip border-purple-300 bg-purple-50 text-purple-700">
                🎲 Troll Mode · random reward 👹
              </span>
            ) : (
              <span className="chip text-fg">
                <Gift className="h-3.5 w-3.5 text-boom-600" />
                Rewards in ${tokenLabel(data.targetToken)}
              </span>
            )}
            <a
              href={`https://solscan.io/token/${data.sourceToken.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              Solscan
              <Arrow className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map(({ Icon, label, value, accent }) => (
            <div key={label} className="panel p-4">
              <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-night-850 text-boom-600">
                <Icon className="h-4 w-4" />
              </span>
              <p className={`font-display text-2xl font-semibold tracking-tight ${accent ? 'text-boom-700' : 'text-fg'}`}>
                {value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-mut">{label}</p>
            </div>
          ))}
        </div>

        {/* Chart + side stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="panel p-6 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-fg">Airdrops over time</h2>
              <div className="flex gap-1">
                {['1w', '1m', '1y', 'All'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      timeRange === range ? 'bg-boom-500/15 text-boom-700' : 'text-mut hover:text-fg'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            {data.recentExecutions.length > 0 ? (
              <PerformanceChart data={data.recentExecutions} timeRange={timeRange} symbol={rewardSym} decimals={rewardDecimals} />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-mut">
                No execution data yet
              </div>
            )}
          </div>

          <div className="panel p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-mut">Distribution</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-mut">Fees claimed</p>
                <p className="font-display text-xl font-semibold text-boom-700">{solClaimed} SOL</p>
              </div>
              <div>
                <p className="text-xs text-mut">Holders reached</p>
                <p className="font-display text-xl font-semibold text-fg">{data.topRecipients.length}</p>
              </div>
              <div>
                <p className="text-xs text-mut">Success rate</p>
                <p className="font-display text-xl font-semibold text-fg">
                  {data.stats.totalExecutions > 0 ? '100%' : '—'}
                </p>
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-xs text-mut">Interval</p>
                <p className="text-sm font-medium text-fg">Every {data.config.intervalMinutes} minutes</p>
              </div>
              {data.config.isActive && (
                <div>
                  <p className="text-xs text-mut">Next distribution</p>
                  <p className="font-display text-xl font-semibold tabular-nums text-boom-700">
                    <Countdown intervalMinutes={data.config.intervalMinutes} />
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipients + activity */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-fg">Top recipients</h2>
              <span className="text-xs text-mut">{data.topRecipients.length} holders</span>
            </div>
            <div className="space-y-1.5">
              {data.topRecipients.map((r, i) => (
                <div key={r.address} className="flex items-center justify-between rounded-lg border border-line/70 px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-night-850 text-xs font-semibold text-boom-700">
                      {i + 1}
                    </span>
                    <span className="font-mono text-sm text-fg">{shortenAddress(r.address)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-fg">
                      {formatCompact(toUnits(r.totalReceived))} ${rewardSym}
                    </p>
                    <p className="text-xs text-mut">{r.airdropCount} drops</p>
                  </div>
                </div>
              ))}
              {data.topRecipients.length === 0 && (
                <div className="py-12 text-center text-sm text-mut">No airdrops yet</div>
              )}
            </div>
          </div>

          <div className="panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-fg">Recent activity</h2>
              <span className="text-xs text-mut">{data.recentExecutions.length} runs</span>
            </div>
            <div className="space-y-1.5">
              {data.recentExecutions.map((e) => (
                <div key={e.id} className="rounded-lg border border-line/70 px-3 py-2.5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-mut">{new Date(e.executionTime).toLocaleTimeString()}</span>
                    <span className="text-xs font-semibold text-boom-700">
                      +{(Number(e.claimedSol) / 1e9).toFixed(3)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-mut">
                    <span>
                      {formatCompact(Number(e.totalAirdropped || 0) / 10 ** (e.rewardDecimals ?? rewardDecimals))}{' '}
                      ${e.rewardSymbol || rewardSym} → {e.holderCount} holders
                    </span>
                    <span className="flex items-center gap-2">
                      {e.txSignature && (
                        <a
                          href={`https://solscan.io/tx/${e.txSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(ev) => ev.stopPropagation()}
                          className="font-medium text-boom-700 hover:underline"
                        >
                          Solscan ↗
                        </a>
                      )}
                    </span>
                  </div>
                </div>
              ))}
              {data.recentExecutions.length === 0 && (
                <div className="py-12 text-center text-sm text-mut">No executions yet</div>
              )}
            </div>
          </div>
        </div>

        {/* footer bar */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-mut">
          <span>
            Last execution: {data.stats.lastExecution ? new Date(data.stats.lastExecution).toLocaleString() : 'Never'}
          </span>
          <span>·</span>
          <span>Updated {new Date(data.timestamp).toLocaleTimeString()}</span>
        </div>
      </main>
      <Footer />
    </>
  );
}
