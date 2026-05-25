import { getSql } from './db';

// Mission state lives in the same Neon DB the bot reads for payouts.

export async function listMissions() {
  const sql = getSql();
  return await sql`
    SELECT id, slug, title, description, type, params, reward_token, reward_amount::text,
           total_budget::text, spent::text, per_wallet_limit, COALESCE(xp, 0) AS xp
    FROM missions WHERE active = true ORDER BY id ASC
  `;
}

/** Record/refresh a wallet's presence; returns first_seen for "member since". */
export async function touchUser(wallet) {
  const sql = getSql();
  const [r] = await sql`
    INSERT INTO mission_users (wallet, first_seen, last_seen)
    VALUES (${wallet}, NOW(), NOW())
    ON CONFLICT (wallet) DO UPDATE SET last_seen = NOW()
    RETURNING first_seen
  `;
  return r?.first_seen || null;
}

/** Total XP a wallet has earned (sum of completed missions' XP). */
export async function getTotalXp(wallet) {
  const sql = getSql();
  const [r] = await sql`
    SELECT COALESCE(SUM(m.xp), 0)::int AS xp, COUNT(*)::int AS done
    FROM mission_completions c JOIN missions m ON m.id = c.mission_id
    WHERE c.wallet = ${wallet}
  `;
  return { xp: r?.xp || 0, done: r?.done || 0 };
}

export async function getCompletions(wallet) {
  const sql = getSql();
  return await sql`
    SELECT mission_id, status, reward_amount::text, payout_sig
    FROM mission_completions WHERE wallet = ${wallet}
  `;
}

export async function getMission(id) {
  const sql = getSql();
  const [m] = await sql`SELECT * FROM missions WHERE id = ${id} AND active = true`;
  return m || null;
}

/** Has this wallet already completed (any status) this mission? */
export async function hasCompleted(missionId, wallet) {
  const sql = getSql();
  const [r] = await sql`
    SELECT 1 FROM mission_completions WHERE mission_id = ${missionId} AND wallet = ${wallet}
  `;
  return Boolean(r);
}

/** Record a verified completion + reserve the reward against the budget. */
export async function recordCompletion(mission, wallet) {
  const sql = getSql();
  // Budget guard: don't over-issue past total_budget.
  const [m] = await sql`SELECT spent::text, total_budget::text, reward_amount::text FROM missions WHERE id = ${mission.id}`;
  if (Number(m.spent) + Number(m.reward_amount) > Number(m.total_budget)) {
    throw new Error('Mission budget exhausted');
  }
  await sql`
    INSERT INTO mission_completions (mission_id, wallet, status, reward_token, reward_amount)
    VALUES (${mission.id}, ${wallet}, 'verified', ${mission.reward_token}, ${mission.reward_amount})
    ON CONFLICT (mission_id, wallet) DO NOTHING
  `;
  await sql`UPDATE missions SET spent = spent + ${mission.reward_amount} WHERE id = ${mission.id}`;
}

/** Verified (claimable) reward total for a wallet, grouped by token. */
export async function getClaimable(wallet) {
  const sql = getSql();
  return await sql`
    SELECT reward_token, COALESCE(SUM(reward_amount), 0)::text AS amount, COUNT(*)::int AS n
    FROM mission_completions WHERE wallet = ${wallet} AND status = 'verified'
    GROUP BY reward_token
  `;
}

/** Lock a wallet's verified rewards for payout (the bot pays them out). */
export async function markClaiming(wallet) {
  const sql = getSql();
  const rows = await sql`
    UPDATE mission_completions SET status = 'claiming'
    WHERE wallet = ${wallet} AND status = 'verified'
    RETURNING id
  `;
  return rows.length;
}

/** Voting / customer checks (on-chain facts mirrored in our DB). */
export async function hasVoted(wallet) {
  const sql = getSql();
  const [r] = await sql`SELECT 1 FROM votes WHERE voter_address = ${wallet} LIMIT 1`;
  return Boolean(r);
}

export async function isCustomer(wallet) {
  const sql = getSql();
  const [r] = await sql`
    SELECT 1 FROM bot_configs WHERE dev_wallet_public = ${wallet} AND is_active = true LIMIT 1
  `;
  return Boolean(r);
}

/** Number of distinct vote cycles a wallet has voted in. */
export async function getVoteCount(wallet) {
  const sql = getSql();
  const [r] = await sql`SELECT COUNT(DISTINCT cycle_id)::int AS n FROM votes WHERE voter_address = ${wallet}`;
  return r?.n || 0;
}

/** Does the wallet run an active config with Troll Mode on? */
export async function hasTrollMode(wallet) {
  const sql = getSql();
  const [r] = await sql`
    SELECT 1 FROM bot_configs WHERE dev_wallet_public = ${wallet} AND is_active = true AND troll_mode = true LIMIT 1
  `;
  return Boolean(r);
}

/** Does the wallet run an active config with Community Vote on? */
export async function hasVoteMode(wallet) {
  const sql = getSql();
  const [r] = await sql`
    SELECT 1 FROM bot_configs WHERE dev_wallet_public = ${wallet} AND is_active = true AND vote_mode = true LIMIT 1
  `;
  return Boolean(r);
}
