import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getMint,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');

// SPL transfers (+ possible ATA creation) are heavy, so keep batches small;
// native SOL transfers are tiny, so a batch can hold many more.
const SPL_BATCH_SIZE = 5;
const SOL_BATCH_SIZE = 12;
const DELAY_BETWEEN_BATCHES = 1000;

/** Whichever token program owns a mint (classic SPL or Token-2022). */
async function getMintProgramId(mintPubkey) {
  const info = await connection.getAccountInfo(mintPubkey);
  return info?.owner ?? TOKEN_PROGRAM_ID;
}

/**
 * Distribute an SPL / Token-2022 token to many holders proportionally.
 * Works for either token program — it detects the one owning the mint.
 * @param {string} privateKey - Sender's private key
 * @param {string} tokenMint - Reward token mint address
 * @param {Array<{address: string, amount: bigint}>} distributions
 * @returns {Promise<{successful: Array, failed: Array, totalSent: bigint}>}
 */
export async function distributeTokens(privateKey, tokenMint, distributions) {
  const wallet = getKeypairFromPrivateKey(privateKey);
  const mintPubkey = new PublicKey(tokenMint);
  const programId = await getMintProgramId(mintPubkey);
  const mint = await getMint(connection, mintPubkey, 'confirmed', programId);

  console.log(`🎁 Airdropping ${tokenMint} (program ${programId.toBase58()}) to ${distributions.length} holders...`);

  const senderATA = await getAssociatedTokenAddress(
    mintPubkey,
    wallet.publicKey,
    false,
    programId,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const results = { successful: [], failed: [], totalSent: 0n };

  for (let i = 0; i < distributions.length; i += SPL_BATCH_SIZE) {
    const batch = distributions.slice(i, i + SPL_BATCH_SIZE);
    const batchNumber = Math.floor(i / SPL_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(distributions.length / SPL_BATCH_SIZE);
    console.log(`📦 Token batch ${batchNumber}/${totalBatches} (${batch.length})...`);

    const transaction = new Transaction();
    const included = [];

    for (const dist of batch) {
      try {
        if (BigInt(dist.amount) <= 0n) {
          results.failed.push({ ...dist, error: 'Amount must be greater than 0' });
          continue;
        }
        const recipient = new PublicKey(dist.address);
        const recipientATA = await getAssociatedTokenAddress(
          mintPubkey,
          recipient,
          false,
          programId,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const accountInfo = await connection.getAccountInfo(recipientATA);
        if (!accountInfo) {
          transaction.add(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey,
              recipientATA,
              recipient,
              mintPubkey,
              programId,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }

        transaction.add(
          createTransferCheckedInstruction(
            senderATA,
            mintPubkey,
            recipientATA,
            wallet.publicKey,
            BigInt(dist.amount),
            mint.decimals,
            [],
            programId
          )
        );
        included.push(dist);
      } catch (error) {
        results.failed.push({ ...dist, error: error.message });
      }
    }

    await sendBatch(transaction, wallet, included, results, batchNumber);

    if (i + SPL_BATCH_SIZE < distributions.length) await sleep(DELAY_BETWEEN_BATCHES);
  }

  logAirdropSummary(results);
  return results;
}

/**
 * Distribute native SOL to many holders proportionally (used when the reward
 * token is SOL itself — no swap, no token accounts, just system transfers).
 * @param {string} privateKey - Sender's private key
 * @param {Array<{address: string, amount: bigint}>} distributions
 * @returns {Promise<{successful: Array, failed: Array, totalSent: bigint}>}
 */
export async function distributeSol(privateKey, distributions) {
  const wallet = getKeypairFromPrivateKey(privateKey);
  console.log(`🎁 Airdropping native SOL to ${distributions.length} holders...`);

  const results = { successful: [], failed: [], totalSent: 0n };

  for (let i = 0; i < distributions.length; i += SOL_BATCH_SIZE) {
    const batch = distributions.slice(i, i + SOL_BATCH_SIZE);
    const batchNumber = Math.floor(i / SOL_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(distributions.length / SOL_BATCH_SIZE);
    console.log(`📦 SOL batch ${batchNumber}/${totalBatches} (${batch.length})...`);

    const transaction = new Transaction();
    const included = [];

    for (const dist of batch) {
      try {
        if (BigInt(dist.amount) <= 0n) {
          results.failed.push({ ...dist, error: 'Amount must be greater than 0' });
          continue;
        }
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(dist.address),
            lamports: BigInt(dist.amount),
          })
        );
        included.push(dist);
      } catch (error) {
        results.failed.push({ ...dist, error: error.message });
      }
    }

    await sendBatch(transaction, wallet, included, results, batchNumber);

    if (i + SOL_BATCH_SIZE < distributions.length) await sleep(DELAY_BETWEEN_BATCHES);
  }

  logAirdropSummary(results);
  return results;
}

/** Send one prepared batch and record per-recipient success/failure. */
async function sendBatch(transaction, wallet, included, results, batchNumber) {
  if (transaction.instructions.length === 0) return;
  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet], {
      commitment: 'confirmed',
      skipPreflight: false,
    });
    console.log(`   ✅ Batch ${batchNumber} confirmed: ${signature}`);
    for (const dist of included) {
      results.successful.push({ ...dist, signature });
      results.totalSent += BigInt(dist.amount);
    }
  } catch (error) {
    console.error(`   ❌ Batch ${batchNumber} failed:`, error.message);
    for (const dist of included) {
      results.failed.push({ ...dist, error: `Transaction failed: ${error.message}` });
    }
  }
}

