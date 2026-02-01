export default function Hero() {
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot';
  const telegramUrl = `https://t.me/${botUsername}`;

  return (
    <section className="pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 animate-fade-up">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
          Choose any token as reward
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight animate-fade-up delay-100">
          Turn PumpFun fees into<br/>
          <span className="text-orange-500">any token</span> you want
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
          The only bot that lets you select which token to buy and airdrop. 
          Reward your holders with SOL, USDC, or anything else.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-up delay-300">
          <a 
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-800 transition inline-flex items-center gap-2 shadow-lg shadow-slate-900/10"
          >
            Start for free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a 
            href="#how-it-works"
            className="px-8 py-4 rounded-full font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            See how it works
          </a>
        </div>

        {/* Simple visual indicator */}
        <div className="max-w-3xl mx-auto animate-fade-up delay-400">
          <div className="bg-gradient-to-br from-slate-50 to-orange-50 rounded-3xl p-12 border border-slate-200">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl mb-3">💰</div>
                <div className="text-sm font-semibold text-slate-900 mb-1">Claim fees</div>
                <div className="text-xs text-slate-500">Automatically</div>
              </div>
              <div>
                <div className="text-4xl mb-3">🎯</div>
                <div className="text-sm font-semibold text-slate-900 mb-1">Pick token</div>
                <div className="text-xs text-slate-500">Your choice</div>
              </div>
              <div>
                <div className="text-4xl mb-3">🎁</div>
                <div className="text-sm font-semibold text-slate-900 mb-1">Airdrop</div>
                <div className="text-xs text-slate-500">To holders</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
