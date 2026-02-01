'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PerformanceChart from '../../components/PerformanceChart';

export default function TokenDashboard() {
  const params = useParams();
  const tokenAddress = params.tokenAddress;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenMetadata, setTokenMetadata] = useState({ source: null, target: null });
  const [timeRange, setTimeRange] = useState('1m');

  useEffect(() => {
    fetchDashboardData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [tokenAddress]);

  async function fetchDashboardData() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/dashboard/${tokenAddress}`);
      
      if (!response.ok) {
        throw new Error('Token not found or not active');
      }
      
      const dashboardData = await response.json();
      setData(dashboardData);

      // Fetch token metadata from Birdeye
      fetchTokenMetadata(dashboardData.sourceToken.address, dashboardData.targetToken.address);
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function fetchTokenMetadata(sourceAddress, targetAddress) {
    try {
      // Fetch metadata for both tokens
      const [sourceMeta, targetMeta] = await Promise.all([
        fetchBirdeyeMetadata(sourceAddress),
        fetchBirdeyeMetadata(targetAddress),
      ]);

      setTokenMetadata({
        source: sourceMeta,
        target: targetMeta,
      });
    } catch (err) {
      console.error('Error fetching token metadata:', err);
    }
  }

  async function fetchBirdeyeMetadata(address) {
    try {
      // In production, you'd fetch from Birdeye API
      // For now, return simplified data
      return {
        name: 'Token',
        symbol: shortenAddress(address).toUpperCase(),
        logo: null,
      };
    } catch (err) {
      return {
        name: 'Unknown',
        symbol: 'TKN',
        logo: null,
      };
    }
  }

  function shortenAddress(address) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="text-center bg-white rounded-2xl p-12 shadow-lg border border-gray-200">
          <div className="animate-spin text-6xl mb-4">🪃</div>
          <p className="text-lg font-semibold text-gray-700">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching live data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200 max-w-md text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Token Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            This token doesn't have an active Boomerang configuration yet.
          </p>
          <Link href="/" className="inline-block bg-gradient-to-r from-orange-500 to-blue-500 text-white font-semibold py-3 px-8 rounded-full hover:shadow-xl hover:scale-105 transition-all">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-6">
        {/* Token Pair Header - Proxima Style */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/40 shadow-xl shadow-sky-900/5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-purple-500/20">
                💎
              </div>
              <p className="text-sm font-black text-slate-900 tracking-tight">{tokenMetadata.source?.symbol || 'Source'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{shortenAddress(data.sourceToken.address)}</p>
            </div>
            
            <div className="text-4xl text-orange-500 animate-pulse">→</div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-blue-500/20">
                🎯
              </div>
              <p className="text-sm font-black text-slate-900 tracking-tight">{tokenMetadata.target?.symbol || 'Target'}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{shortenAddress(data.targetToken.address)}</p>
            </div>
          </div>
        </div>

        {/* Top Stats Bar - Proxima Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total SOL Claimed */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total P&L</span>
              <span className="text-xs text-green-600 font-semibold">↗ Live</span>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">
              +{(Number(data.stats.totalSolClaimed) / 1e9).toFixed(2)} SOL
            </p>
            <p className="text-xs text-gray-500">Claimed from PumpFun</p>
          </div>

          {/* Total Executions */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Launch</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mb-1">
              {data.stats.totalExecutions}
            </p>
            <p className="text-xs text-gray-500">Distributions executed</p>
          </div>

          {/* Total Bought Back */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyback Volume</span>
            </div>
            <p className="text-3xl font-bold text-orange-500 mb-1">
              {formatNumber(data.stats.totalBoughtBack)}
            </p>
            <p className="text-xs text-gray-500">Tokens purchased</p>
          </div>

          {/* Total Airdropped */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Distributed</span>
              <span className="text-xs text-blue-600 font-semibold">100%</span>
            </div>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              {formatNumber(data.stats.totalAirdropped)}
            </p>
            <p className="text-xs text-gray-500">To token holders</p>
          </div>
        </div>

        {/* Performance Chart Section - Like Proxima */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Chart - Larger area like Proxima */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Total Performance</h2>
              <div className="flex gap-2">
                {['1w', '1m', '1y', 'All'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      timeRange === range
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            {data.recentExecutions.length > 0 ? (
              <PerformanceChart data={data.recentExecutions} timeRange={timeRange} />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                No execution data yet
              </div>
            )}
          </div>

          {/* Affiliate Stats - Like Proxima's side panel */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Distribution Stats
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Affiliate Revenue</p>
                <p className="text-2xl font-bold text-orange-500">
                  {(Number(data.stats.totalSolClaimed) / 1e9).toFixed(2)} SOL
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Holders</p>
                <p className="text-2xl font-bold text-gray-800">
                  {data.topRecipients.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.stats.totalExecutions > 0 ? '100%' : '0%'}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Interval</p>
                <p className="text-sm font-semibold text-gray-800">
                  Every {data.config.intervalMinutes} minutes
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  data.config.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {data.config.isActive ? '● Active' : '○ Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Like Proxima's layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Recipients - Proxima-inspired clean table */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Top Recipients</h2>
              <span className="text-xs text-gray-500">{data.topRecipients.length} holders</span>
            </div>
            <div className="space-y-2">
              {data.topRecipients.map((recipient, index) => (
                <div key={recipient.address} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-mono text-sm text-gray-700">{shortenAddress(recipient.address)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{formatNumber(recipient.totalReceived)}</p>
                    <p className="text-xs text-gray-500">{recipient.airdropCount} drops</p>
                  </div>
                </div>
              ))}
              {data.topRecipients.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <div className="text-4xl mb-2">🎁</div>
                  <p>No airdrops yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity - Cleaner list style */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
              <span className="text-xs text-gray-500">{data.recentExecutions.length} executions</span>
            </div>
            <div className="space-y-2">
              {data.recentExecutions.map((execution) => (
                <div key={execution.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        execution.status === 'success' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {execution.status === 'success' ? '✓' : '✗'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(execution.executionTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-green-600">
                      +{(Number(execution.claimedSol) / 1e9).toFixed(3)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {formatNumber(execution.totalAirdropped)} tokens
                    </span>
                    <span className="text-gray-500">
                      to {execution.holderCount} holders
                    </span>
                  </div>
                </div>
              ))}
              {data.recentExecutions.length === 0 && (
                <div className="py-12 text-center text-gray-400">
                  <div className="text-4xl mb-2">📊</div>
                  <p>No executions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Stats Bar */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-6 text-xs text-gray-500 bg-white rounded-full px-6 py-3 border border-gray-200 shadow-sm">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">Last execution:</span>
              {data.stats.lastExecution 
                ? new Date(data.stats.lastExecution).toLocaleString() 
                : 'Never'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="font-semibold text-gray-700">Next:</span>
              {data.config.intervalMinutes} min
            </span>
            <span>•</span>
            <span className="text-gray-400">
              Updated {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="mt-12 py-6 text-center border-t border-gray-200 bg-white/50">
        <p className="text-sm text-gray-600">
          Powered by <Link href="/" className="font-semibold text-orange-500 hover:underline">Boomerang 🪃</Link>
        </p>
      </footer>
    </div>
  );
}
