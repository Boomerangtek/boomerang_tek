import Image from 'next/image';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-night-950 px-5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7">
            <Image src="/newlogopng.png" alt="Boomerang" fill className="object-contain" />
          </div>
          <span className="text-sm text-mut">
            © {year} Boomerang · Your fees come back
          </span>
        </div>

        <div className="flex items-center gap-5 text-sm text-mut">
          <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="transition hover:text-fg">
            Jupiter
          </a>
          <a href="https://birdeye.so" target="_blank" rel="noopener noreferrer" className="transition hover:text-fg">
            Birdeye
          </a>
          <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="transition hover:text-fg">
            Solana
          </a>
        </div>
      </div>
    </footer>
  );
}
