import './globals.css'
import { Fredoka } from 'next/font/google'

const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata = {
  title: 'Boomerang 🪃 - Your Fees Come Back!',
  description: 'Turn PumpFun fees into any token you want. The first bot that lets you select which token to buy and airdrop to holders.',
  keywords: 'solana, pumpfun, telegram bot, airdrop, crypto, defi, token redistribution',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={fredoka.className}>
        {children}
      </body>
    </html>
  )
}
