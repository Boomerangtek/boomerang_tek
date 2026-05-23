import { Lock, Key, Shield, Pause } from './Icons';

const POINTS = [
  {
    Icon: Lock,
    title: 'AES-256-GCM encryption',
    body: 'Your wallet key is encrypted the moment you send it and stored encrypted at rest. It is only ever decrypted in memory, at execution time.',
    tile: 'bg-boom-100 text-boom-600',
    ring: 'hover:border-boom-300',
  },
  {
    Icon: Key,
    title: 'Use a dedicated wallet',
    body: 'Setup walks you through using a fresh wallet funded only with what the bot needs — never your main holdings.',
    tile: 'bg-sky-100 text-sky-600',
    ring: 'hover:border-sky-300',
  },
  {
    Icon: Shield,
    title: 'Scoped to three actions',
    body: 'The bot only claims fees, swaps via Jupiter, and airdrops to your holders. Nothing else runs against your wallet.',
    tile: 'bg-violet-100 text-violet-600',
    ring: 'hover:border-violet-300',
  },
  {
    Icon: Pause,
    title: 'Pause or stop anytime',
    body: 'Pause, resume, or delete your configuration from Telegram instantly. Deleting removes the bot’s access for good.',
    tile: 'bg-rose-100 text-rose-600',
    ring: 'hover:border-rose-300',
  },
];

export default function Security() {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <div className="eyebrow mb-2">Security</div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Built so your keys stay yours
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mut">
          Boomerang handles a wallet key to automate on-chain actions — so it’s designed
          around least privilege, encryption, and full owner control.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {POINTS.map(({ Icon, title, body, tile, ring }) => (
          <div key={title} className={`panel card-fun p-5 ${ring}`}>
            <span className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tile}`}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <h3 className="text-sm font-semibold text-fg">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mut">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
