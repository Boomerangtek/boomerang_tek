import Image from 'next/image';

// Ambient spinning boomerangs behind all content. Low opacity so it stays
// subtle/professional. Uses the transparent logo PNG; rotation via Tailwind's
// animate-spin with per-item duration + direction overrides.
const ITEMS = [
  { pos: 'left-[3%] top-[14%]', size: 'h-28 w-28', dur: 26, reverse: false, opacity: 0.14 },
  { pos: 'right-[5%] top-[20%]', size: 'h-44 w-44', dur: 36, reverse: true, opacity: 0.1 },
  { pos: 'left-[10%] top-[58%]', size: 'h-24 w-24', dur: 20, reverse: true, opacity: 0.15 },
  { pos: 'right-[12%] top-[66%]', size: 'h-32 w-32', dur: 30, reverse: false, opacity: 0.12 },
  { pos: 'left-[46%] top-[38%]', size: 'h-52 w-52', dur: 44, reverse: false, opacity: 0.08 },
  { pos: 'right-[38%] top-[88%]', size: 'h-20 w-20', dur: 18, reverse: true, opacity: 0.14 },
  { pos: 'left-[72%] top-[6%]', size: 'h-16 w-16', dur: 15, reverse: false, opacity: 0.15 },
  { pos: 'left-[28%] top-[90%]', size: 'h-28 w-28', dur: 28, reverse: true, opacity: 0.1 },
];

export default function BackgroundBoomerangs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {ITEMS.map((it, i) => (
        <div
          key={i}
          className={`absolute animate-spin ${it.pos} ${it.size}`}
          style={{
            opacity: it.opacity,
            animationDuration: `${it.dur}s`,
            animationDirection: it.reverse ? 'reverse' : 'normal',
            animationTimingFunction: 'linear',
          }}
        >
          <Image src="/newlogopng.png" alt="" fill className="object-contain" />
        </div>
      ))}
    </div>
  );
}
