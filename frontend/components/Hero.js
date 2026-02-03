'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Hero() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';
  const telegramUrl = `https://t.me/${botUsername}`;
  
  const [terminalLines, setTerminalLines] = useState([
    { time: '14:32:18', text: 'Boomerang v2.1.0 🚀', type: 'info' },
    { time: '14:32:19', text: 'Initializing redistribution... ⚙️', type: 'info' },
    { time: '14:32:20', text: 'Loading configurations... 📦', type: 'info' },
    { time: '14:32:21', text: 'Establishing connection... ⚡', type: 'warning' },
    { time: '14:32:22', text: 'WebSocket handshake complete ✓', type: 'success' },
    { time: '14:32:23', text: 'Monitoring opportunities... 👀', type: 'info' },
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

  const CircularProgress = ({ value, max = 100, size = 100, strokeWidth = 8, color = "orange" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    const colorClass = color === "orange" ? "text-orange-500" : 
                      color === "blue" ? "text-blue-500" : 
                      color === "green" ? "text-green-500" : "text-purple-500";

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
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
          className={`${colorClass} transition-all duration-300`}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <section className="pt-20 pb-6 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-lg animate-bounce-fun border-3 border-slate-900">
            <span className="text-xl">🔥</span>
            LIVE SYSTEM ONLINE!
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-3 drop-shadow-lg">
            Turn PumpFun fees into <br/>
            <span className="text-orange-500 drop-shadow-lg">ANY token you want!</span>
          </h1>
          <p className="text-slate-700 text-xl max-w-2xl mx-auto mb-6 font-semibold">
            🎯 The only bot that lets you pick the reward token
          </p>
          <a 
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-full font-black text-lg hover:scale-110 transition-transform shadow-2xl border-4 border-slate-900 animate-wiggle"
          >
            <span className="text-2xl">🚀</span>
            Start FREE Now!
            <span className="text-2xl">🎉</span>
          </a>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stats Cards */}
          <div className="space-y-4">
            {/* Progress Card */}
            <div className="cartoon-card p-6 bg-gradient-to-br from-purple-400 to-purple-500">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-purple-900 uppercase tracking-wider mb-1 font-black">🎯 AI Training</div>
                  <div className="text-3xl font-black text-white">Session #41</div>
                </div>
                <div className="relative">
                  <CircularProgress value={41} color="purple" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-black text-white">41%</div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-purple-900 font-bold">⏰ Next: 01:46:24</div>
            </div>

            {/* Active Bots */}
            <div className="cartoon-card-alt p-6 animate-float-slow">
              <div className="text-sm text-orange-900 uppercase tracking-wider mb-2 font-black">🤖 Active Bots</div>
              <div className="text-5xl font-black text-white mb-2">{stats.activeBots}</div>
              <div className="flex items-center gap-2 text-yellow-200 text-sm font-bold">
                <span className="text-xl">📈</span>
                <span>+12% this week!</span>
              </div>
            </div>

            {/* Today's Performance */}
            <div className="cartoon-card p-6 bg-gradient-to-br from-green-400 to-green-500">
              <div className="text-sm text-green-900 uppercase tracking-wider mb-2 font-black">💰 Today</div>
              <div className="text-3xl font-black text-white mb-1">{stats.totalExecutions} trades</div>
              <div className="text-xs text-green-900 mb-2 font-bold">Avg Profit & Loss</div>
              <div className="text-5xl font-black text-white">+{stats.avgReturn}%</div>
            </div>

            {/* Total Volume */}
            <div className="cartoon-card p-6 bg-gradient-to-br from-blue-400 to-blue-500">
              <div className="text-sm text-blue-900 uppercase tracking-wider mb-2 font-black">💎 Total Volume</div>
              <div className="text-4xl font-black text-white">{stats.solClaimed} <span className="text-2xl">SOL</span></div>
              <div className="text-sm text-blue-900 mt-2 font-bold">✨ Claimed & redistributed</div>
            </div>
          </div>

          {/* Center: Live Terminal */}
          <div className="lg:col-span-2">
            <div className="cartoon-card bg-slate-900 overflow-hidden shadow-2xl h-full">
              {/* Terminal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 flex items-center justify-between border-b-4 border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-slate-900"></div>
                    <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-slate-900"></div>
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900"></div>
                  </div>
                  <div className="text-sm text-white font-black">🖥️ Boomerang Terminal</div>
                </div>
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-xs font-black border-2 border-slate-900 animate-pulse">
                  <span className="text-base">⚡</span>
                  LIVE
                </div>
              </div>

              {/* Terminal Content */}
              <div className="p-6 font-mono text-base space-y-2 h-[500px] overflow-hidden bg-slate-900">
                {terminalLines.map((line, idx) => (
                  <div 
                    key={idx}
                    className={`flex gap-3 transition-opacity duration-300 ${
                      idx <= currentIndex ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    <span className="text-green-400 font-bold">[{line.time}]</span>
                    <span className={`flex-1 font-bold ${
                      line.type === 'success' ? 'text-green-400' :
                      line.type === 'warning' ? 'text-yellow-400' :
                      'text-cyan-400'
                    }`}>
                      {line.text}
                    </span>
                  </div>
                ))}
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold">[LIVE]</span>
                  <span className="text-green-400 animate-pulse font-bold">▓</span>
                </div>

                {/* Quick Features */}
                <div className="pt-6 mt-6 border-t-4 border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-4 rounded-2xl border-3 border-slate-900 transform hover:scale-105 transition">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="text-sm font-black text-slate-900">Choose ANY token</div>
                      <div className="text-xs font-bold text-orange-900">SOL, USDC, or anything!</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-4 rounded-2xl border-3 border-slate-900 transform hover:scale-105 transition">
                      <div className="text-3xl mb-2">💰</div>
                      <div className="text-sm font-black text-slate-900">Auto fee claiming</div>
                      <div className="text-xs font-bold text-blue-900">24/7 monitoring</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-400 to-green-500 p-4 rounded-2xl border-3 border-slate-900 transform hover:scale-105 transition">
                      <div className="text-3xl mb-2">🔄</div>
                      <div className="text-sm font-black text-slate-900">Best swap rates</div>
                      <div className="text-xs font-bold text-green-900">Jupiter integration</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-4 rounded-2xl border-3 border-slate-900 transform hover:scale-105 transition">
                      <div className="text-3xl mb-2">🔐</div>
                      <div className="text-sm font-black text-slate-900">Secure by default</div>
                      <div className="text-xs font-bold text-purple-900">AES-256 encryption</div>
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
