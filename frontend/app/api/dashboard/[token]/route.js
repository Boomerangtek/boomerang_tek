import { getSql } from '../../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const sql = getSql();
    const { token } = await params;

    const [config] = await sql`
      SELECT * FROM bot_configs
      WHERE source_token_address = ${token} AND is_active = true
      LIMIT 1
    `;

    if (!config) {
      return Response.json(
        { error: 'Token not found', message: 'No active Boomerang configuration found for this token' },
        { status: 404 }
      );
    }

    const [[stats], topRecipients, recentExecutions] = await Promise.all([
      sql`
        SELECT COALESCE(SUM(total_airdropped), 0)     AS total_airdropped,
               COALESCE(SUM(bought_token_amount), 0)  AS total_bought_back,
               COALESCE(SUM(claimed_sol_amount), 0)   AS total_sol_claimed,
               COUNT(*)::int                          AS execution_count,
               MAX(execution_time)                    AS last_execution
        FROM execution_logs el
        JOIN bot_configs bc ON el.config_id = bc.id
        WHERE bc.source_token_address = ${token} AND el.status = 'success'
      `,
      sql`
        SELECT holder_address,
               SUM(airdrop_amount) AS total_received,
               COUNT(*)::int       AS airdrop_count
        FROM airdrop_transactions at
        JOIN execution_logs el ON at.execution_log_id = el.id
        JOIN bot_configs bc ON el.config_id = bc.id
        WHERE bc.source_token_address = ${token} AND at.status = 'success'
        GROUP BY holder_address
        ORDER BY total_received DESC
        LIMIT 10
      `,
      sql`
        SELECT el.id, el.claimed_sol_amount, el.bought_token_amount, el.total_airdropped,
               el.holder_count, el.execution_time, el.status
        FROM execution_logs el
        JOIN bot_configs bc ON el.config_id = bc.id
        WHERE bc.source_token_address = ${token}
        ORDER BY el.execution_time DESC
        LIMIT 10
      `,
    ]);

    return Response.json({
      sourceToken: { address: config.source_token_address },
      targetToken: { address: config.target_token_address },
      stats: {
        totalAirdropped: stats.total_airdropped || '0',
        totalBoughtBack: stats.total_bought_back || '0',
        totalSolClaimed: stats.total_sol_claimed || '0',
        totalExecutions: stats.execution_count || 0,
        lastExecution: stats.last_execution,
      },
      topRecipients: topRecipients.map((r) => ({
        address: r.holder_address,
        totalReceived: r.total_received,
        airdropCount: r.airdrop_count,
      })),
      recentExecutions: recentExecutions.map((e) => ({
        id: e.id,
        claimedSol: e.claimed_sol_amount,
        boughtTokens: e.bought_token_amount,
        totalAirdropped: e.total_airdropped,
        holderCount: e.holder_count,
        executionTime: e.execution_time,
        status: e.status,
      })),
      config: {
        intervalMinutes: config.interval_minutes,
        isActive: config.is_active,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
