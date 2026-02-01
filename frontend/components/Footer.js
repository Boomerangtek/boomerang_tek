export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 px-6 border-t border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🪃</span>
              <h3 className="text-xl font-bold text-slate-900">Boomerang</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Turn PumpFun fees into any token you want. Built for Solana creators.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm text-slate-600 hover:text-slate-900 transition">
                  How it works
                </a>
              </li>
              <li>
                <a href="https://docs.birdeye.so" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
                  Birdeye API
                </a>
              </li>
              <li>
                <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
                  Jupiter
                </a>
              </li>
            </ul>
          </div>
          
          {/* Tech Stack */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm">Built with</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Solana</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Jupiter</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Pump SDK</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Telegram</span>
            </div>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-600">
            © {currentYear} Boomerang. Built for Solana creators.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Powered by Solana
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
