import { getDashboard } from '../../../../lib/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { token } = await params;
    const data = await getDashboard(token);

    if (!data) {
      return Response.json(
        { error: 'Token not found', message: 'No active Boomerang configuration found for this token' },
        { status: 404 }
      );
    }

    const { config, stats, topRecipients, recentExecutions } = data;
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
        txSignature: e.tx_signature || null,
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
