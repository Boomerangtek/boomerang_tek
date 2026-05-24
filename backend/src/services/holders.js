import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import dotenv from 'dotenv';

// pump.fun tokens use Token-2022, so the holder scan must target whichever
// token program actually owns the mint (classic SPL or Token-2022).

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');

// Cache holder data briefly to avoid hammering the RPC on tight intervals.
const holderCache = new Map();
const CACHE_TTL = 60000; // 1 minute

/**
 * Get all holders of an SPL token straight from the RPC — no third-party API.
 *
 * Reads every token account for the mint via getProgramAccounts (requires an
 * RPC that allows it, e.g. Helius), aggregates balances per owner, and drops
 * empty accounts. Returns the same shape the airdrop pipeline expects.
 *
 * @param {string} tokenAddress - Token mint address
 * @param {number|bigint} minBalance - Minimum (raw) balance to include
 * @returns {Promise<Array<{address: string, balance: bigint, uiAmount: number}>>}
 */
export async function getTokenHolders(tokenAddress, minBalance = 0) {
  const cacheKey = `${tokenAddress}-${minBalance}`;
  const cached = holderCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`📦 Using cached holder data for ${tokenAddress}`);
    return cached.data;
  }

  console.log(`🔍 Fetching token holders for ${tokenAddress} via RPC...`);
  const mint = new PublicKey(tokenAddress);

  // Target the program that owns the mint (classic SPL Token or Token-2022).
  const mintInfo = await connection.getAccountInfo(mint);
  const programId = mintInfo?.owner ?? TOKEN_PROGRAM_ID;

  // The mint pubkey sits at offset 0 of every token account for both programs.
  // (No dataSize filter: Token-2022 accounts vary in size due to extensions.)
  const accounts = await connection.getParsedProgramAccounts(programId, {
    filters: [{ memcmp: { offset: 0, bytes: mint.toBase58() } }],
  });

  // A single owner can hold several token accounts for the same mint — sum them.
  const byOwner = new Map();
  let decimals = 0;
  for (const { account } of accounts) {
    const info = account.data?.parsed?.info;
    if (!info) continue;
    const amount = BigInt(info.tokenAmount?.amount || '0');
    if (amount === 0n) continue;
    decimals = info.tokenAmount?.decimals ?? decimals;
    byOwner.set(info.owner, (byOwner.get(info.owner) || 0n) + amount);
  }

  const min = BigInt(minBalance || 0);
  const holders = [];
  for (const [address, balance] of byOwner) {
    if (balance < min) continue;
    holders.push({
      address,
      balance,
      uiAmount: Number(balance) / 10 ** decimals,
    });
  }

  console.log(`✅ Found ${holders.length} holders (${accounts.length} token accounts scanned)`);
  holderCache.set(cacheKey, { data: holders, timestamp: Date.now() });
  return holders;
}

export function clearHolderCache() {
  holderCache.clear();
}
