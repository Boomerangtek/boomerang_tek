import { getSql } from './db';

// Read/write helpers for the Community Vote feature. The frontend talks to the
// same Neon database the bot writes to, so vote state is always consistent.

/** Open vote cycle for a Boomerang token (by its source/mint address). */
export async function getCycleByToken(tokenAddress) {
  const sql = getSql();
  const [cycle] = await sql`
    SELECT vc.*, bc.source_token_address, bc.vote_safety_mode
    FROM vote_cycles vc
    JOIN bot_configs bc ON vc.config_id = bc.id
    WHERE bc.source_token_address = ${tokenAddress}
      AND bc.is_active = true AND bc.vote_mode = true
      AND vc.status = 'open'
    ORDER BY vc.id DESC
    LIMIT 1
  `;
  if (!cycle) return null;

  const options = await sql`
    SELECT o.id, o.token_address, o.proposed_by,
           COALESCE(SUM(v.weight), 0)::text AS weight,
           COUNT(v.voter_address)::int      AS voters
    FROM vote_options o
    LEFT JOIN votes v ON v.option_id = o.id
    WHERE o.cycle_id = ${cycle.id}
    GROUP BY o.id
    ORDER BY weight DESC, o.id ASC
  `;
  return { cycle, options };
}

/** A voter's snapshot weight in a cycle (0 if they didn't hold at snapshot). */
export async function getSnapshotWeight(cycleId, wallet) {
  const sql = getSql();
  const [row] = await sql`
    SELECT weight::text FROM vote_snapshots
    WHERE cycle_id = ${cycleId} AND holder_address = ${wallet}
  `;
  return row ? row.weight : '0';
}

/** The option a wallet already picked in a cycle, or null. */
export async function getExistingVote(cycleId, wallet) {
  const sql = getSql();
  const [row] = await sql`
    SELECT option_id FROM votes WHERE cycle_id = ${cycleId} AND voter_address = ${wallet}
  `;
  return row ? row.option_id : null;
}

/** Record (or change) a wallet's vote in a cycle. */
export async function castVote(cycleId, wallet, optionId, weight) {
  const sql = getSql();
  await sql`
    INSERT INTO votes (cycle_id, voter_address, option_id, weight)
    VALUES (${cycleId}, ${wallet}, ${optionId}, ${weight})
    ON CONFLICT (cycle_id, voter_address)
    DO UPDATE SET option_id = ${optionId}, weight = ${weight}, created_at = NOW()
  `;
}

/** Ensure an option belongs to the given cycle (and is allowed). */
export async function getOption(cycleId, optionId) {
  const sql = getSql();
  const [row] = await sql`
    SELECT id, token_address FROM vote_options
    WHERE id = ${optionId} AND cycle_id = ${cycleId} AND passed_filters = true
  `;
  return row || null;
}

/**
 * All currently open vote cycles (public) with per-option tallies — for the
 * "live votes" board. Caller groups rows by cycle to find the leader + total.
 */
export async function getActiveCycles() {
  const sql = getSql();
  return await sql`
    SELECT vc.id                    AS cycle_id,
           bc.source_token_address  AS token,
           vc.ends_at,
           o.token_address          AS option_token,
           COALESCE(SUM(v.weight), 0)::text AS weight,
           COUNT(v.voter_address)::int      AS voters
    FROM vote_cycles vc
    JOIN bot_configs bc ON bc.id = vc.config_id AND bc.is_active = true AND bc.vote_mode = true
    LEFT JOIN vote_options o ON o.cycle_id = vc.id
    LEFT JOIN votes v ON v.option_id = o.id
    WHERE vc.status = 'open'
    GROUP BY vc.id, bc.source_token_address, vc.ends_at, o.token_address
    ORDER BY vc.ends_at ASC, weight DESC
  `;
}

/**
 * Every open vote cycle a wallet is eligible to vote in (i.e. it appears in the
 * snapshot with weight > 0), with the token + its current vote pick.
 */
export async function getEligibility(wallet) {
  const sql = getSql();
  return await sql`
    SELECT bc.source_token_address AS token,
           vc.id                   AS cycle_id,
           vc.ends_at,
           s.weight::text          AS weight,
           (SELECT option_id FROM votes v WHERE v.cycle_id = vc.id AND v.voter_address = ${wallet}) AS voted_option_id
    FROM vote_snapshots s
    JOIN vote_cycles vc ON vc.id = s.cycle_id AND vc.status = 'open'
    JOIN bot_configs bc ON bc.id = vc.config_id AND bc.is_active = true AND bc.vote_mode = true
    WHERE s.holder_address = ${wallet} AND s.weight > 0
    ORDER BY vc.ends_at ASC
  `;
}
