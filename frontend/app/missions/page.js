import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

export const metadata = { title: 'Missions — coming soon · Boomerang' };

const PREVIEW = [
  { emoji: '💎', title: 'Diamond hands', body: 'Hold tiers from 100K to 5M $Boomerang.' },
  { emoji: '🗳️', title: 'Cast your vote', body: 'Take part in a Community Vote cycle.' },
  { emoji: '🔥', title: 'Active voter', body: 'Vote across multiple cycles.' },
  { emoji: '🤝', title: 'Become a customer', body: 'Link your own token to the bot.' },
  { emoji: '🎲', title: 'Embrace the chaos', body: 'Turn on Troll Mode.' },
  { emoji: '🐦', title: 'Spread the word', body: 'Tweet about Boomerang. (later)' },
];

const RANKS = ['🥚 Rookie', '🪃 Holder', '💎 Diamond', '🐋 Whale', '👑 Legend'];

export default function MissionsPage() {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-6">
          <span className="chip mb-3 text-boom-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-boom-500" />
            Coming soon
          </span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
            Earn from holding 🪃🎯
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-mut">
            Holding won&apos;t be passive anymore. Complete missions, earn <span className="font-semibold text-fg">XP</span>,
            level up, and claim rewards straight to your wallet — gasless. And soon, every project on Boomerang will be
            able to run missions for their own holders.
          </p>
        </div>

        {/* Rank ladder teaser */}
        <div className="panel-glow mb-6 p-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-boom-600">Climb the ranks</div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            {RANKS.map((r, i) => (
              <span key={r} className="flex items-center gap-2">
                <span className="rounded-full border border-line bg-white px-3 py-1 text-fg shadow-soft">{r}</span>
                {i < RANKS.length - 1 && <span className="text-mut">→</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Mission previews (locked) */}
        <div className="grid gap-3 sm:grid-cols-2">
          {PREVIEW.map((m) => (
            <div key={m.title} className="panel relative flex items-center gap-3 p-4 opacity-90">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-boom-100 text-xl">{m.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-fg">{m.title}</div>
                <div className="text-xs text-mut">{m.body}</div>
              </div>
              <span className="shrink-0 text-mut" title="Coming soon">🔒</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-mut">
          Missions drop soon. Hold <span className="font-semibold text-fg">$Boomerang</span> to be ready. 🪃
        </p>
      </main>
      <Footer />
    </>
  );
}
