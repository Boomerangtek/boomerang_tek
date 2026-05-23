import { Coins, Swap, Gift } from './Icons';

const STEPS = [
  { n: '01', Icon: Coins, title: 'Claim your fees', body: 'Boomerang watches your PumpFun creator vault and auto-claims accrued SOL fees on the schedule you set.', tile: 'bg-boom-100 text-boom-600', ring: 'hover:border-boom-300' },
  { n: '02', Icon: Swap, title: 'Buy any token', body: 'It swaps that SOL into the token you pick — your coin, SOL, USDC, anything — at Jupiter best price.', tile: 'bg-sky-100 text-sky-600', ring: 'hover:border-sky-300' },
  { n: '03', Icon: Gift, title: 'Airdrop or burn', body: 'Send the tokens to your holders proportionally — or burn them to shrink supply. Your call, every run.', tile: 'bg-amber-100 text-amber-600', ring: 'hover:border-amber-300' },
];

export default function HowItWorks() {
  return (
    <div id="how" className="scroll-mt-20">
      <div className="mb-8">
        <div className="eyebrow mb-2">How it works</div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Three steps, fully automated
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {STEPS.map(({ n, Icon, title, body, tile, ring }) => (
          <div key={n} className={`panel card-fun p-6 ${ring}`}>
            <div className="mb-4 flex items-center justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tile}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl font-bold text-night-800">{n}</span>
            </div>
            <h3 className="text-base font-semibold text-fg">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mut">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
