'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-[var(--sidebar-width)] h-20 header-glass z-40 flex items-center px-8 justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 md:hidden">
          <Image 
            src="/logobommerangpng.png" 
            alt="Logo" 
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Search token address..." 
            className="bg-white/50 border border-white/40 rounded-full py-2 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-orange-400/50 w-80 transition-all text-sm"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg grayscale group-focus-within:grayscale-0 transition-all">🔍</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-full border border-white/40">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Solana Mainnet</span>
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
        </div>
        
        <Link 
          href="https://t.me/boomerangtekbot"
          target="_blank"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-orange-500/20 hover:scale-105 transition-all text-sm"
        >
          Connect Wallet
        </Link>
      </div>
    </header>
  );
}
