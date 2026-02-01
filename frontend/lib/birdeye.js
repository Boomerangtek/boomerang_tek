/**
 * Fetch token metadata from Birdeye API
 * @param {string} tokenAddress - Solana token address
 * @returns {Promise<Object>} Token metadata
 */
export async function getTokenMetadata(tokenAddress) {
  try {
    // Note: This requires a BIRDEYE_API_KEY
    // For now, we'll return mock data. In production, uncomment the API call below.
    
    /*
    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${tokenAddress}`,
      {
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_BIRDEYE_API_KEY || '',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch token metadata');
    }
    
    const data = await response.json();
    
    return {
      address: data.data.address,
      name: data.data.name,
      symbol: data.data.symbol,
      logo: data.data.logoURI,
      decimals: data.data.decimals,
      price: data.data.price,
      marketCap: data.data.mc,
    };
    */
    
    // Mock data for development
    return {
      address: tokenAddress,
      name: 'Token',
      symbol: shortenAddress(tokenAddress).toUpperCase(),
      logo: null,
      decimals: 9,
    };
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return {
      address: tokenAddress,
      name: 'Unknown Token',
      symbol: 'TOKEN',
      logo: null,
      decimals: 9,
    };
  }
}

function shortenAddress(address) {
  return `${address.slice(0, 4)}${address.slice(-4)}`;
}
