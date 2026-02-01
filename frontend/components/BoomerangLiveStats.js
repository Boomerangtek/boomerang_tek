'use client';

import { useEffect, useState } from 'react';

export default function BoomerangLiveStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/boomerang-stats`);
        const json = await res.json();
        if (!json.error) {
          setData(json);
        }
      } catch (e) {
        console.error('Failed to fetch Boomerang stats:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return null;

  return (
    <section className="py-12">
      <div className="max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Official <span className="text-orange-600">Boomerang</span> Token
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Live performance & transparency</p>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Live Updates
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Metrics */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 border-white/60 bg-gradient-to-br from-white/80 to-orange-50/30">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Market Cap</p>
              <p className="text-5xl font-black text-slate-900 mb-2">
                ${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(data.marketData.marketCap || 0)}
              </p>
              <p className="text-sm font-bold text-orange-600 uppercase tracking-tighter">
                Price: ${data.marketData.price?.toFixed(8) || '0.00...'}
              </p>
            </div>

            <div className="glass-card p-8 border-white/60 bg-gradient-to-br from-white/80 to-blue-50/30">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fees Collected</p>
              <p className="text-5xl font-black text-green-600 mb-2">
                +{(Number(data.stats.totalSolClaimed) / 1e9).toFixed(2)} <span className="text-2xl text-slate-400">SOL</span>
              </p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">
                {data.stats.totalExecutions} Distributions completed
              </p>
            </div>
          </div>

          {/* Live Airdrop Feed */}
          <div className="glass-card p-6 border-white/60 flex flex-col h-full">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
              Recent Airdrops
            </h3>
            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
              {data.recentAirdrops.map((drop) => (
                <div key={drop.id} className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/60">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Amount</p>
                    <p className="text-sm font-black text-blue-600">
                      {new Intl.NumberFormat('en-US').format(drop.amount)} tokens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {new Date(drop.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                      {drop.holders} Holders
                    </p>
                  </div>
                </div>
              ))}
              {data.recentAirdrops.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waiting for first drop...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
