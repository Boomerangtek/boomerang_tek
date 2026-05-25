import pool from '../db/connection.js';
import { distributeSol, distributeTokens } from './airdrop.js';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

/**
 * Pay out claimed mission rewards from the treasury wallet. Holders' verified
 * rewards are marked 'claiming' when they hit Claim; this batches the actual
 * transfers (one per wallet per reward token) and marks them paid.
 */
export async function tickMissionClaims() {
  const treasuryKey = process.env.TREASURY_PRIVATE_KEY;
  if (!treasuryKey) return; // no treasury configured → nothing to pay

  const { rows } = await pool.query(
    `SELECT id, wallet, reward_token, reward_amount FROM mission_completions WHERE status = 'claiming'`
  );
  if (!rows.length) return;

  // Group by reward token, then aggregate per wallet (one transfer each).
  const byToken = {};
  for (const r of rows) (byToken[r.reward_token] ??= []).push(r);

  for (const [token, comps] of Object.entries(byToken)) {
    const byWallet = {};
    for (const c of comps) {
      byWallet[c.wallet] ??= { amount: 0n, ids: [] };
      byWallet[c.wallet].amount += BigInt(c.reward_amount);
      byWallet[c.wallet].ids.push(c.id);
    }
    const distributions = Object.entries(byWallet).map(([address, v]) => ({ address, amount: v.amount }));

    let results;
    try {
      console.log(`💸 Paying ${distributions.length} mission claim(s) in ${token === SOL_MINT ? 'SOL' : token}...`);
      results = token === SOL_MINT
        ? await distributeSol(treasuryKey, distributions)
        : await distributeTokens(treasuryKey, token, distributions);
    } catch (e) {
      console.error('Mission payout batch failed (will retry):', e.message);
      continue; // leave as 'claiming' to retry next tick
    }

    for (const s of results.successful) {
      const ids = byWallet[s.address]?.ids || [];
      if (ids.length) {
        await pool.query(
          `UPDATE mission_completions SET status = 'paid', payout_sig = $1, paid_at = NOW() WHERE id = ANY($2)`,
          [s.signature, ids]
        );
      }
    }
  }
}
