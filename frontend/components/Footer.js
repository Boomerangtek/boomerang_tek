export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-6 border-t-4 border-slate-900 mt-8 bg-white/80">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl animate-wiggle">🪃</span>
            <div>
              <p className="text-base font-bold text-slate-900">
                © {currentYear} Boomerang
              </p>
              <p className="text-sm font-semibold text-slate-600">
                Built with 💙 for Solana creators
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-400 to-green-500 text-slate-900 px-4 py-2 rounded-full text-sm font-black border-3 border-slate-900">
              <span className="text-base">✅</span>
              ALL SYSTEMS GO!
            </div>
            <a href="https://docs.birdeye.so" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-600 hover:text-orange-500 transition">
              🦅 Birdeye
            </a>
            <a href="https://jup.ag" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-600 hover:text-blue-500 transition">
              🪐 Jupiter
            </a>
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-600 hover:text-purple-500 transition">
              ◎ Solana
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
