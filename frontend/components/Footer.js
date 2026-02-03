export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-6 border-t border-slate-800/50 mt-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xl">🪃</span>
            <div>
              <p className="text-sm text-slate-400">
                © {currentYear} Boomerang. Built for Solana creators.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/20">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></span>
              OPERATIONAL
            </div>
            <a href="https://docs.birdeye.so" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-orange-400 transition">
              Birdeye API
            </a>
            <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-orange-400 transition">
              Jupiter
            </a>
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-sky-400 transition">
              Solana
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
