'use client';

import Link from 'next/link';

export default function Navigation() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🪃</span>
            <span className="text-xl font-bold text-white">Boomerang</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition">
              How it works
            </a>
          </div>

          {/* CTA */}
          <a
            href={`https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 text-slate-900 px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
