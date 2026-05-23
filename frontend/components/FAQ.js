'use client';

import { useState } from 'react';

const ITEMS = [
  {
    q: 'Are my funds safe?',
    a: 'Your private key is encrypted with AES-256-GCM and only decrypted in memory when a run executes. We strongly recommend a dedicated wallet funded only with what the bot needs — never your main holdings.',
  },
  {
    q: 'What can the bot actually do with my wallet?',
    a: 'Only three things: claim your PumpFun creator fees, swap that SOL into your chosen token via Jupiter, and airdrop it to your holders. It never moves funds anywhere else.',
  },
  {
    q: 'Which token gets airdropped?',
    a: 'Any SPL token you choose — your own coin, SOL, USDC, or anything tradable on Jupiter. You set the source token (whose holders get paid) and the reward token separately.',
  },
  {
    q: 'How often does it run?',
    a: 'You pick the interval during setup: every 1, 2, 5, 10, 30 or 60 minutes. Each connected token runs on its own schedule.',
  },
  {
    q: 'How is the airdrop split?',
    a: 'Proportionally to each holder’s balance of your source token at execution time. The more they hold, the larger their share.',
  },
  {
    q: 'Can I stop it?',
    a: 'Yes — pause, resume, or delete your configuration from Telegram at any time. Deleting the config removes the bot’s access entirely.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[0.7fr_1.3fr]">
      <div>
        <div className="eyebrow mb-2">FAQ</div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Questions, answered
        </h2>
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-night-900/70">
        {ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-fg">{item.q}</span>
                <span
                  className={`shrink-0 text-boom-600 transition-transform ${isOpen ? 'rotate-45' : ''}`}
                  aria-hidden
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed text-mut">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
