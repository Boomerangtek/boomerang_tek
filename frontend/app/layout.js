import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

export const metadata = {
  title: 'Boomerang - Choose Your Token Reward',
  description: 'Turn PumpFun fees into any token you want. The first bot that lets you select which token to buy and airdrop to holders.',
  keywords: 'solana, pumpfun, telegram bot, airdrop, crypto, defi, token redistribution',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
