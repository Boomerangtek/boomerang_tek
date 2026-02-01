export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Connect & configure',
      description: 'Message the Telegram bot, connect your wallet, and choose which token you want to use as rewards.'
    },
    {
      number: '02',
      title: 'Automated execution',
      description: 'The bot claims your PumpFun fees, swaps for your chosen token, and calculates holder distributions.'
    },
    {
      number: '03',
      title: 'Transparent airdrops',
      description: 'Tokens are airdropped proportionally to holders. Everything tracked on your public dashboard.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Set up in minutes, run automatically forever
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-lg mb-6">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a 
            href={`https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME || 'boomerangtekbot'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-900/10"
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
