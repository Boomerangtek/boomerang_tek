import { Connection, Keypair, VersionedTransaction, PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import axios from 'axios';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';

// Native SOL mint address
const SOL_MINT = 'So11111111111111111111111111111111111111112';

/**
 * Read the SPL token balance of a wallet's associated token account.
 * Returns 0n if the account does not exist yet.
 * @param {PublicKey} owner - Wallet public key
 * @param {string} mint - Token mint address
 * @returns {Promise<bigint>} - Raw token balance
 */
async function getTokenBalance(owner, mint) {
  try {
    const mintPubkey = new PublicKey(mint);
    // Use whichever token program owns the mint (classic SPL or Token-2022).
    const mintInfo = await connection.getAccountInfo(mintPubkey);
    const programId = mintInfo?.owner ?? TOKEN_PROGRAM_ID;
    const ata = await getAssociatedTokenAddress(
      mintPubkey,
      owner,
      false,
      programId,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const balance = await connection.getTokenAccountBalance(ata);
    return BigInt(balance.value.amount);
  } catch (error) {
    // Account does not exist / not yet created
    return 0n;
  }
}

/**
 * Get a quote for swapping tokens
 * @param {string} inputMint - Input token mint address
 * @param {string} outputMint - Output token mint address
 * @param {number} amount - Amount in smallest unit (lamports/tokens)
 * @param {number} slippageBps - Slippage in basis points (100 = 1%)
 * @returns {Promise<Object>} - Quote data
 */
async function getQuote(inputMint, outputMint, amount, slippageBps = 100) {
  try {
    const params = {
      inputMint,
      outputMint,
      amount,
      slippageBps,
      onlyDirectRoutes: false,
      asLegacyTransaction: false,
    };

    const response = await axios.get(`${JUPITER_API_URL}/quote`, { params });
    return response.data;
  } catch (error) {
    console.error('Error getting Jupiter quote:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get swap transaction from Jupiter
 * @param {Object} quote - Quote object from getQuote
 * @param {string} userPublicKey - User's wallet public key
 * @returns {Promise<string>} - Serialized transaction
 */
async function getSwapTransaction(quote, userPublicKey) {
  try {
    const response = await axios.post(`${JUPITER_API_URL}/swap`, {
      quoteResponse: quote,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    });

    return response.data.swapTransaction;
  } catch (error) {
    console.error('Error getting swap transaction:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Swap SOL for a token via Jupiter
 * @param {string} privateKey - Wallet private key
 * @param {string} outputMint - Token to buy
 * @param {number} solAmount - Amount of SOL to swap (in lamports)
 * @param {number} slippageBps - Slippage tolerance in basis points
 * @returns {Promise<Object>} - Result with signature and output amount
 */
export async function swapSolForToken(privateKey, outputMint, solAmount, slippageBps = 100) {
  try {
    const wallet = getKeypairFromPrivateKey(privateKey);
    
    console.log(`🔄 Getting quote for ${solAmount} lamports SOL -> ${outputMint}...`);
    
    // Get quote
    const quote = await getQuote(SOL_MINT, outputMint, solAmount, slippageBps);
    
    const outAmount = quote.outAmount;
    console.log(`📊 Quote received: ${outAmount} tokens (${quote.priceImpactPct}% price impact)`);

    // Snapshot the output token balance before the swap so we can measure
    // the *actual* amount received (the quote is only an estimate; slippage
    // means the real amount can be lower). Distributing on the quote risks
    // trying to airdrop more tokens than we hold.
    const balanceBefore = await getTokenBalance(wallet.publicKey, outputMint);

    // Get swap transaction
    const swapTransactionBuf = await getSwapTransaction(quote, wallet.publicKey.toString());

    // Deserialize and sign transaction
    const transactionBuf = Buffer.from(swapTransactionBuf, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuf);
    transaction.sign([wallet]);

    // Send transaction
    const rawTransaction = transaction.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2,
    });

    console.log(`📤 Transaction sent: ${signature}`);

    // Confirm transaction
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    }, 'confirmed');

    console.log(`✅ Swap confirmed: ${signature}`);

    // Measure the real amount received from the on-chain balance delta.
    // Fall back to the quote if the delta can't be read for any reason.
    const balanceAfter = await getTokenBalance(wallet.publicKey, outputMint);
    const received = balanceAfter - balanceBefore;
    const outputAmount = received > 0n ? received : BigInt(outAmount);

    if (received !== BigInt(outAmount)) {
      console.log(`📊 Actual received: ${received.toString()} (quote was ${outAmount})`);
    }

    return {
      signature,
      inputAmount: solAmount,
      outputAmount,
      quotedAmount: BigInt(outAmount),
      outputMint,
    };
  } catch (error) {
    console.error('❌ Error swapping SOL for token:', error);
    throw error;
  }
}

/**
 * Swap any token for another token via Jupiter
 * @param {string} privateKey - Wallet private key
 * @param {string} inputMint - Input token mint
 * @param {string} outputMint - Output token mint
 * @param {number} amount - Amount to swap in smallest unit
 * @param {number} slippageBps - Slippage tolerance
 * @returns {Promise<Object>} - Result with signature and amounts
 */
export async function swapTokens(privateKey, inputMint, outputMint, amount, slippageBps = 100) {
  try {
    const wallet = getKeypairFromPrivateKey(privateKey);
    
    console.log(`🔄 Getting quote for ${amount} of ${inputMint} -> ${outputMint}...`);
    
    // Get quote
    const quote = await getQuote(inputMint, outputMint, amount, slippageBps);
    
    const outAmount = quote.outAmount;
    console.log(`📊 Quote received: ${outAmount} tokens`);
    
    // Get swap transaction
    const swapTransactionBuf = await getSwapTransaction(quote, wallet.publicKey.toString());
    
    // Deserialize and sign transaction
    const transactionBuf = Buffer.from(swapTransactionBuf, 'base64');
    const transaction = VersionedTransaction.deserialize(transactionBuf);
    transaction.sign([wallet]);
    
    // Send transaction
    const rawTransaction = transaction.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2,
    });
    
    console.log(`📤 Transaction sent: ${signature}`);
    
    // Confirm transaction
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    }, 'confirmed');
    
    console.log(`✅ Swap confirmed: ${signature}`);
    
    return {
      signature,
      inputAmount: amount,
      outputAmount: BigInt(outAmount),
      outputMint,
    };
  } catch (error) {
    console.error('❌ Error swapping tokens:', error);
    throw error;
  }
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

export { connection };
