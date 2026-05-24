import { getActiveTokens } from '../../../../lib/queries';
import { apiJson, apiOptions } from '../../../../lib/apiResponse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || '';

// Cache token metadata briefly so we don't hit DexScreener on every poll.
let metaCache = { at: 0, map: {} };
const META_TTL = 60000;

/**
 * Fetch real name / symbol / image for a set of mints from DexScreener
 * (no API key, CORS-free server-side). Returns a mint -> meta map.
 */
async function fetchTokenMeta(mints) {
  const now = Date.now();
  const missing = mints.filter((m) => !metaCache.map[m]);
  if (missing.length === 0 && now - metaCache.at < META_TTL) return metaCache.map;

  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mints.join(',')}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const best = {}; // mint -> { meta, liquidity } keep the most-liquid pair
    for (const pair of data.pairs || []) {
      for (const side of [pair.baseToken, pair.quoteToken]) {
        if (!side || !mints.includes(side.address)) continue;
        const liq = pair.liquidity?.usd || 0;
        if (!best[side.address] || liq > best[side.address].liq) {
          best[side.address] = {
            liq,
            meta: {
              name: side.name,
              symbol: side.symbol,
              image: pair.info?.imageUrl || null,
            },
          };
        }
      }
    }
    const map = { ...metaCache.map };
    for (const [mint, v] of Object.entries(best)) map[mint] = v.meta;
    metaCache = { at: now, map };
  } catch {
    /* keep whatever we have cached */
  }
  return metaCache.map;
}

export function OPTIONS() {
  return apiOptions();
}

export async function GET() {
  try {
    const rows = await getActiveTokens();
    const mints = [...new Set(rows.flatMap((r) => [r.address, r.reward_token]))];
    const meta = await fetchTokenMeta(mints);

    return apiJson({
      count: rows.length,
      tokens: rows.map((r) => ({
        address: r.address,
        name: meta[r.address]?.name || null,
        symbol: meta[r.address]?.symbol || null,
        image: meta[r.address]?.image || null,
        rewardToken: r.reward_token,
        rewardSymbol: meta[r.reward_token]?.symbol || null,
        intervalMinutes: r.interval_minutes,
        distributions: r.distributions,
        lastExecution: r.last_execution,
        dashboardUrl: SITE ? `${SITE}/${r.address}` : `/${r.address}`,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return apiJson({ error: error.message }, 500);
  }
}
