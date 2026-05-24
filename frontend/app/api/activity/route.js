import { getActivity } from '../../../lib/queries';
import { fetchTokenMeta } from '../../../lib/tokenMeta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);
    const rows = await getActivity(limit);

    // Real names/symbols/images so the feed shows token names, not raw CAs.
    const mints = [...new Set(rows.flatMap((r) => [r.source_token, r.target_token]))];
    const meta = await fetchTokenMeta(mints);

    return Response.json({
      events: rows.map((r) => ({
        type: r.type,
        sourceToken: r.source_token,
        targetToken: r.target_token,
        holderCount: r.holder_count,
        airdropped: r.total_airdropped,
        bought: r.bought_token_amount,
        claimedSol: r.claimed_sol_amount,
        time: r.ts,
      })),
      meta,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
