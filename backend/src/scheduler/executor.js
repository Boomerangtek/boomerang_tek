import * as db from '../db/queries.js';
import { decryptPrivateKey } from '../services/encryption.js';
import { getCreatorFees, claimCreatorFees } from '../services/pumpfun.js';
import { swapSolForToken } from '../services/jupiter.js';
import { getTokenHolders } from '../services/birdeye.js';
import { distributeTokens, calculateDistributions } from '../services/airdrop.js';
import { sendNotification } from '../bot/telegram.js';

/**
 * Execute bot configuration - claim fees, swap, and airdrop
 * @param {Object} config - Bot configuration from database
 */
export async function executeBotConfig(config) {
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

    executionLog.claimedSolAmount = feeBalance.toString();

    // Step 3: Claim fees
    console.log('💸 Claiming creator fees...');
    const claimSignature = await claimCreatorFees(privateKey);
    console.log(`   Claim TX: ${claimSignature}`);

    // Step 4: Calculate swap amount (keep 5% for transaction fees)
    const swapAmount = Number(feeBalance) * 0.95;
    const swapAmountLamports = Math.floor(swapAmount);

    console.log(`💱 Swapping ${swapAmountLamports} lamports for ${config.target_token_address}...`);

    // Step 5: Swap SOL for target token
    const swapResult = await swapSolForToken(
      privateKey,
      config.target_token_address,
      swapAmountLamports,
      config.slippage_bps
    );

    executionLog.boughtTokenAmount = swapResult.outputAmount.toString();
    console.log(`   Bought ${swapResult.outputAmount.toString()} tokens`);
    console.log(`   Swap TX: ${swapResult.signature}`);

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
      swapResult.outputAmount,
      1n // Min 1 token per holder
    );

    // Step 8: Execute airdrops
    console.log('🎁 Starting airdrop distribution...');
    const airdropResults = await distributeTokens(
      privateKey,
      config.target_token_address,
      distributions
    );

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
    const successMessage = `
✅ *Execution Complete!*

💰 Claimed: ${(Number(feeBalance) / 1e9).toFixed(4)} SOL
💱 Bought: ${airdropResults.totalSent.toString()} tokens
👥 Airdropped to: ${airdropResults.successful.length}/${holders.length} holders
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
