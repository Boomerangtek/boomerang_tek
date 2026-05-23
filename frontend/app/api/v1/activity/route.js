import { getActivity } from '../../../../lib/queries';
import { apiJson, apiOptions } from '../../../../lib/apiResponse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return apiOptions();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const rows = await getActivity(limit);

    return apiJson({
      events: rows.map((r) => ({
        type: r.type, // 'paid' | 'linked'
        token: r.source_token,
        rewardToken: r.target_token,
        holderCount: r.holder_count,
        airdropped: r.total_airdropped,
        claimedSol: r.claimed_sol_amount,
        time: r.ts,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return apiJson({ error: error.message }, 500);
  }
}
