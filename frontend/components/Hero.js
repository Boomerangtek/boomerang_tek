'use client';

import { useState, useEffect } from 'react';

export default function Hero() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';
  const telegramUrl = `https://t.me/${botUsername}`;
  
  const [terminalLines, setTerminalLines] = useState([
    { time: '14:32:18', text: 'Boomerang v2.1.0', type: 'info' },
    { time: '14:32:19', text: 'Initializing redistribution protocol...', type: 'info' },
    { time: '14:32:20', text: 'Loading token configurations...', type: 'info' },
    { time: '14:32:21', text: 'Establishing secure connection...', type: 'warning' },
    { time: '14:32:22', text: 'WebSocket handshake complete', type: 'info' },
    { time: '14:32:23', text: 'Subscribing to PumpFun feed...', type: 'info' },
    { time: '14:32:24', text: 'All systems operational', type: 'success' },
    { time: '14:32:25', text: 'Monitoring for opportunities...', type: 'info' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % terminalLines.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [terminalLines.length]);

  return (
    <section className="pt-24 pb-16 px-6 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              LIVE SYSTEM
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Turn PumpFun fees into<br/>
              <span className="text-emerald-400">any token</span> you want
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
              The only bot that lets you select which token to buy and airdrop. 
              Reward your holders with SOL, USDC, or anything else.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <a 
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 text-slate-900 px-8 py-4 rounded-lg font-bold hover:bg-emerald-400 transition inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                Start for free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a 
                href="#features"
                className="px-8 py-4 rounded-lg font-semibold text-slate-400 hover:text-white transition border border-slate-700 hover:border-slate-600"
              >
                Learn more
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <div className="text-2xl font-bold text-emerald-400">127</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Active Bots</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <div className="text-2xl font-bold text-emerald-400">+47%</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Avg Return</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <div className="text-2xl font-bold text-emerald-400">24/7</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right: Live Terminal */}
          <div className="relative">
            {/* Status Badge */}
            <div className="absolute -top-3 left-6 z-10 inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              AI REASONING TERMINAL
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="text-xs text-slate-500 ml-2">@SuperRouterBot</div>
              </div>

              {/* Terminal Content */}
              <div className="p-6 font-mono text-sm space-y-2 h-80 overflow-hidden">
                {terminalLines.map((line, idx) => (
                  <div 
                    key={idx}
                    className={`flex gap-3 transition-opacity duration-300 ${
                      idx <= currentIndex ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    <span className="text-slate-600">[{line.time}]</span>
                    <span className={`flex-1 ${
                      line.type === 'success' ? 'text-emerald-400' :
                      line.type === 'warning' ? 'text-yellow-400' :
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
                  <span className="text-emerald-400">▓</span>
                </div>
              </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -inset-1 bg-emerald-500/20 blur-xl -z-10 opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
