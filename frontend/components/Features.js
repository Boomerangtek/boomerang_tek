export default function Features() {
  const features = [
    {
      icon: '🎯',
      title: 'Choose your reward token',
      description: 'Pick any Solana token to buy and airdrop — SOL, USDC, or anything else. No other bot gives you this control.',
      highlight: true
    },
    {
      icon: '💰',
      title: 'Automatic fee collection',
      description: 'Monitors and claims your PumpFun volume fees 24/7 on your custom schedule.',
    },
    {
      icon: '🔄',
      title: 'Best swap rates',
      description: 'Jupiter Aggregator integration ensures optimal token swap prices every time.',
    },
    {
      icon: '🎁',
      title: 'Fair distribution',
      description: 'Proportional airdrops calculated based on each holder\'s token balance.',
    },
    {
      icon: '📊',
      title: 'Transparent tracking',
      description: 'Every token gets a public dashboard showing all distributions and stats.',
    },
    {
      icon: '🔐',
      title: 'Secure by default',
      description: 'AES-256 encryption protects your private keys. Military-grade security.',
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Professional-grade automation for token creators who care about their community
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`rounded-xl p-8 border transition-all hover:scale-105 ${
                feature.highlight 
                  ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30' 
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className={`text-lg font-semibold mb-3 ${
                feature.highlight ? 'text-emerald-400' : 'text-white'
              }`}>
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>
              {feature.highlight && (
                <div className="mt-4 inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  UNIQUE FEATURE
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
