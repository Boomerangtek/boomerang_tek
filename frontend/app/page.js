import Marquee from '../components/Marquee'
import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import StatsBar from '../components/StatsBar'
import LiveFeed from '../components/LiveFeed'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import Security from '../components/Security'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import Reveal from '../components/Reveal'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Marquee />
      <Navigation />
      <Hero />

      <div className="mx-auto max-w-6xl space-y-20 px-5 py-20">
        <Reveal><StatsBar /></Reveal>
        <Reveal><HowItWorks /></Reveal>
        <div id="live" className="scroll-mt-20 grid items-start gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <div className="eyebrow mb-2">Live</div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              Watch the fees fly back
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mut">
              Tokens linking up and holders getting paid, in real time.
            </p>
          </div>
          <Reveal><LiveFeed /></Reveal>
        </div>
        <Reveal><Features /></Reveal>
        <Reveal><Security /></Reveal>
        <Reveal><FAQ /></Reveal>
        <Reveal><CTA /></Reveal>
      </div>

      <Footer />
    </main>
  )
}
