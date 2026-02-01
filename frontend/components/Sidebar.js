'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/' },
    { name: 'Explore Tokens', icon: '🔍', path: '#features' },
    { name: 'Setup Bot', icon: '🤖', path: 'https://t.me/boomerangtekbot' },
    { name: 'How It Works', icon: '🪃', path: '#how-it-works' },
    { name: 'Documentation', icon: '📚', path: '/docs' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] sidebar-glass z-50 flex flex-col p-6 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="relative w-10 h-10 animate-float">
          <Image 
            src="/logobommerangpng.png" 
            alt="Boomerang Logo" 
            fill 
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            Boomerang
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">v0.8 Alpha</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-4 mb-4">Main Menu</p>
        {menuItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.path}
            className={`nav-link ${pathname === item.path ? 'active' : ''}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Footer Sidebar */}
      <div className="mt-auto pt-6 border-t border-white/20">
        <div className="bg-white/40 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">System Live</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
            Fees are currently being redistributed across 12 active tokens.
          </p>
        </div>
      </div>
    </aside>
  );
}
