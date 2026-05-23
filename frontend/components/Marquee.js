'use client';

const ITEMS = [
  'Your fees always come back',
  'Claim → Buy → Airdrop or Burn',
  'Paid proportionally to holders',
  'Pick any reward token',
  'Buy back & burn to shrink supply',
  'Runs every 1–60 minutes',
  'Built on Solana',
];

export default function Marquee() {
  const loop = [...ITEMS, ...ITEMS];

  return (
    <div className="relative z-50 overflow-hidden border-b border-boom-200 bg-boom-50">
      <div className="marquee-track py-2">
        {loop.map((item, i) => (
          <span
            key={i}
            className="mx-5 flex items-center gap-5 whitespace-nowrap text-xs font-semibold tracking-wide text-boom-700"
          >
            {item}
            <span className="h-1 w-1 rounded-full bg-boom-500" />
          </span>
        ))}
      </div>
    </div>
  );
}
