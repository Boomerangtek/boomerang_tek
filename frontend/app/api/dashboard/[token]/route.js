import { getDashboard } from '../../../../lib/queries';
import { fetchTokenMeta } from '../../../../lib/tokenMeta';

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
    const src = config.source_token_address;
    const tgt = config.target_token_address;
    // Include every reward token actually used (Troll Mode varies it per run)
    // so each run can show its real symbol + decimals.
    const usedMints = recentExecutions.map((e) => e.reward_token_used).filter(Boolean);
    const meta = await fetchTokenMeta([src, tgt, ...usedMints]);
    return Response.json({
      sourceToken: { address: src, name: meta[src]?.name || null, symbol: meta[src]?.symbol || null, image: meta[src]?.image || null, marketCap: meta[src]?.marketCap ?? null },
      targetToken: { address: tgt, name: meta[tgt]?.name || null, symbol: meta[tgt]?.symbol || null, image: meta[tgt]?.image || null, marketCap: meta[tgt]?.marketCap ?? null, decimals: meta[tgt]?.decimals ?? null },
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
        rewardToken: e.reward_token_used || null,
        rewardSymbol: e.reward_token_used ? (meta[e.reward_token_used]?.symbol || null) : null,
        rewardDecimals: e.reward_token_used ? (meta[e.reward_token_used]?.decimals ?? null) : null,
      })),
      config: {
        intervalMinutes: config.interval_minutes,
        isActive: config.is_active,
        trollMode: Boolean(config.troll_mode),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
