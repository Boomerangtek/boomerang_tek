import * as db from '../db/queries.js';
import { decryptPrivateKey } from '../services/encryption.js';
import { getCreatorFees, claimCreatorFees } from '../services/pumpfun.js';
import { swapSolForToken } from '../services/jupiter.js';
import { getTokenHolders } from '../services/holders.js';
import { distributeTokens, distributeSol, calculateDistributions } from '../services/airdrop.js';
import { pickRandomReward, TROLL_REWARD_POOL } from '../services/trollMode.js';
import { sendNotification } from '../bot/telegram.js';

const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Tracks configs whose pipeline is currently running, so a cron tick that
// fires while the previous run is still in flight is skipped rather than
// double-claiming/double-swapping the same fees.
const runningConfigs = new Set();

/**
 * Execute bot configuration - claim fees, swap, and airdrop
 * @param {Object} config - Bot configuration from database
 */
export async function executeBotConfig(config) {
  if (runningConfigs.has(config.id)) {
    console.log(`⏭️  Config ${config.id} is still running from a previous tick, skipping`);
    return;
  }
  runningConfigs.add(config.id);

  console.log(`\n🚀 Executing bot for config ID: ${config.id}`);
  console.log(`   User ID: ${config.user_id}`);
  console.log(`   Interval: ${config.interval_minutes} minutes`);

  let executionLog = {
    configId: config.id,
    claimedSolAmount: 0n,
    boughtTokenAmount: 0n,
    holderCount: 0,
    totalAirdropped: 0n,
    status: 'failed',
    errorMessage: null,
    rewardTokenUsed: null,
  };

  try {
    // Step 1: Decrypt private key
    console.log('🔐 Decrypting private key...');
    const privateKey = decryptPrivateKey(config.dev_wallet_encrypted);

    // Step 2: Check available fees
    console.log('💰 Checking available creator fees...');
    const feeBalance = await getCreatorFees(config.dev_wallet_public);
    console.log(`   Available fees: ${feeBalance.toString()} lamports (${Number(feeBalance) / 1e9} SOL)`);

    if (feeBalance === 0n) {
      console.log('⏭️  No fees to claim, skipping execution');
      executionLog.status = 'success';
      executionLog.errorMessage = 'No fees to claim';
      await db.createExecutionLog(executionLog);
      await db.updateLastExecution(config.id);
      return;
    }

    // Step 3: Claim fees
    console.log('💸 Claiming creator fees...');
    const claimSignature = await claimCreatorFees(privateKey);
    console.log(`   Claim TX: ${claimSignature}`);

    // Only record the claimed amount once the claim tx has actually
    // confirmed, so a failed claim isn't logged as a successful one.
    executionLog.claimedSolAmount = feeBalance.toString();

    // Keep 5% of the claimed SOL as a buffer for transaction fees.
    const reserved = Number(feeBalance) * 0.95;
    const reservedLamports = BigInt(Math.floor(reserved));

    // 🎲 Troll Mode: pick a random reward token this cycle. Otherwise use the
    // config's fixed reward token. Holders never know what's coming.
    let rewardMint = config.target_token_address;
    if (config.troll_mode) {
      const pick = pickRandomReward();
      rewardMint = pick.mint;
      console.log(`👹 TROLL MODE — this cycle's surprise reward: $${pick.symbol} (${pick.mint})`);
    }
    executionLog.rewardTokenUsed = rewardMint;
    const rewardIsSol = rewardMint === SOL_MINT;

    // Step 4–5: Get the amount to distribute. If the reward is SOL itself,
    // there is nothing to swap — distribute the claimed SOL directly.
    // Otherwise swap the SOL into the reward token first.
    let amountToDistribute;
    if (rewardIsSol) {
      console.log(`💸 Reward is SOL — skipping swap, distributing ${reservedLamports} lamports directly`);
      amountToDistribute = reservedLamports;
    } else {
      console.log(`💱 Swapping ${reservedLamports} lamports for ${rewardMint}...`);
      const swapResult = await swapSolForToken(
        privateKey,
        rewardMint,
        Number(reservedLamports),
        config.slippage_bps
      );
      executionLog.boughtTokenAmount = swapResult.outputAmount.toString();
      amountToDistribute = swapResult.outputAmount;
      console.log(`   Bought ${swapResult.outputAmount.toString()} tokens`);
      console.log(`   Swap TX: ${swapResult.signature}`);
    }

    // Step 6: Get token holders
    console.log(`👥 Fetching holders of ${config.source_token_address}...`);
    const holders = await getTokenHolders(
      config.source_token_address,
      Number(config.min_holder_amount)
    );

    executionLog.holderCount = holders.length;
    console.log(`   Found ${holders.length} holders`);

    if (holders.length === 0) {
      console.log('⚠️  No holders found, cannot distribute');
      executionLog.status = 'success';
      executionLog.errorMessage = 'No holders to airdrop to';
      await db.createExecutionLog(executionLog);
      await db.updateLastExecution(config.id);
      return;
    }

    // Step 7: Calculate distributions
    console.log('📊 Calculating proportional distributions...');
    const distributions = calculateDistributions(
      holders,
      amountToDistribute,
      1n // Min 1 base unit per holder
    );

    // Step 8: Execute airdrops (native SOL or SPL/Token-2022 transfer)
    console.log('🎁 Starting airdrop distribution...');
    const airdropResults = rewardIsSol
      ? await distributeSol(privateKey, distributions)
      : await distributeTokens(privateKey, rewardMint, distributions);

    executionLog.totalAirdropped = airdropResults.totalSent.toString();
    executionLog.status = 'success';

    // Step 9: Save execution log
    const savedLog = await db.createExecutionLog(executionLog);

    // Step 10: Save individual airdrop transactions
    const airdropTxs = [];

    // Successful transactions
    for (const tx of airdropResults.successful) {
      airdropTxs.push({
        executionLogId: savedLog.id,
        holderAddress: tx.address,
        holderBalance: tx.holderBalance?.toString() || '0',
        airdropAmount: tx.amount.toString(),
        txSignature: tx.signature,
        status: 'success',
      });
    }

    // Failed transactions
    for (const tx of airdropResults.failed) {
      airdropTxs.push({
        executionLogId: savedLog.id,
        holderAddress: tx.address,
        holderBalance: tx.holderBalance?.toString() || '0',
        airdropAmount: tx.amount?.toString() || '0',
        txSignature: null,
        status: 'failed',
      });
    }

    if (airdropTxs.length > 0) {
      await db.createAirdropTransactionsBatch(airdropTxs);
    }

    // Step 11: Update last execution time
    await db.updateLastExecution(config.id);

    // Step 12: Notify user
    const rewardSym = (TROLL_REWARD_POOL.find((t) => t.mint === rewardMint) || {}).symbol
      || (rewardIsSol ? 'SOL' : 'tokens');
    const rewardLabel = rewardIsSol ? 'SOL (lamports)' : `tokens ($${rewardSym})`;
    const trollLine = config.troll_mode ? `\n👹 *Troll Mode* — this cycle's surprise reward was *$${rewardSym}*` : '';
    const successMessage = `
✅ *Execution Complete!*${trollLine}

💰 Claimed: ${(Number(feeBalance) / 1e9).toFixed(4)} SOL
🎁 Airdropped: ${airdropResults.totalSent.toString()} ${rewardLabel}
👥 Recipients: ${airdropResults.successful.length}/${holders.length} holders
⏰ Next run: ${config.interval_minutes} minutes

${airdropResults.failed.length > 0 ? `⚠️ ${airdropResults.failed.length} transfers failed` : ''}
    `;

    await notifyUser(config.user_id, successMessage);

    console.log('✅ Execution completed successfully!');
    console.log(`   Total airdropped: ${airdropResults.totalSent.toString()}`);
    console.log(`   Successful: ${airdropResults.successful.length}`);
    console.log(`   Failed: ${airdropResults.failed.length}`);

  } catch (error) {
    console.error('❌ Execution failed:', error);
    executionLog.status = 'failed';
    executionLog.errorMessage = error.message;

    // Save error log
    await db.createExecutionLog(executionLog);

    // Notify user of failure
    const errorMessage = `
❌ *Execution Failed*

Error: ${error.message}

Please check your configuration or contact support.
    `;

    await notifyUser(config.user_id, errorMessage);
  } finally {
    runningConfigs.delete(config.id);
  }
}

/**
 * Notify user via Telegram
 * @param {number} userId - Database user ID
 * @param {string} message - Message to send
 */
async function notifyUser(userId, message) {
  try {
    // Get user's telegram ID
    const result = await db.pool.query('SELECT telegram_id FROM users WHERE id = $1', [userId]);
    if (result.rows.length > 0) {
      const telegramId = result.rows[0].telegram_id;
      await sendNotification(telegramId, message);
    }
  } catch (error) {
    console.error('Error notifying user:', error);
  }
}
