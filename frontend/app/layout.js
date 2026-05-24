import './globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import BackgroundBoomerangs from '../components/BackgroundBoomerangs'
import PartnershipToast from '../components/PartnershipToast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-grotesk',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://boomerang.bot'
const DESCRIPTION =
  'Boomerang auto-claims your PumpFun creator fees, buys any token you choose, and airdrops it proportionally to your holders.'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Boomerang — Your fees come back',
  description: DESCRIPTION,
  keywords: 'solana, pumpfun, telegram bot, airdrop, crypto, defi, token redistribution',
  icons: { icon: '/newlogopng.png', apple: '/newlogopng.png' },
  openGraph: {
    title: 'Boomerang — Your fees come back',
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: 'Boomerang',
    images: [{ url: '/bannier.png', width: 1200, height: 630, alt: 'Boomerang' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boomerang — Your fees come back',
    description: DESCRIPTION,
    images: ['/bannier.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body className={inter.className}>
        <BackgroundBoomerangs />
        {children}
        <PartnershipToast />
      </body>
    </html>
  )
}
