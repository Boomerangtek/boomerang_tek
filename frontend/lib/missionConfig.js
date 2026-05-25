// $Boomerang token + the minimum holding required to take part in missions.
export const BOOMERANG_MINT = 'BwEyBmL9drBdo4XJno8iGRvjiZcGL9FvUnq6xVNhpump';
export const MIN_HOLD = 100_000; // UI amount of $Boomerang

export function claimMessage(wallet) {
  return `Boomerang Missions — claim rewards\nWallet: ${wallet}`;
}

// XP ranks. Each tier has a minimum XP; the bar fills toward the next tier.
export const RANKS = [
  { name: 'Rookie', min: 0, emoji: '🥚' },
  { name: 'Holder', min: 100, emoji: '🪃' },
  { name: 'Diamond', min: 300, emoji: '💎' },
  { name: 'Whale', min: 700, emoji: '🐋' },
  { name: 'Legend', min: 1500, emoji: '👑' },
];

export function rankForXp(xp = 0) {
  let i = 0;
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].min) i = k;
  const cur = RANKS[i];
  const next = RANKS[i + 1] || null;
  const level = i + 1;
  const span = next ? next.min - cur.min : 1;
  const into = xp - cur.min;
  const pct = next ? Math.min(100, Math.round((into / span) * 100)) : 100;
  return { ...cur, level, next, pct, toNext: next ? next.min - xp : 0 };
}
