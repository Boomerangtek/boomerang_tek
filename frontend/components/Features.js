export default function Features() {
  const features = [
    {
      title: 'Choose your reward token',
      description: 'Pick any Solana token to buy and airdrop — SOL, USDC, or anything else. No other bot gives you this control.',
    },
    {
      title: 'Automatic fee collection',
      description: 'Monitors and claims your PumpFun volume fees 24/7 on your custom schedule.',
    },
    {
      title: 'Best swap rates',
      description: 'Jupiter Aggregator integration ensures optimal token swap prices every time.',
    },
    {
      title: 'Fair distribution',
      description: 'Proportional airdrops calculated based on each holder\'s token balance.',
    },
    {
      title: 'Transparent tracking',
      description: 'Every token gets a public dashboard showing all distributions and stats.',
    },
    {
      title: 'Secure by default',
      description: 'AES-256 encryption protects your private keys. Military-grade security.',
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional-grade automation for token creators who care about their community
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 transition">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
