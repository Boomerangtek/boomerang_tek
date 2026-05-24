// Shared server-side token metadata lookup (name / symbol / image) via
// DexScreener — no API key, results cached briefly. Used by the public token
// list and the live activity feed so tokens show real names, not raw CAs.

let cache = { map: {}, at: 0 };
const TTL = 60000;

/**
 * Resolve metadata for a set of mints. Returns a mint -> { name, symbol, image }
 * map (only the mints DexScreener knows about appear).
 * @param {string[]} mints
 */
export async function fetchTokenMeta(mints) {
  const unique = [...new Set(mints.filter(Boolean))];
  const now = Date.now();
  const missing = unique.filter((m) => !cache.map[m]);
  if (missing.length === 0 && now - cache.at < TTL) return cache.map;

  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${unique.join(',')}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const best = {}; // mint -> { liq, meta } — keep the most-liquid pair's info
    for (const pair of data.pairs || []) {
      for (const side of [pair.baseToken, pair.quoteToken]) {
        if (!side || !unique.includes(side.address)) continue;
        const liq = pair.liquidity?.usd || 0;
        if (!best[side.address] || liq > best[side.address].liq) {
          best[side.address] = {
            liq,
            meta: {
              name: side.name || null,
              symbol: side.symbol || null,
              image: pair.info?.imageUrl || null,
            },
          };
        }
      }
    }
    const map = { ...cache.map };
    for (const [mint, v] of Object.entries(best)) map[mint] = v.meta;
    cache = { map, at: now };
  } catch {
    /* keep whatever is cached */
  }
  return cache.map;
}
