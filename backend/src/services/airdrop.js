import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');

// Batch configuration
const BATCH_SIZE = 5; // Number of recipients per transaction (conservative to avoid size limits)
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches

/**
 * Distribute tokens to multiple holders proportionally
 * @param {string} privateKey - Sender's private key
 * @param {string} tokenMint - Token mint address
 * @param {Array} distributions - Array of {address, amount} objects
 * @returns {Promise<Object>} - Results with successful and failed transfers
 */
export async function distributeTokens(privateKey, tokenMint, distributions) {
  try {
    const wallet = getKeypairFromPrivateKey(privateKey);
    const mintPubkey = new PublicKey(tokenMint);

    console.log(`🎁 Starting airdrop to ${distributions.length} holders...`);

    // Get sender's associated token account
    const senderATA = await getAssociatedTokenAddress(
      mintPubkey,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Process in batches
    const results = {
      successful: [],
      failed: [],
      totalSent: 0n,
    };

    for (let i = 0; i < distributions.length; i += BATCH_SIZE) {
      const batch = distributions.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(distributions.length / BATCH_SIZE);

      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} recipients)...`);

      try {
        const batchResult = await processBatch(
          wallet,
          mintPubkey,
          senderATA,
          batch,
          batchNumber
        );

        results.successful.push(...batchResult.successful);
        results.failed.push(...batchResult.failed);
        results.totalSent += batchResult.totalSent;

        // Delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < distributions.length) {
          await sleep(DELAY_BETWEEN_BATCHES);
        }
      } catch (error) {
        console.error(`❌ Batch ${batchNumber} failed:`, error.message);
        // Mark all in batch as failed
        batch.forEach(dist => {
          results.failed.push({
            ...dist,
            error: error.message,
          });
        });
      }
    }

    console.log(`✅ Airdrop complete!`);
    console.log(`   Successful: ${results.successful.length}`);
    console.log(`   Failed: ${results.failed.length}`);
    console.log(`   Total sent: ${results.totalSent.toString()} tokens`);

    return results;
  } catch (error) {
    console.error('❌ Airdrop failed:', error);
    throw error;
  }
}

/**
 * Process a single batch of airdrop transfers
 * @param {Keypair} wallet - Sender wallet
 * @param {PublicKey} mintPubkey - Token mint
 * @param {PublicKey} senderATA - Sender's associated token account
 * @param {Array} batch - Batch of distributions
 * @param {number} batchNumber - Batch number for logging
 * @returns {Promise<Object>} - Batch results
 */
async function processBatch(wallet, mintPubkey, senderATA, batch, batchNumber) {
  const transaction = new Transaction();
  const results = {
    successful: [],
    failed: [],
    totalSent: 0n,
  };

  // Prepare all recipient ATAs and instructions
  for (const dist of batch) {
    try {
      if (dist.amount <= 0n) {
        results.failed.push({
          ...dist,
          error: 'Amount must be greater than 0',
        });
        continue;
      }

      const recipientPubkey = new PublicKey(dist.address);
      const recipientATA = await getAssociatedTokenAddress(
        mintPubkey,
        recipientPubkey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Check if recipient ATA exists
      const accountInfo = await connection.getAccountInfo(recipientATA);

      if (!accountInfo) {
        // Create ATA instruction
        transaction.add(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            recipientATA,
            recipientPubkey,
            mintPubkey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          senderATA,
          recipientATA,
          wallet.publicKey,
          BigInt(dist.amount),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      results.totalSent += BigInt(dist.amount);
    } catch (error) {
      console.error(`Error preparing transfer for ${dist.address}:`, error.message);
      results.failed.push({
        ...dist,
        error: error.message,
      });
    }
  }

  // Send transaction if there are instructions
  if (transaction.instructions.length > 0) {
    try {
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [wallet],
        {
          commitment: 'confirmed',
          skipPreflight: false,
        }
      );

      console.log(`   ✅ Batch ${batchNumber} confirmed: ${signature}`);

      // Mark all as successful (that weren't already marked as failed)
      batch.forEach(dist => {
        if (!results.failed.find(f => f.address === dist.address)) {
          results.successful.push({
            ...dist,
            signature,
          });
        }
      });
    } catch (error) {
      console.error(`Transaction failed for batch ${batchNumber}:`, error.message);
      // Mark all as failed
      batch.forEach(dist => {
        if (!results.failed.find(f => f.address === dist.address)) {
          results.failed.push({
            ...dist,
            error: `Transaction failed: ${error.message}`,
          });
        }
      });
    }
  }

  return results;
}

/**
 * Calculate proportional distribution amounts
 * @param {Array} holders - Array of {address, balance} objects
 * @param {bigint} totalToDistribute - Total amount to distribute
 * @param {bigint} minAmount - Minimum amount per holder (optional)
 * @returns {Array} - Array of {address, amount} distributions
 */
export function calculateDistributions(holders, totalToDistribute, minAmount = 0n) {
  const totalHoldings = holders.reduce((sum, h) => sum + BigInt(h.balance), 0n);

  if (totalHoldings === 0n) {
    throw new Error('Total holdings cannot be zero');
  }

  const distributions = holders
    .map(holder => {
      const holderBalance = BigInt(holder.balance);
      const proportion = Number(holderBalance) / Number(totalHoldings);
      const amount = BigInt(Math.floor(Number(totalToDistribute) * proportion));

      return {
        address: holder.address,
        holderBalance: holderBalance,
        amount,
      };
    })
    .filter(dist => dist.amount >= minAmount);

  console.log(`📊 Calculated ${distributions.length} distributions from ${holders.length} holders`);
  console.log(`   Min amount: ${minAmount.toString()}`);
  console.log(`   Total to distribute: ${totalToDistribute.toString()}`);

  return distributions;
}

/**
 * Convert private key string to Keypair
 * @param {string} privateKey - Base58 or JSON array string
 * @returns {Keypair} - Solana Keypair object
 */
function getKeypairFromPrivateKey(privateKey) {
  try {
    if (!privateKey.startsWith('[')) {
      const decoded = bs58.decode(privateKey);
      return Keypair.fromSecretKey(decoded);
    }

    const secretKey = new Uint8Array(JSON.parse(privateKey));
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    throw new Error('Invalid private key format');
  }
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { connection };
