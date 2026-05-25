'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import bs58 from 'bs58';
import { claimMessage, rankForXp } from '../../lib/missionConfig';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

function rewardLabel(amount, token) {
  if (token === SOL_MINT) return `${(Number(amount) / 1e9).toFixed(3)} SOL`;
  return `${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(amount))} tokens`;
}

function sinceLabel(iso) {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month' : `${months} months`;
}

const ICONS = { hold: '💎', vote: '🗳️', vote_count: '🔥', customer: '🤝', troll_mode: '🎲', vote_mode: '🗳️' };

function Stat({ label, value, sub }) {
  return (
    <div className="panel p-4">
      <div className="text-xs text-mut">{label}</div>
      <div className="mt-0.5 font-display text-lg font-bold text-fg">{value}</div>
      {sub && <div className="text-[11px] text-mut">{sub}</div>}
    </div>
  );
}

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
      setMsg({ type: 'ok', text: 'Mission complete — XP & reward credited 🪃' });
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
          Hold at least {data?.minHold?.toLocaleString() || '100,000'} $Boomerang, complete missions, earn XP, and claim rewards.
        </p>
        <div className="mt-6 flex justify-center"><WalletMultiButton /></div>
      </div>
    );
  }

  if (!data) return <div className="panel px-6 py-12 text-center text-sm text-mut">Loading your missions…</div>;

  const claimableSol = (data.claimable || []).find((c) => c.token === SOL_MINT);
  const rank = rankForXp(data.totalXp || 0);

  return (
    <div className="space-y-5">
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm ${msg.type === 'ok' ? 'bg-boom-100 text-boom-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Rank + XP hero */}
      <div className="panel-glow overflow-hidden p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-boom-100 text-3xl">{rank.emoji}</div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-boom-600">Level {rank.level} · {rank.name}</div>
              <div className="font-display text-2xl font-bold text-fg">{(data.totalXp || 0).toLocaleString()} XP</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-mut">Missions</div>
            <div className="font-display text-xl font-bold text-fg">{data.missionsDone || 0}/{data.totalMissions || 0}</div>
          </div>
        </div>

        {/* XP progress to next rank */}
        <div className="mt-5">
          <div className="mb-1 flex items-center justify-between text-[11px] text-mut">
            <span>{rank.name}</span>
            <span>{rank.next ? `${rank.toNext} XP to ${rank.next.name} ${rank.next.emoji}` : 'Max rank 👑'}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/5">
            <div className="h-full rounded-full bg-gradient-to-r from-boom-400 to-boom-600 transition-[width] duration-700" style={{ width: `${rank.pct}%` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="$Boomerang held"
          value={data.boomerangBalance === null ? '—' : Math.floor(data.boomerangBalance).toLocaleString()}
          sub={!data.eligible ? `need ${data.minHold.toLocaleString()}` : 'eligible ✓'}
        />
        <Stat label="Holding for" value={sinceLabel(data.firstSeen)} sub="as a member" />
        <Stat label="Total XP" value={(data.totalXp || 0).toLocaleString()} sub={`Level ${rank.level}`} />
        <Stat label="Claimable" value={claimableSol ? rewardLabel(claimableSol.amount, SOL_MINT) : '0.000 SOL'} sub={claimableSol ? `${claimableSol.count} reward(s)` : 'complete missions'} />
      </div>

      {/* Claim banner */}
      {claimableSol && (
        <div className="panel flex items-center justify-between gap-3 border-l-4 border-l-boom-400 p-4">
          <div className="text-sm text-fg">
            You have <span className="font-semibold text-boom-700">{rewardLabel(claimableSol.amount, SOL_MINT)}</span> ready to claim.
          </div>
          <button onClick={claim} disabled={busy !== null} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
            {busy === 'claim' ? '…' : 'Claim now'}
          </button>
        </div>
      )}

      {/* Missions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-fg">Missions</h2>
        <div className="space-y-2">
          {data.missions.map((m) => {
            const done = m.status === 'paid' || m.status === 'claiming';
            const credited = m.status === 'verified';
            return (
              <div key={m.id} className={`panel card-fun flex items-center gap-3 p-4 ${done ? 'opacity-80' : ''}`}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-boom-100 text-xl">
                  {ICONS[m.type] || '🎯'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-fg">{m.title}</span>
                    <span className="rounded-full bg-boom-100 px-1.5 py-0.5 text-[10px] font-bold text-boom-700">+{m.xp} XP</span>
                  </div>
                  <div className="text-xs text-mut">{m.description}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-boom-700">{rewardLabel(m.rewardAmount, m.rewardToken)}</div>
                </div>
                {done ? (
                  <span className="shrink-0 rounded-lg bg-boom-100 px-3 py-1.5 text-xs font-semibold text-boom-700">
                    {m.status === 'paid' ? 'Paid ✓' : 'Claiming…'}
                  </span>
                ) : credited ? (
                  <span className="shrink-0 rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700">Earned · claim</span>
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
      </div>

      <p className="text-center text-[11px] text-mut">
        Rewards paid from the Boomerang treasury after you claim · on-chain missions only (Twitter missions coming soon).
      </p>
    </div>
  );
}
