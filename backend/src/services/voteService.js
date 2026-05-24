import pool from '../db/connection.js';
import { getTokenHolders } from './holders.js';

// MVP starter pool — the reward options holders can vote on out of the box.
// (Phase 2 adds dev-proposed tokens + anti-rug filters on top of this.)
export const DEFAULT_OPTION_POOL = [
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  '5UUH9RTDiSpq6HKS6bp4NdU9PNJpXRXuiw6ShBTBhgH2', // TROLL
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
];

/** The open cycle for a config, or null. */
export async function getOpenCycle(configId) {
  const { rows } = await pool.query(
    `SELECT * FROM vote_cycles WHERE config_id = $1 AND status = 'open' ORDER BY id DESC LIMIT 1`,
    [configId]
  );
  return rows[0] || null;
}

/**
 * Open a new vote cycle: snapshot current holders (their balances become voting
 * weight) and seed the option pool.
 */
export async function openCycle(config) {
  const hours = config.vote_cycle_hours || 24;
  const { rows } = await pool.query(
    `INSERT INTO vote_cycles (config_id, status, ends_at)
     VALUES ($1, 'open', NOW() + ($2 || ' hours')::interval) RETURNING *`,
    [config.id, String(hours)]
  );
  const cycle = rows[0];

  // Snapshot holders → voting weight.
  let holders = [];
  try {
    holders = await getTokenHolders(config.source_token_address, Number(config.min_holder_amount || 0));
  } catch (e) {
    console.error(`Vote snapshot failed for config ${config.id}:`, e.message);
  }
  if (holders.length) {
    const values = [];
    const params = [];
    holders.forEach((h, i) => {
      params.push(`($1, $${i * 2 + 2}, $${i * 2 + 3})`);
      values.push(h.address, h.balance.toString());
    });
    // Chunk to stay under parameter limits.
    const CHUNK = 500;
    for (let i = 0; i < holders.length; i += CHUNK) {
      const slice = holders.slice(i, i + CHUNK);
      const ph = slice.map((_, j) => `($1, $${j * 2 + 2}, $${j * 2 + 3})`).join(',');
      const vals = slice.flatMap((h) => [h.address, h.balance.toString()]);
      await pool.query(
        `INSERT INTO vote_snapshots (cycle_id, holder_address, weight) VALUES ${ph}
         ON CONFLICT DO NOTHING`,
        [cycle.id, ...vals]
      );
    }
  }

  // Seed options: starter pool + the dev's configured reward token.
  const opts = [...new Set([...DEFAULT_OPTION_POOL, config.target_token_address])];
  for (const mint of opts) {
    await pool.query(
      `INSERT INTO vote_options (cycle_id, token_address, proposed_by, passed_filters)
       VALUES ($1, $2, NULL, true) ON CONFLICT DO NOTHING`,
      [cycle.id, mint]
    );
  }
  console.log(`🗳️  Opened vote cycle ${cycle.id} for config ${config.id} (${holders.length} holders, ${opts.length} options)`);
  return cycle;
}

/**
 * Resolve a cycle: tally weighted votes and pick the winner (highest weight;
 * ties broken by earliest option). Falls back to the dev's reward token if no
 * votes were cast.
 */
export async function resolveCycle(cycleId, fallbackToken) {
  const { rows } = await pool.query(
    `SELECT o.token_address, COALESCE(SUM(v.weight), 0) AS w, o.id
     FROM vote_options o
     LEFT JOIN votes v ON v.option_id = o.id
     WHERE o.cycle_id = $1
     GROUP BY o.id, o.token_address
     ORDER BY w DESC, o.id ASC`,
    [cycleId]
  );
  const top = rows[0];
  const winner = top && Number(top.w) > 0 ? top.token_address : fallbackToken;
  const totalWeight = rows.reduce((s, r) => s + Number(r.w), 0);
  await pool.query(
    `UPDATE vote_cycles SET status = 'resolved', winning_token = $1, total_weight = $2 WHERE id = $3`,
    [winner, totalWeight, cycleId]
  );
  console.log(`🏆 Resolved vote cycle ${cycleId} → winner ${winner} (total weight ${totalWeight})`);
  return winner;
}

/** Reward token from the most recent resolved cycle (what the bot pays now). */
export async function getCurrentRewardToken(configId) {
  const { rows } = await pool.query(
    `SELECT winning_token FROM vote_cycles
     WHERE config_id = $1 AND status = 'resolved' AND winning_token IS NOT NULL
     ORDER BY id DESC LIMIT 1`,
    [configId]
  );
  return rows[0]?.winning_token || null;
}

/**
 * Housekeeping for all vote-mode configs: resolve ended cycles and ensure each
 * has an open one. Called on a schedule.
 */
export async function tickVoteCycles() {
  const { rows: configs } = await pool.query(
    `SELECT * FROM bot_configs WHERE is_active = true AND vote_mode = true`
  );
  for (const config of configs) {
    const open = await getOpenCycle(config.id);
    if (open) {
      if (new Date(open.ends_at).getTime() <= Date.now()) {
        await resolveCycle(open.id, config.target_token_address);
        await openCycle(config);
      }
    } else {
      await openCycle(config);
    }
  }
}
