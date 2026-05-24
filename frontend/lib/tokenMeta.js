// Shared server-side token metadata lookup (name / symbol / image), cached
// briefly. Primary source is Jupiter (has pump.fun token icons), with
// DexScreener as a fallback. Used by the token list and the live feed so
// tokens show real names and logos, not raw CAs.

let cache = { map: {}, at: 0 };
const TTL = 60000;

async function fromJupiter(mints, map) {
  try {
    const res = await fetch(
      `https://lite-api.jup.ag/tokens/v2/search?query=${mints.join(',')}`,
      { cache: 'no-store' }
    );
    const arr = await res.json();
    if (!Array.isArray(arr)) return;
    for (const t of arr) {
      if (!mints.includes(t.id)) continue;
      map[t.id] = {
        name: t.name || null,
        symbol: t.symbol || null,
        image: t.icon || null,
        marketCap: t.mcap ?? t.fdv ?? null,
      };
    }
  } catch {
    /* ignore */
  }
}

async function fromDexScreener(mints, map) {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mints.join(',')}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const best = {}; // mint -> { liq, meta } — keep the most-liquid pair
    for (const pair of data.pairs || []) {
      for (const side of [pair.baseToken, pair.quoteToken]) {
        if (!side || !mints.includes(side.address)) continue;
        const liq = pair.liquidity?.usd || 0;
        if (!best[side.address] || liq > best[side.address].liq) {
          best[side.address] = {
            liq,
            meta: {
              name: side.name || null,
              symbol: side.symbol || null,
              image: pair.info?.imageUrl || null,
              marketCap: pair.marketCap ?? pair.fdv ?? null,
            },
          };
        }
      }
    }
    for (const [mint, v] of Object.entries(best)) {
      const cur = map[mint] || {};
      map[mint] = {
        name: cur.name || v.meta.name,
        symbol: cur.symbol || v.meta.symbol,
        image: cur.image || v.meta.image,
        marketCap: cur.marketCap ?? v.meta.marketCap,
      };
    }
  } catch {
    /* ignore */
  }
}

/**
 * Resolve metadata for a set of mints. Returns a mint -> { name, symbol, image }
 * map (only the mints a source knows about appear).
 * @param {string[]} mints
 */
export async function fetchTokenMeta(mints) {
  const unique = [...new Set(mints.filter(Boolean))];
  const now = Date.now();
  const missing = unique.filter((m) => !cache.map[m]);
  if (missing.length === 0 && now - cache.at < TTL) return cache.map;

  const map = { ...cache.map };
  await fromJupiter(unique, map);

  // Anything Jupiter didn't give an image for → try DexScreener.
  const stillMissing = unique.filter((m) => !map[m] || !map[m].image);
  if (stillMissing.length) await fromDexScreener(stillMissing, map);

  cache = { map, at: now };
  return cache.map;
}
