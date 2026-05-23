import { getDashboard } from '../../../../../lib/queries';
import { apiJson, apiOptions } from '../../../../../lib/apiResponse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || '';

export function OPTIONS() {
  return apiOptions();
}

export async function GET(request, { params }) {
  try {
    const { address } = await params;
    const data = await getDashboard(address);

    if (!data) {
      return apiJson({ linked: false, address });
    }

    const { config, stats, topRecipients, recentExecutions } = data;
    return apiJson({
      linked: true,
      address: config.source_token_address,
      rewardToken: config.target_token_address,
      intervalMinutes: config.interval_minutes,
      active: config.is_active,
      stats: {
        feesClaimedSol: Number(Number(stats.total_sol_claimed) / 1e9).toFixed(4),
        distributions: stats.execution_count || 0,
        boughtBack: stats.total_bought_back || '0',
        airdropped: stats.total_airdropped || '0',
        holdersPaid: topRecipients.length,
        lastExecution: stats.last_execution,
      },
      recentExecutions: recentExecutions.map((e) => ({
        claimedSol: e.claimed_sol_amount,
        airdropped: e.total_airdropped,
        holderCount: e.holder_count,
        time: e.execution_time,
        status: e.status,
      })),
      dashboardUrl: SITE ? `${SITE}/${config.source_token_address}` : undefined,
    });
  } catch (error) {
    return apiJson({ error: error.message }, 500);
  }
}
