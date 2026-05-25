import { Connection, PublicKey } from '@solana/web3.js';
import { BOOMERANG_MINT } from './missionConfig';

const RPC = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';

/**
 * UI-amount balance of a token held by a wallet (sums all its token accounts
 * for that mint — works for classic SPL and Token-2022). Server-side only.
 */
export async function getTokenUiBalance(wallet, mint) {
  const conn = new Connection(RPC, 'confirmed');
  const owner = new PublicKey(wallet);
  const mintPk = new PublicKey(mint);
  // Retry once on transient RPC errors so a single hiccup doesn't read as 0.
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const accounts = await conn.getParsedTokenAccountsByOwner(owner, { mint: mintPk });
      let total = 0;
      for (const { account } of accounts.value) {
        total += account.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
      }
      return total;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw lastErr;
}

export const getBoomerangBalance = (wallet) => getTokenUiBalance(wallet, BOOMERANG_MINT);
