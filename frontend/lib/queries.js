import { getSql } from './db';

// Shared read-only queries used by both the internal site routes and the
// public /api/v1 endpoints, so there is a single source of truth.

export async function getGlobalStats() {
  const sql = getSql();
  const [[u], [c], [e], [s]] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM users`,
    sql`SELECT COUNT(*)::int AS count FROM bot_configs WHERE is_active = true`,
    sql`SELECT COUNT(*)::int AS count FROM execution_logs
        WHERE status = 'success' AND holder_count > 0`,
    sql`SELECT COALESCE(SUM(claimed_sol_amount), 0) AS sum
        FROM execution_logs
        WHERE status = 'success' AND holder_count > 0 AND claimed_sol_amount IS NOT NULL`,
  ]);
  return {
    totalUsers: u.count,
    activeConfigs: c.count,
    totalExecutions: e.count,
    totalSolClaimedLamports: s.sum,
  };
}

export async function getActivity(limit = 20) {
  const sql = getSql();
  return await sql`
    (
      SELECT 'paid' AS type,
             bc.source_token_address AS source_token,
             bc.target_token_address AS target_token,
             el.holder_count, el.total_airdropped, el.bought_token_amount,
             el.claimed_sol_amount, el.execution_time AS ts
      FROM execution_logs el
      JOIN bot_configs bc ON el.config_id = bc.id
      WHERE el.status = 'success' AND el.holder_count > 0
    )
    UNION ALL
    (
      SELECT 'linked' AS type,
             bc.source_token_address, bc.target_token_address,
             NULL::int, NULL::bigint, NULL::bigint, NULL::bigint, bc.created_at
      FROM bot_configs bc
    )
    ORDER BY ts DESC
    LIMIT ${limit}
  `;
}

// $Boomerang's own token is NOT linked to the bot — keep it out of the public
// list and treat its dashboard as unlinked.
const BOOMERANG_CA = 'BwEyBmL9drBdo4XJno8iGRvjiZcGL9FvUnq6xVNhpump';

// Tokens that currently have an active Boomerang bot — for the live list on
// the site. Counts only real distributions (a run that actually paid holders).
export async function getActiveTokens() {
  const sql = getSql();
  const rows = await sql`
    SELECT bc.source_token_address       AS address,
           bc.target_token_address       AS reward_token,
           bc.interval_minutes,
           bc.troll_mode,
           bc.vote_mode,
           bc.last_execution,
           COALESCE((
             SELECT COUNT(*) FROM execution_logs el
             WHERE el.config_id = bc.id AND el.status = 'success' AND el.holder_count > 0
           ), 0)::int                    AS distributions
    FROM bot_configs bc
    WHERE bc.is_active = true
    ORDER BY bc.created_at DESC
    LIMIT 50
  `;
  // Exclude $Boomerang's own token from the public "running tokens" list.
  return rows.filter((r) => r.address !== BOOMERANG_CA);
}

// Returns null when the token has no active Boomerang config.
export async function getDashboard(address) {
  // $Boomerang isn't linked to the bot — always treat it as unlinked.
  if (address === BOOMERANG_CA) return null;

  const sql = getSql();
  const [config] = await sql`
    SELECT * FROM bot_configs
    WHERE source_token_address = ${address} AND is_active = true
    LIMIT 1
  `;
  if (!config) return null;

  const [[stats], topRecipients, recentExecutions] = await Promise.all([
    sql`
      SELECT COALESCE(SUM(total_airdropped), 0)    AS total_airdropped,
             COALESCE(SUM(bought_token_amount), 0) AS total_bought_back,
             COALESCE(SUM(claimed_sol_amount), 0)  AS total_sol_claimed,
             COUNT(*)::int                         AS execution_count,
             MAX(execution_time)                   AS last_execution
      FROM execution_logs el
      JOIN bot_configs bc ON el.config_id = bc.id
      WHERE bc.source_token_address = ${address} AND el.status = 'success'
    `,
    sql`
      SELECT holder_address,
             SUM(airdrop_amount) AS total_received,
             COUNT(*)::int       AS airdrop_count
      FROM airdrop_transactions at
      JOIN execution_logs el ON at.execution_log_id = el.id
      JOIN bot_configs bc ON el.config_id = bc.id
      WHERE bc.source_token_address = ${address} AND at.status = 'success'
      GROUP BY holder_address
      ORDER BY total_received DESC
      LIMIT 10
    `,
    sql`
      SELECT el.id, el.claimed_sol_amount, el.bought_token_amount, el.total_airdropped,
             el.holder_count, el.execution_time, el.status, el.reward_token_used,
             (SELECT at.tx_signature FROM airdrop_transactions at
              WHERE at.execution_log_id = el.id AND at.status = 'success'
                AND at.tx_signature IS NOT NULL
              LIMIT 1) AS tx_signature
      FROM execution_logs el
      JOIN bot_configs bc ON el.config_id = bc.id
      WHERE bc.source_token_address = ${address} AND el.status = 'success'
      ORDER BY el.execution_time DESC
      LIMIT 10
    `,
  ]);

  return { config, stats, topRecipients, recentExecutions };
}
