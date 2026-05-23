import { getGlobalStats } from '../../../lib/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const s = await getGlobalStats();
    return Response.json({
      totalUsers: s.totalUsers,
      activeConfigs: s.activeConfigs,
      totalExecutions: s.totalExecutions,
      totalSolClaimed: (Number(s.totalSolClaimedLamports) / 1e9).toFixed(2),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
