import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BIRDEYE_API_URL = 'https://public-api.birdeye.so';
const API_KEY = process.env.BIRDEYE_API_KEY;

// Cache for holder data to reduce API calls
const holderCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Get token holder information from Birdeye
 * @param {string} tokenAddress - Token mint address
 * @param {number} minBalance - Minimum balance to include (in smallest unit)
 * @param {number} limit - Maximum number of holders to fetch
 * @returns {Promise<Array>} - Array of holder objects
 */
export async function getTokenHolders(tokenAddress, minBalance = 0, limit = 1000) {
  try {
    // Check cache first
    const cacheKey = `${tokenAddress}-${minBalance}`;
    const cached = holderCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`📦 Using cached holder data for ${tokenAddress}`);
      return cached.data;
    }

    console.log(`🔍 Fetching token holders for ${tokenAddress}...`);

    const response = await axios.get(
      `${BIRDEYE_API_URL}/v1/token/holder`,
      {
        params: {
          address: tokenAddress,
          offset: 0,
          limit,
        },
        headers: {
          'X-API-KEY': API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.data || !response.data.data) {
      throw new Error('Invalid response from Birdeye API');
    }

    const holders = response.data.data.items
      .filter(holder => {
        // Filter by minimum balance
        const balance = BigInt(holder.amount || 0);
        return balance >= BigInt(minBalance);
      })
      .map(holder => ({
        address: holder.address,
        balance: BigInt(holder.amount || 0),
        uiAmount: holder.uiAmount || 0,
        share: holder.share || 0, // Percentage share
      }));

    console.log(`✅ Found ${holders.length} holders (filtered by min balance)`);

    // Cache the result
    holderCache.set(cacheKey, {
      data: holders,
      timestamp: Date.now(),
    });

    return holders;
  } catch (error) {
    console.error('❌ Error fetching token holders:', error.response?.data || error.message);
    throw new Error(`Failed to fetch token holders: ${error.message}`);
  }
}

/**
 * Get token price and market data
 * @param {string} tokenAddress - Token mint address
 * @returns {Promise<Object>} - Token price data
 */
export async function getTokenPrice(tokenAddress) {
  try {
    const response = await axios.get(
      `${BIRDEYE_API_URL}/defi/price`,
      {
        params: {
          address: tokenAddress,
        },
        headers: {
          'X-API-KEY': API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.data || !response.data.data) {
      throw new Error('Invalid price response from Birdeye API');
    }

    return {
      value: response.data.data.value,
      updateUnixTime: response.data.data.updateUnixTime,
      priceChange24h: response.data.data.priceChange24h,
    };
  } catch (error) {
    console.error('❌ Error fetching token price:', error.response?.data || error.message);
    throw new Error(`Failed to fetch token price: ${error.message}`);
  }
}

/**
 * Get token overview data
 * @param {string} tokenAddress - Token mint address
 * @returns {Promise<Object>} - Token overview
 */
export async function getTokenOverview(tokenAddress) {
  try {
    const response = await axios.get(
      `${BIRDEYE_API_URL}/defi/token_overview`,
      {
        params: {
          address: tokenAddress,
        },
        headers: {
          'X-API-KEY': API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.data || !response.data.data) {
      throw new Error('Invalid overview response from Birdeye API');
    }

    const data = response.data.data;
    return {
      address: data.address,
      symbol: data.symbol,
      name: data.name,
      decimals: data.decimals,
      supply: data.supply,
      price: data.price,
      marketCap: data.mc,
      liquidity: data.liquidity,
      holder: data.holder,
    };
  } catch (error) {
    console.error('❌ Error fetching token overview:', error.response?.data || error.message);
    throw new Error(`Failed to fetch token overview: ${error.message}`);
  }
}

/**
 * Clear holder cache (useful for testing or manual refresh)
 */
export function clearHolderCache() {
  holderCache.clear();
  console.log('🗑️ Holder cache cleared');
}

/**
 * Get cache statistics
 * @returns {Object} - Cache stats
 */
export function getCacheStats() {
  return {
    size: holderCache.size,
    entries: Array.from(holderCache.keys()),
  };
}
