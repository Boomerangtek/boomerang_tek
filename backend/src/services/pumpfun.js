import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { OnlinePumpSdk } = require('@pump-fun/pump-sdk');

import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
const sdk = new OnlinePumpSdk(connection);

/**
 * Get creator vault balance (accumulated fees) for a wallet
 * @param {string} walletPublicKey - The public key of the creator wallet
 * @returns {Promise<bigint>} - Total fees accumulated (in lamports)
 */
export async function getCreatorFees(walletPublicKey) {
  try {
    const publicKey = new PublicKey(walletPublicKey);
    const balance = await sdk.getCreatorVaultBalanceBothPrograms(publicKey);
    return BigInt(balance.toString());
  } catch (error) {
    console.error('Error getting creator fees:', error);
    throw error;
  }
}

/**
 * Claim creator fees and return transaction signature
 * @param {string} privateKey - The private key (base58 or array string)
 * @returns {Promise<string>} - Transaction signature
 */
export async function claimCreatorFees(privateKey) {
  try {
    const wallet = getKeypairFromPrivateKey(privateKey);
    
    // Get claim instructions
    const instructions = await sdk.collectCoinCreatorFeeInstructions(wallet.publicKey);
    
    // Build and send transaction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    
    const transaction = new Transaction({
      feePayer: wallet.publicKey,
      blockhash,
      lastValidBlockHeight,
    });
    
    transaction.add(...instructions);
    
    // Sign and send
    transaction.sign(wallet);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });
    
    console.log(`✅ Creator fees claimed: ${signature}`);
    return signature;
  } catch (error) {
    console.error('Error claiming creator fees:', error);
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
    // Try base58 format first
    if (!privateKey.startsWith('[')) {
      const decoded = bs58.decode(privateKey);
      return Keypair.fromSecretKey(decoded);
    }
    
    // Try array format
    const secretKey = new Uint8Array(JSON.parse(privateKey));
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    throw new Error('Invalid private key format. Expected base58 string or byte array.');
  }
}

/**
 * Get public key from private key
 * @param {string} privateKey - Base58 or JSON array string
 * @returns {string} - Public key as base58 string
 */
export function getPublicKeyFromPrivate(privateKey) {
  const keypair = getKeypairFromPrivateKey(privateKey);
  return keypair.publicKey.toBase58();
}

/**
 * Check if wallet has any unclaimed creator fees
 * @param {string} walletPublicKey - The public key to check
 * @returns {Promise<boolean>} - True if fees are available
 */
export async function hasUnclaimedFees(walletPublicKey) {
  const fees = await getCreatorFees(walletPublicKey);
  return fees > 0n;
}

export { connection };
