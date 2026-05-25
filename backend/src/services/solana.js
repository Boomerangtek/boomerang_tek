import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');

/**
 * Get SOL balance for a wallet
 * @param {string} walletAddress - Wallet public key
 * @returns {Promise<number>} - Balance in SOL
 */
export async function getSolBalance(walletAddress) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    throw error;
  }
}

/**
 * Get token balance for a wallet
 * @param {string} walletAddress - Wallet public key
 * @param {string} tokenMint - Token mint address
 * @returns {Promise<bigint>} - Token balance
 */
export async function getTokenBalance(walletAddress, tokenMint) {
  try {
    const walletPubkey = new PublicKey(walletAddress);
    const mintPubkey = new PublicKey(tokenMint);

    // Get associated token account
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: mintPubkey }
    );

    if (tokenAccounts.value.length === 0) {
      return 0n;
    }

    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount;
    return BigInt(balance);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0n;
  }
}

/**
 * UI-amount token balance for a wallet (sums all its accounts for the mint;
 * works for classic SPL and Token-2022). Returns 0 on error.
 * @param {string} walletAddress
 * @param {string} tokenMint
 * @returns {Promise<number>}
 */
export async function getTokenUiBalance(walletAddress, tokenMint) {
  try {
    const accounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { mint: new PublicKey(tokenMint) }
    );
    let total = 0;
    for (const { account } of accounts.value) {
      total += account.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
    }
    return total;
  } catch (error) {
    console.error('Error getting token UI balance:', error);
    return 0;
  }
}

/**
 * Verify a transaction signature
 * @param {string} signature - Transaction signature
 * @returns {Promise<boolean>} - True if confirmed
 */
export async function verifyTransaction(signature) {
  try {
    const status = await connection.getSignatureStatus(signature);
    return status?.value?.confirmationStatus === 'confirmed' ||
           status?.value?.confirmationStatus === 'finalized';
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
}

/**
 * Get recent transactions for a wallet
 * @param {string} walletAddress - Wallet public key
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<Array>} - Array of transaction signatures
 */
export async function getRecentTransactions(walletAddress, limit = 10) {
  try {
    const publicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
    return signatures.map(sig => ({
      signature: sig.signature,
      slot: sig.slot,
      blockTime: sig.blockTime,
      err: sig.err,
    }));
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    throw error;
  }
}

export { connection };
