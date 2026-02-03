export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Connect & configure',
      description: 'Message the Telegram bot, connect your wallet, and choose which token you want to use as rewards.',
      icon: '⚙️'
    },
    {
      number: '02',
      title: 'Automated execution',
      description: 'The bot claims your PumpFun fees, swaps for your chosen token, and calculates holder distributions.',
      icon: '🔄'
    },
    {
      number: '03',
      title: 'Transparent airdrops',
      description: 'Tokens are airdropped proportionally to holders. Everything tracked on your public dashboard.',
      icon: '✅'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Set up in minutes, run automatically forever
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 h-full hover:border-emerald-500/50 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                    {step.number}
                  </div>
                  <div className="text-3xl">{step.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a 
            href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 text-slate-900 px-8 py-4 rounded-lg font-bold hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            Start for free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <p className="text-sm text-slate-500 mt-4">No credit card required · 2 minute setup</p>
        </div>
      </div>
    </section>
  )
}
