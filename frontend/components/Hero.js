'use client';

import { useState, useEffect } from 'react';

export default function Hero() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';
  const telegramUrl = `https://t.me/${botUsername}`;
  
  const [terminalLines, setTerminalLines] = useState([
    { time: '14:32:18', text: 'Boomerang v2.1.0', type: 'info' },
    { time: '14:32:19', text: 'Initializing redistribution...', type: 'info' },
    { time: '14:32:20', text: 'Loading configurations...', type: 'info' },
    { time: '14:32:21', text: 'Establishing connection...', type: 'warning' },
    { time: '14:32:22', text: 'WebSocket handshake complete', type: 'success' },
    { time: '14:32:23', text: 'Monitoring opportunities...', type: 'info' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats] = useState({
    activeBots: 127,
    avgReturn: 47,
    totalExecutions: 1847,
    solClaimed: '245.8'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % terminalLines.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [terminalLines.length]);

  const CircularProgress = ({ value, max = 100, size = 100, strokeWidth = 6 }) => {
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
          className="text-orange-500 transition-all duration-300"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <section className="pt-20 pb-6 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-orange-500/20">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
            LIVE SYSTEM
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Turn PumpFun fees into <span className="text-orange-500">any token</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mb-4">
            The only bot that lets you select which token to buy and airdrop
          </p>
          <a 
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-lg font-bold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/20"
          >
            Start for free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Stats Cards */}
          <div className="space-y-4">
            {/* Progress Card */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">AI Training</div>
                  <div className="text-2xl font-bold text-orange-400">Session #41</div>
                </div>
                <div className="relative">
                  <CircularProgress value={41} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-xl font-bold text-orange-400">41%</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500">Next session: 01:46:24</div>
            </div>

            {/* Active Bots */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Active Bots</div>
              <div className="text-3xl font-bold text-white mb-1">{stats.activeBots}</div>
              <div className="flex items-center gap-2 text-sky-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>+12% this week</span>
              </div>
            </div>

            {/* Today's Performance */}
            <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 backdrop-blur">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Today</div>
              <div className="text-2xl font-bold text-white mb-1">{stats.totalExecutions} trades</div>
              <div className="text-xs text-slate-500 mb-2">Avg P&L</div>
              <div className="text-3xl font-bold text-orange-500">+{stats.avgReturn}%</div>
            </div>

            {/* Total Volume */}
            <div className="bg-gradient-to-br from-orange-500/10 to-sky-500/10 rounded-xl p-5 border border-orange-500/20 backdrop-blur">
              <div className="text-xs text-orange-400 uppercase tracking-wider mb-2">Total Volume</div>
              <div className="text-3xl font-bold text-white">{stats.solClaimed} <span className="text-xl text-slate-400">SOL</span></div>
              <div className="text-xs text-slate-400 mt-1">Claimed & redistributed</div>
            </div>
          </div>

          {/* Center: Live Terminal */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl h-full backdrop-blur">
              {/* Terminal Header */}
              <div className="bg-slate-800/80 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-sky-500/80"></div>
                  </div>
                  <div className="text-xs text-slate-400">Boomerang Terminal</div>
                </div>
                <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-2 py-1 rounded text-xs font-bold">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
                  LIVE
                </div>
              </div>

              {/* Terminal Content */}
              <div className="p-5 font-mono text-sm space-y-2 h-[500px] overflow-hidden">
                {terminalLines.map((line, idx) => (
                  <div 
                    key={idx}
                    className={`flex gap-3 transition-opacity duration-300 ${
                      idx <= currentIndex ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    <span className="text-slate-600">[{line.time}]</span>
                    <span className={`flex-1 ${
                      line.type === 'success' ? 'text-sky-400' :
                      line.type === 'warning' ? 'text-orange-400' :
                      'text-slate-400'
                    }`}>
                      {line.type === 'success' && '✓ '}
                      {line.type === 'warning' && '⚡ '}
                      {line.type === 'info' && '○ '}
                      {line.text}
                    </span>
                  </div>
                ))}
                <div className="flex gap-3">
                  <span className="text-slate-600">[LIVE]</span>
                  <span className="text-orange-400">▓</span>
                </div>

                {/* Quick Features */}
                <div className="pt-6 mt-6 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400 text-lg">🎯</span>
                      <div>
                        <div className="text-xs font-bold text-white">Choose ANY token</div>
                        <div className="text-xs text-slate-500">SOL, USDC, or anything</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sky-400 text-lg">💰</span>
                      <div>
                        <div className="text-xs font-bold text-white">Auto fee claiming</div>
                        <div className="text-xs text-slate-500">24/7 monitoring</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-orange-400 text-lg">🔄</span>
                      <div>
                        <div className="text-xs font-bold text-white">Best swap rates</div>
                        <div className="text-xs text-slate-500">Jupiter integration</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sky-400 text-lg">🔐</span>
                      <div>
                        <div className="text-xs font-bold text-white">Secure by default</div>
                        <div className="text-xs text-slate-500">AES-256 encryption</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
