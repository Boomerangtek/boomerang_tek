import { Target, Flame, Clock, Lock, Chart } from './Icons';

const FEATURES = [
  { Icon: Target, title: 'Pick the reward token', body: 'Choose exactly what holders receive — not just the native coin.', tile: 'bg-boom-100 text-boom-600', ring: 'hover:border-boom-300' },
  { emoji: '🎲', title: 'Troll Mode', body: 'Randomize the reward every cycle — USDC, SOL, $TROLL, a surprise ticker. They get paid. They get trolled.', tile: 'bg-purple-100 text-purple-600', ring: 'hover:border-purple-300' },
  { emoji: '🗳️', title: 'Community Vote', body: 'Let holders vote on the next reward. Weighted by their holdings — winner gets airdropped.', tile: 'bg-sky-100 text-sky-600', ring: 'hover:border-sky-300' },
  { Icon: Flame, title: 'Buy back & burn', body: 'Send the fees back to your token and burn it — shrink supply on every run.', tile: 'bg-orange-100 text-orange-600', ring: 'hover:border-orange-300' },
  { Icon: Clock, title: 'Set & forget intervals', body: 'Runs every 1, 2, 5, 10, 30 or 60 minutes, 24/7.', tile: 'bg-emerald-100 text-emerald-600', ring: 'hover:border-emerald-300' },
  { Icon: Lock, title: 'AES-256 encrypted keys', body: 'Wallet keys encrypted at rest, decrypted in memory only.', tile: 'bg-violet-100 text-violet-600', ring: 'hover:border-violet-300' },
  { Icon: Chart, title: 'Public dashboard', body: 'Every token gets a live, shareable transparency page.', tile: 'bg-rose-100 text-rose-600', ring: 'hover:border-rose-300' },
];

export default function Features() {
  return (
    <div id="features" className="scroll-mt-20">
      <div className="mb-8">
        <div className="eyebrow mb-2">Why creators use it</div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          More than a buyback bot
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ Icon, emoji, title, body, tile, ring }) => (
          <div key={title} className={`panel card-fun p-5 ${ring}`}>
            <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg ${tile}`}>
              {emoji ? emoji : <Icon className="h-5 w-5" />}
            </span>
            <h3 className="text-sm font-semibold text-fg">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mut">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
