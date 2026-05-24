import { getActiveTokens } from '../../../../lib/queries';
import { fetchTokenMeta } from '../../../../lib/tokenMeta';
import { apiJson, apiOptions } from '../../../../lib/apiResponse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || '';

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
