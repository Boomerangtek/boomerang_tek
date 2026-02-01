import express from 'express';
import * as db from '../db/queries.js';
import { getSchedulerStatus } from '../scheduler/cron.js';
import * as birdeye from '../services/birdeye.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get scheduler status (for monitoring)
 */
router.get('/status', async (req, res) => {
  try {
    const schedulerStatus = getSchedulerStatus();
    const activeConfigs = await db.getActiveConfigs();

    res.json({
      scheduler: schedulerStatus,
      activeConfigs: activeConfigs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get stats for the official Boomerang token (for homepage)
 */
router.get('/boomerang-stats', async (req, res) => {
  try {
    const tokenAddress = process.env.BOOMERANG_TOKEN_ADDRESS;
    
    if (!tokenAddress || tokenAddress === 'your_boomerang_token_address_here') {
      return res.json({ error: 'Token address not configured' });
    }

    // 1. Get database stats (fees, executions)
    const stats = await db.getTokenStats(tokenAddress);
    
    // 2. Get recent executions/airdrops
    const recentExecutions = await db.getRecentExecutions(tokenAddress, 5);

    // 3. Get live market data from Birdeye
    let marketData = { price: 0, marketCap: 0 };
    try {
      const overview = await birdeye.getTokenOverview(tokenAddress);
      marketData = {
        price: overview.price,
        marketCap: overview.marketCap,
        symbol: overview.symbol,
        name: overview.name
      };
    } catch (e) {
      console.error('Failed to fetch Birdeye data for Boomerang token:', e.message);
    }

    res.json({
      address: tokenAddress,
      marketData,
      stats: {
        totalSolClaimed: stats?.total_sol_claimed || '0',
        totalAirdropped: stats?.total_airdropped || '0',
        totalExecutions: parseInt(stats?.execution_count) || 0
      },
      recentAirdrops: recentExecutions.map(e => ({
        id: e.id,
        amount: e.total_airdropped,
        holders: e.holder_count,
        time: e.execution_time,
        status: e.status
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get public stats (for landing page)
 */
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const usersResult = await db.pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total active configs
    const configsResult = await db.pool.query('SELECT COUNT(*) FROM bot_configs WHERE is_active = true');
    const activeConfigs = parseInt(configsResult.rows[0].count);

    // Get total executions
    const executionsResult = await db.pool.query('SELECT COUNT(*) FROM execution_logs WHERE status = \'success\'');
    const totalExecutions = parseInt(executionsResult.rows[0].count);

    // Get total SOL claimed (sum of all successful claims)
    const solClaimedResult = await db.pool.query(
      'SELECT SUM(claimed_sol_amount) FROM execution_logs WHERE status = \'success\' AND claimed_sol_amount IS NOT NULL'
    );
    const totalSolClaimed = solClaimedResult.rows[0].sum || 0;

    res.json({
      totalUsers,
      activeConfigs,
      totalExecutions,
      totalSolClaimed: (Number(totalSolClaimed) / 1e9).toFixed(2),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get public dashboard for a specific token
 */
router.get('/dashboard/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;

    // Get config for this token
    const config = await db.getBotConfigBySourceToken(tokenAddress);

    if (!config) {
      return res.status(404).json({ 
        error: 'Token not found',
        message: 'No active Boomerang configuration found for this token'
      });
    }

    // Get aggregated stats
    const stats = await db.getTokenStats(tokenAddress);

    // Get top recipients
    const topRecipients = await db.getTopRecipients(tokenAddress, 10);

    // Get recent executions
    const recentExecutions = await db.getRecentExecutions(tokenAddress, 10);

    res.json({
      sourceToken: {
        address: config.source_token_address,
      },
      targetToken: {
        address: config.target_token_address,
      },
      stats: {
        totalAirdropped: stats.total_airdropped || '0',
        totalBoughtBack: stats.total_bought_back || '0',
        totalSolClaimed: stats.total_sol_claimed || '0',
        totalExecutions: parseInt(stats.execution_count) || 0,
        lastExecution: stats.last_execution,
      },
      topRecipients: topRecipients.map(r => ({
        address: r.holder_address,
        totalReceived: r.total_received,
        airdropCount: parseInt(r.airdrop_count),
      })),
      recentExecutions: recentExecutions.map(e => ({
        id: e.id,
        claimedSol: e.claimed_sol_amount,
        boughtTokens: e.bought_token_amount,
        totalAirdropped: e.total_airdropped,
        holderCount: e.holder_count,
        executionTime: e.execution_time,
        status: e.status,
      })),
      config: {
        intervalMinutes: config.interval_minutes,
        isActive: config.is_active,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
