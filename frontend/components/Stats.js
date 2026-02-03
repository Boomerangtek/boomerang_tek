'use client';

import { useEffect, useState } from 'react';

export default function Stats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeConfigs: 0,
    totalExecutions: 0,
    totalSolClaimed: '0.00'
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    fetch(`${apiUrl}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch stats:', err));

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => (prev + 1) % 100);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  const CircularProgress = ({ value, max = 100, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-emerald-500 transition-all duration-300"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <section className="py-20 px-6 bg-slate-900 border-y border-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20 mb-4">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            ACTIVE TRAINING
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Real-time Performance
          </h2>
          <p className="text-slate-400">Live statistics from the network</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* AI Training Progress */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <CircularProgress value={41} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-emerald-400">41%</div>
                  <div className="text-xs text-slate-500">PROGRESS</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-300 mb-1">AI Training</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider">Session in progress</div>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Users</div>
                <div className="text-4xl font-bold text-emerald-400 mb-2">{stats.totalUsers}</div>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+12% this week</span>
              </div>
            </div>
          </div>

          {/* Active Bots */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Active Bots</div>
                <div className="text-4xl font-bold text-emerald-400 mb-2">{stats.activeConfigs}</div>
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20 w-fit">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                LIVE
              </div>
            </div>
          </div>

          {/* Today's Stats */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Today</div>
                <div className="text-2xl font-bold text-white mb-1">{stats.totalExecutions} trades</div>
                <div className="text-xs text-slate-500 mb-2">AVG P&L</div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">+47%</div>
            </div>
          </div>
        </div>

        {/* Next Session Countdown */}
        <div className="mt-6 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-slate-500 text-sm uppercase tracking-wider">Next Session</div>
              <div className="font-mono text-2xl font-bold text-emerald-400">01 : 46 : 24</div>
            </div>
            <div className="text-slate-500 text-sm">{stats.totalSolClaimed} SOL claimed total</div>
          </div>
        </div>
      </div>
    </section>
  )
}
