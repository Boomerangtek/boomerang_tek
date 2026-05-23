import { getSql } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getSql();
    const [[u], [c], [e], [s]] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM users`,
      sql`SELECT COUNT(*)::int AS count FROM bot_configs WHERE is_active = true`,
      sql`SELECT COUNT(*)::int AS count FROM execution_logs WHERE status = 'success'`,
      sql`SELECT COALESCE(SUM(claimed_sol_amount), 0) AS sum
          FROM execution_logs
          WHERE status = 'success' AND claimed_sol_amount IS NOT NULL`,
    ]);

    return Response.json({
      totalUsers: u.count,
      activeConfigs: c.count,
      totalExecutions: e.count,
      totalSolClaimed: (Number(s.sum) / 1e9).toFixed(2),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
