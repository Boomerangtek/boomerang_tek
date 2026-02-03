'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image 
                src="/logoboomerang.png" 
                alt="Boomerang" 
                fill
                className="object-contain"
              />
            </div>
            <span className="text-lg font-bold text-white">Boomerang</span>
          </Link>

          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/20">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
            127 ACTIVE BOTS
          </div>

          {/* CTA */}
          <a
            href={`https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/20"
          >
            Launch Bot
          </a>
        </div>
      </div>
    </nav>
  );
}
