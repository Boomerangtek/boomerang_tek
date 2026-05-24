'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import bs58 from 'bs58';
import { voteMessage } from '../../lib/voteMessage';

const compact = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);

function Logo({ image, symbol, size = 'h-8 w-8' }) {
  const [broken, setBroken] = useState(!image);
  if (image && !broken) {
    return <img src={image} alt="" onError={() => setBroken(true)} className={`${size} shrink-0 rounded-full border border-line object-cover`} />;
  }
  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full border border-line bg-boom-100 text-[10px] font-extrabold text-boom-700`}>
      {(symbol || '?').replace('$', '').slice(0, 3).toUpperCase()}
    </div>
  );
}

function timeLeft(endsAt) {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return 'ended';
  const h = Math.floor(ms / 3.6e6);
  const m = Math.floor((ms % 3.6e6) / 6e4);
  const s = Math.floor((ms % 6e4) / 1000);
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function VoteDashboard() {
  const { publicKey, signMessage, connected } = useWallet();
  const wallet = publicKey?.toBase58();

  const [eligible, setEligible] = useState(null); // null = loading
  const [cycles, setCycles] = useState({}); // token -> cycle data
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(null); // optionId being voted
  const [msg, setMsg] = useState(null);

  // tick for countdowns
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const loadEligibility = useCallback(async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`/api/vote/eligibility?wallet=${wallet}`, { cache: 'no-store' });
      const data = await res.json();
      setEligible(data.eligible || []);
    } catch {
      setEligible([]);
    }
  }, [wallet]);

  const loadCycle = useCallback(async (token) => {
    try {
      const res = await fetch(`/api/vote/cycle/${token}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setCycles((prev) => ({ ...prev, [token]: data }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (connected && wallet) loadEligibility();
    else setEligible(null);
  }, [connected, wallet, loadEligibility]);

  // fetch + poll each eligible token's cycle
  useEffect(() => {
    if (!eligible?.length) return;
    eligible.forEach((e) => loadCycle(e.token));
    const t = setInterval(() => eligible.forEach((e) => loadCycle(e.token)), 10000);
    return () => clearInterval(t);
  }, [eligible, loadCycle]);

  async function vote(token, cycleId, optionId) {
    if (!signMessage || !wallet) return;
    setBusy(optionId);
    setMsg(null);
    try {
      const message = voteMessage({ cycleId, optionId, wallet });
      const signature = bs58.encode(await signMessage(new TextEncoder().encode(message)));
      const res = await fetch('/api/vote/cast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, optionId, wallet, signature }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vote failed');
      setMsg({ type: 'ok', text: 'Vote recorded 🪃' });
      await loadCycle(token);
      await loadEligibility();
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setBusy(null);
    }
  }

  // --- not connected ---
  if (!connected) {
    return (
      <div className="panel mx-auto max-w-md px-6 py-10 text-center">
        <div className="text-3xl">🪃🗳️</div>
        <h2 className="mt-3 font-display text-xl font-bold text-fg">Connect to vote</h2>
        <p className="mt-2 text-sm text-mut">
          Connect your Solana wallet (Phantom / Solflare) to see the Boomerang tokens you hold and vote
          on their next airdrop reward. Voting is gasless — you just sign a message.
        </p>
        <div className="mt-6 flex justify-center">
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  // --- connected, loading ---
  if (eligible === null) {
    return <div className="panel px-6 py-12 text-center text-sm text-mut">Checking your holdings…</div>;
  }

  // --- connected, nothing to vote on ---
  if (eligible.length === 0) {
    return (
      <div className="panel px-6 py-12 text-center">
        <p className="text-sm font-medium text-fg">No open votes for your wallet</p>
        <p className="mt-1 text-xs text-mut">
          You don’t hold any token with an active Community Vote (at the last snapshot). Hold a
          vote-enabled Boomerang token to take part.
        </p>
        <div className="mt-5 flex justify-center"><WalletMultiButton /></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm ${msg.type === 'ok' ? 'bg-boom-100 text-boom-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {eligible.map((e) => {
        const data = cycles[e.token];
        const ended = new Date(e.endsAt).getTime() <= now;
        return (
          <div key={e.token} className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-3">
                <Logo image={e.image} symbol={e.symbol} />
                <div>
                  <div className="text-sm font-semibold text-fg">{e.name || `$${e.symbol || e.token.slice(0, 4)}`}</div>
                  <div className="text-xs text-mut">your weight: {compact(Number(e.weight))}</div>
                </div>
              </div>
              <span className="chip text-boom-700">
                <span className="h-1.5 w-1.5 rounded-full bg-boom-500" />
                {ended ? 'resolving…' : `${timeLeft(e.endsAt)} left`}
              </span>
            </div>

            <div className="space-y-2 p-4">
              {!data ? (
                <div className="py-6 text-center text-xs text-mut">Loading options…</div>
              ) : (
                data.options.map((o) => {
                  const isVoted = e.votedOptionId === o.id;
                  const pct = Math.round((o.share || 0) * 100);
                  return (
                    <div key={o.id} className={`relative overflow-hidden rounded-xl border px-3 py-2.5 ${isVoted ? 'border-boom-400 bg-boom-50' : 'border-line'}`}>
                      <div className="absolute inset-y-0 left-0 bg-boom-100/70" style={{ width: `${pct}%` }} />
                      <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Logo image={o.image} symbol={o.symbol} size="h-7 w-7" />
                          <div>
                            <div className="text-sm font-semibold text-fg">${o.symbol || o.token.slice(0, 4)}</div>
                            <div className="text-[11px] text-mut">{pct}% · {o.voters} voters</div>
                          </div>
                        </div>
                        <button
                          onClick={() => vote(e.token, e.cycleId, o.id)}
                          disabled={ended || busy !== null}
                          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${isVoted ? 'bg-boom-500 text-white' : 'border border-line text-fg hover:border-boom-300'}`}
                        >
                          {busy === o.id ? '…' : isVoted ? 'Voted ✓' : 'Vote'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              {data && (
                <p className="pt-1 text-center text-[11px] text-mut">
                  Total weight voting: {compact(Number(data.totalWeight))} · winner becomes the next airdrop reward
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
