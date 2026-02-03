'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b-4 border-slate-900 shadow-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 animate-wiggle">
              <Image 
                src="/logoboomerang.png" 
                alt="Boomerang" 
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>
            <span className="text-2xl font-black text-slate-900">Boomerang 🪃</span>
          </Link>

          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 text-slate-900 px-4 py-2 rounded-full text-sm font-black border-3 border-slate-900 shadow-lg">
            <span className="text-xl">🟢</span>
            127 BOTS ONLINE!
          </div>

          {/* CTA */}
          <a
            href={`https://t.me/${botUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full text-base font-black hover:scale-110 transition-transform shadow-lg border-3 border-slate-900"
          >
            🚀 Launch Bot
          </a>
        </div>
      </div>
    </nav>
  );
}
