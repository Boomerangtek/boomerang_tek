// $Boomerang Troll Mode — when enabled on a config, the airdrop reward token is
// randomized every cycle. Holders never know what's coming: could be USDC, SOL,
// $TROLL, or any of the curated tickers below. One thing's guaranteed — they get
// paid. The other — they get trolled. 🪃👹
//
// The pool is curated to liquid, Jupiter-routable mints so the swap never fails.

export const TROLL_REWARD_POOL = [
  { symbol: 'SOL',    mint: 'So11111111111111111111111111111111111111112' },
  { symbol: 'USDC',   mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { symbol: 'USDT',   mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
  { symbol: 'TROLL',  mint: '5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2' },
  { symbol: 'BONK',   mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
  { symbol: 'WIF',    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
  { symbol: 'JUP',    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
  { symbol: 'POPCAT', mint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr' },
];

/**
 * Pick a random reward token for this cycle.
 * @returns {{symbol: string, mint: string}}
 */
export function pickRandomReward() {
  return TROLL_REWARD_POOL[Math.floor(Math.random() * TROLL_REWARD_POOL.length)];
}
