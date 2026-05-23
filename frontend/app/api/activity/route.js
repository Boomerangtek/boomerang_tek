import { getSql } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50);

    const rows = await sql`
      (
        SELECT 'paid' AS type,
               bc.source_token_address AS source_token,
               bc.target_token_address AS target_token,
               el.holder_count,
               el.total_airdropped,
               el.bought_token_amount,
               el.claimed_sol_amount,
               el.execution_time AS ts
        FROM execution_logs el
        JOIN bot_configs bc ON el.config_id = bc.id
        WHERE el.status = 'success' AND el.holder_count > 0
      )
      UNION ALL
      (
        SELECT 'linked' AS type,
               bc.source_token_address,
               bc.target_token_address,
               NULL::int, NULL::bigint, NULL::bigint, NULL::bigint,
               bc.created_at
        FROM bot_configs bc
      )
      ORDER BY ts DESC
      LIMIT ${limit}
    `;

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
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
