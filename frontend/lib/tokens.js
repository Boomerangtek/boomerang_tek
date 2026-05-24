// Curated metadata for well-known Solana tokens. Logos are resolved from the
// DexScreener token CDN by mint address; if that 404s the UI falls back to a
// generated coin badge (see LiveFeed). Unknown mints get a shortened-address
// ticker so the feed always renders something sensible.

const LOGO = (mint) => `https://dd.dexscreener.com/ds-data/tokens/solana/${mint}.png`;

export const TOKENS = {
  So11111111111111111111111111111111111111112: { symbol: 'SOL', name: 'Solana', color: '#9945FF' },
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: { symbol: 'BONK', name: 'Bonk', color: '#F7A41D' },
  EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: { symbol: 'WIF', name: 'dogwifhat', color: '#C8A06A' },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: { symbol: 'USDC', name: 'USD Coin', color: '#2775CA' },
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: { symbol: 'JUP', name: 'Jupiter', color: '#22C55E' },
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr': { symbol: 'POPCAT', name: 'Popcat', color: '#E4A951' },
  MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5: { symbol: 'MEW', name: 'cat in a dogs world', color: '#6CA0DC' },
  WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk: { symbol: 'WEN', name: 'Wen', color: '#F25CA2' },
  '2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump': { symbol: 'PNUT', name: 'Peanut', color: '#B5651D' },
  HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3: { symbol: 'PYTH', name: 'Pyth', color: '#8246FA' },
};

const MINTS = Object.keys(TOKENS);

export function resolveToken(mint) {
  const meta = TOKENS[mint];
  if (meta) return { mint, ...meta, logo: LOGO(mint) };
  const short = mint ? `${mint.slice(0, 4)}…${mint.slice(-3)}` : '????';
  return { mint, symbol: short.toUpperCase(), name: 'Token', color: '#22C56B', logo: mint ? LOGO(mint) : null };
}

// A pool of (mint pairs) used to seed the demo activity stream when the bot
// has no real events yet.
export function randomDemoEvent(id) {
  const pick = () => MINTS[Math.floor(Math.random() * MINTS.length)];
  const source = pick();
  let target = pick();
  if (target === source) target = MINTS[(MINTS.indexOf(source) + 1) % MINTS.length];

  const isPaid = Math.random() > 0.35;
  return {
    id,
    type: isPaid ? 'paid' : 'linked',
    sourceToken: source,
    targetToken: target,
    holderCount: isPaid ? 6 + Math.floor(Math.random() * 40) : null,
    time: new Date().toISOString(),
  };
}

// Once tokens are really linked, keep the feed flowing with reward payouts
// built from those same real token pairs (biased toward "paid" events).
export function demoEventFromPairs(id, pairs, paidBias = 0.72) {
  if (!pairs || pairs.length === 0) return randomDemoEvent(id);
  const { source, target } = pairs[Math.floor(Math.random() * pairs.length)];
  const isPaid = Math.random() < paidBias;
  return {
    id,
    type: isPaid ? 'paid' : 'linked',
    sourceToken: source,
    targetToken: target,
    holderCount: isPaid ? 6 + Math.floor(Math.random() * 40) : null,
    time: new Date().toISOString(),
  };
}
