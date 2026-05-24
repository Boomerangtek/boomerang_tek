'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Arrow, X, Github } from './Icons';
import CopyCA from './CopyCA';

export default function Navigation() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-night-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative h-8 w-8 group-hover:animate-wiggle">
              <Image src="/newlogopng.png" alt="Boomerang" fill className="object-contain" priority />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-fg">Boomerang</span>
          </Link>

          {/* Center nav */}
          <div className="hidden items-center gap-1 md:flex">
            <a href="#how" className="rounded-md px-3 py-1.5 text-sm font-medium text-mut transition hover:text-fg">
              How it works
            </a>
            <a href="#features" className="rounded-md px-3 py-1.5 text-sm font-medium text-mut transition hover:text-fg">
              Features
            </a>
            <a href="#check" className="rounded-md px-3 py-1.5 text-sm font-medium text-mut transition hover:text-fg">
              Check token
            </a>
            <a href="#live" className="rounded-md px-3 py-1.5 text-sm font-medium text-mut transition hover:text-fg">
              Live
            </a>
            <a href="#developers" className="rounded-md px-3 py-1.5 text-sm font-medium text-mut transition hover:text-fg">
              API
            </a>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <CopyCA className="hidden sm:inline-flex" />
            <a
              href="https://x.com/Boomerang_tek"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Boomerang on X"
              className="flex h-8 w-8 items-center justify-center rounded-md text-mut transition hover:text-fg"
            >
              <X className="h-[18px] w-[18px]" />
            </a>
            <a
              href="https://github.com/Boomerangtek/boomerang_tek"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Boomerang on GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-md text-mut transition hover:text-fg"
            >
              <Github className="h-[18px] w-[18px]" />
            </a>
            <a href={`https://t.me/${botUsername}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Launch bot
              <Arrow className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
