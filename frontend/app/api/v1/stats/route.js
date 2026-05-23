import { getGlobalStats } from '../../../../lib/queries';
import { apiJson, apiOptions } from '../../../../lib/apiResponse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return apiOptions();
}

export async function GET() {
  try {
    const s = await getGlobalStats();
    return apiJson({
      solRedistributed: Number(Number(s.totalSolClaimedLamports) / 1e9).toFixed(4),
      distributions: s.totalExecutions,
      activeBots: s.activeConfigs,
      creators: s.totalUsers,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return apiJson({ error: error.message }, 500);
  }
}
