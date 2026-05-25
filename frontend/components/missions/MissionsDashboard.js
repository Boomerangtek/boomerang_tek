'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import bs58 from 'bs58';
import { claimMessage } from '../../lib/missionConfig';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

function rewardLabel(amount, token) {
  if (token === SOL_MINT) return `${(Number(amount) / 1e9).toFixed(3)} SOL`;
  return `${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(amount))} tokens`;
}

const ICONS = { hold: '💎', vote: '🗳️', vote_count: '🔥', customer: '🤝', troll_mode: '🎲', vote_mode: '🗳️' };

export default function MissionsDashboard() {
  const { publicKey, signMessage, connected } = useWallet();
  const wallet = publicKey?.toBase58();

  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    const url = wallet ? `/api/missions?wallet=${wallet}` : '/api/missions';
    try {
      const res = await fetch(url, { cache: 'no-store' });
      setData(await res.json());
    } catch {
      setData({ missions: [] });
    }
  }, [wallet]);

  useEffect(() => {
    load();
  }, [load]);

  async function complete(missionId) {
    setBusy(missionId);
    setMsg(null);
    try {
      const res = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, wallet }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed');
      setMsg({ type: 'ok', text: 'Mission complete — reward credited 🪃' });
      await load();
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setBusy(null);
    }
  }

  async function claim() {
    if (!signMessage || !wallet) return;
    setBusy('claim');
    setMsg(null);
    try {
      const signature = bs58.encode(await signMessage(new TextEncoder().encode(claimMessage(wallet))));
      const res = await fetch('/api/missions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, signature }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Claim failed');
      setMsg({ type: 'ok', text: 'Claim submitted — rewards are on their way 🪃' });
      await load();
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setBusy(null);
    }
  }

  if (!connected) {
    return (
      <div className="panel mx-auto max-w-md px-6 py-10 text-center">
        <div className="text-3xl">🪃🎯</div>
        <h2 className="mt-3 font-display text-xl font-bold text-fg">Connect to start missions</h2>
        <p className="mt-2 text-sm text-mut">
          Hold at least {data?.minHold?.toLocaleString() || '100,000'} $Boomerang, complete missions, and claim rewards.
        </p>
        <div className="mt-6 flex justify-center"><WalletMultiButton /></div>
      </div>
    );
  }

  if (!data) return <div className="panel px-6 py-12 text-center text-sm text-mut">Loading missions…</div>;

  const claimableSol = (data.claimable || []).find((c) => c.token === SOL_MINT);

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm ${msg.type === 'ok' ? 'bg-boom-100 text-boom-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Eligibility + claim */}
      <div className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs text-mut">Your $Boomerang</div>
          <div className="font-display text-lg font-bold text-fg">
            {data.boomerangBalance === null ? '—' : Math.floor(data.boomerangBalance).toLocaleString()}
            {!data.eligible && (
              <span className="ml-2 text-xs font-medium text-red-600">
                need {data.minHold.toLocaleString()} to earn
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-mut">Claimable</div>
            <div className="font-display text-lg font-bold text-boom-700">
              {claimableSol ? rewardLabel(claimableSol.amount, SOL_MINT) : '0.000 SOL'}
            </div>
          </div>
          <button
            onClick={claim}
            disabled={!claimableSol || busy !== null}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            {busy === 'claim' ? '…' : 'Claim'}
          </button>
        </div>
      </div>

      {/* Missions */}
      <div className="space-y-2">
        {data.missions.map((m) => {
          const done = m.status === 'paid' || m.status === 'claiming';
          const credited = m.status === 'verified';
          return (
            <div key={m.id} className="panel flex items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-boom-100 text-lg">
                {ICONS[m.type] || '🎯'}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-fg">{m.title}</div>
                <div className="text-xs text-mut">{m.description}</div>
                <div className="mt-0.5 text-[11px] font-medium text-boom-700">
                  Reward: {rewardLabel(m.rewardAmount, m.rewardToken)}
                </div>
              </div>
              {done ? (
                <span className="shrink-0 rounded-lg bg-boom-100 px-3 py-1.5 text-xs font-semibold text-boom-700">
                  {m.status === 'paid' ? 'Paid ✓' : 'Claiming…'}
                </span>
              ) : credited ? (
                <span className="shrink-0 rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700">
                  Earned · claim it
                </span>
              ) : (
                <button
                  onClick={() => complete(m.id)}
                  disabled={!data.eligible || busy !== null}
                  className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-fg transition hover:border-boom-300 disabled:opacity-50"
                >
                  {busy === m.id ? '…' : 'Verify'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-mut">
        Rewards are paid from the Boomerang treasury after you claim. On-chain missions only (Twitter missions coming soon).
      </p>
    </div>
  );
}