function logAirdropSummary(results) {
  console.log('✅ Airdrop complete!');
  console.log(`   Successful: ${results.successful.length}`);
  console.log(`   Failed: ${results.failed.length}`);
  console.log(`   Total sent: ${results.totalSent.toString()}`);
}

/**
 * Calculate proportional distribution amounts
 * @param {Array} holders - Array of {address, balance} objects
 * @param {bigint} totalToDistribute - Total amount to distribute
 * @param {bigint} minAmount - Minimum amount per holder (optional)
 * @returns {Array} - Array of {address, amount} distributions
 */
export function calculateDistributions(holders, totalToDistribute, minAmount = 0n) {
  const total = BigInt(totalToDistribute);
  const totalHoldings = holders.reduce((sum, h) => sum + BigInt(h.balance), 0n);

  if (totalHoldings === 0n) {
    throw new Error('Total holdings cannot be zero');
  }

  // Pure integer math: amount = total * holderBalance / totalHoldings.
  // Doing this with bigint avoids the precision loss of Number() on large
  // token amounts (which silently rounds beyond 2^53).
  let distributions = holders
    .map(holder => {
      const holderBalance = BigInt(holder.balance);
      const amount = (total * holderBalance) / totalHoldings;

      return {
        address: holder.address,
        holderBalance,
        amount,
      };
    })
    .filter(dist => dist.amount >= BigInt(minAmount));

  // Integer division leaves a remainder (dust). Assign it to the largest
  // holder so the full received amount is distributed and nothing is stranded
  // in the dev wallet.
  const allocated = distributions.reduce((sum, d) => sum + d.amount, 0n);
  const remainder = total - allocated;
  if (remainder > 0n && distributions.length > 0) {
    let largest = distributions[0];
    for (const dist of distributions) {
      if (dist.holderBalance > largest.holderBalance) largest = dist;
    }
    largest.amount += remainder;
  }

  console.log(`📊 Calculated ${distributions.length} distributions from ${holders.length} holders`);
  console.log(`   Min amount: ${BigInt(minAmount).toString()}`);
  console.log(`   Total to distribute: ${total.toString()}`);
  console.log(`   Remainder reassigned: ${remainder.toString()}`);

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
