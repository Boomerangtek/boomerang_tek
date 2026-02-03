export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 px-6 border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🪃</span>
              <h3 className="text-xl font-bold text-white">Boomerang</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Turn PumpFun fees into any token you want. Built for Solana creators.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              SYSTEM OPERATIONAL
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-sm text-slate-400 hover:text-emerald-400 transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-slate-400 hover:text-emerald-400 transition">
                  How it works
                </a>
              </li>
              <li>
                <a href="https://docs.birdeye.so" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-emerald-400 transition">
                  Birdeye API
                </a>
              </li>
              <li>
                <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-emerald-400 transition">
                  Jupiter
                </a>
              </li>
            </ul>
          </div>
          
          {/* Tech Stack */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Built with</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">Solana</span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">Jupiter</span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">Pump SDK</span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium border border-slate-700">Telegram</span>
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} Boomerang. Built for Solana creators.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-emerald-400 transition">
              Powered by Solana
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
