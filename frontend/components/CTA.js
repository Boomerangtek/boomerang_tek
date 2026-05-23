import { Arrow } from './Icons';

export default function CTA() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';
  const telegramUrl = `https://t.me/${botUsername}`;

  return (
    <div className="panel-glow flex flex-col items-center justify-between gap-6 px-8 py-10 text-center sm:flex-row sm:text-left">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
          Send your fees back to your community
        </h2>
        <p className="mt-2 text-sm text-mut">
          Set up your bot in under 2 minutes. No code, non-custodial intervals.
        </p>
      </div>
      <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0">
        Launch Boomerang
        <Arrow className="h-4 w-4" />
      </a>
    </div>
  );
}
