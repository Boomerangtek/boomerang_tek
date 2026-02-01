import Navigation from '../components/Navigation'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Stats from '../components/Stats'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  )
}
