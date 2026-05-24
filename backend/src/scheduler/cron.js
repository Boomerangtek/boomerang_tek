import cron from 'node-cron';
import * as db from '../db/queries.js';
import { executeBotConfig } from './executor.js';
import { tickVoteCycles } from '../services/voteService.js';

// Store active cron jobs
const activeCronJobs = new Map();

/**
 * Initialize scheduler and load all active configs
 */
export async function initScheduler() {
  console.log('⏰ Initializing scheduler...');

  try {
    const activeConfigs = await db.getActiveBotConfigs();
    console.log(`   Found ${activeConfigs.length} active configurations`);

    for (const config of activeConfigs) {
      scheduleConfig(config);
    }

    // Also set up a periodic check for new/updated configs every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      console.log('🔄 Checking for configuration updates...');
      await refreshScheduler();
    });

    // Vote-cycle housekeeping: open/resolve community-vote cycles every 5 min.
    cron.schedule('*/5 * * * *', async () => {
      try {
        await tickVoteCycles();
      } catch (e) {
        console.error('Vote cycle tick failed:', e.message);
      }
    });
    // Run once on boot so vote-mode configs get an open cycle immediately.
    tickVoteCycles().catch((e) => console.error('Initial vote tick failed:', e.message));

    console.log('✅ Scheduler initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize scheduler:', error);
    throw error;
  }
}

/**
 * Schedule a single bot configuration
 * @param {Object} config - Bot configuration
 */
export function scheduleConfig(config) {
  const configId = config.id;

  // Stop existing job if any
  if (activeCronJobs.has(configId)) {
    activeCronJobs.get(configId).stop();
    activeCronJobs.delete(configId);
  }

  if (!config.is_active) {
    console.log(`   ⏸️  Config ${configId} is paused, skipping`);
    return;
  }

  const cronExpression = getCronExpression(config.interval_minutes);
  console.log(`   ⏱️  Scheduling config ${configId} with interval: ${config.interval_minutes} min (${cronExpression})`);

  const job = cron.schedule(cronExpression, async () => {
    console.log(`\n⏰ Cron triggered for config ${configId}`);
    try {
      await executeBotConfig(config);
    } catch (error) {
      console.error(`❌ Error executing config ${configId}:`, error);
    }
  });

  activeCronJobs.set(configId, job);
}

/**
 * Refresh scheduler with updated configs from database
 */
export async function refreshScheduler() {
  try {
    const activeConfigs = await db.getActiveBotConfigs();
    const activeConfigIds = new Set(activeConfigs.map(c => c.id));

    // Remove jobs for configs that no longer exist or are inactive
    for (const [configId, job] of activeCronJobs.entries()) {
      if (!activeConfigIds.has(configId)) {
        console.log(`   🗑️  Removing job for config ${configId}`);
        job.stop();
        activeCronJobs.delete(configId);
      }
    }

    // Add/update jobs for active configs
    for (const config of activeConfigs) {
      scheduleConfig(config);
    }

    console.log(`✅ Scheduler refreshed: ${activeCronJobs.size} active jobs`);
  } catch (error) {
    console.error('❌ Error refreshing scheduler:', error);
  }
}

/**
 * Get cron expression from interval in minutes
 * @param {number} minutes - Interval in minutes
 * @returns {string} - Cron expression
 */
function getCronExpression(minutes) {
  if (minutes === 1) return '* * * * *';
  if (minutes === 2) return '*/2 * * * *';
  if (minutes === 5) return '*/5 * * * *';
  if (minutes === 10) return '*/10 * * * *';
  if (minutes === 30) return '*/30 * * * *';
  if (minutes === 60) return '0 * * * *';
  
  // For other values, try to create appropriate expression
  if (minutes < 60) {
    return `*/${minutes} * * * *`;
  } else {
    const hours = Math.floor(minutes / 60);
    return `0 */${hours} * * *`;
  }
}

/**
 * Get scheduler status
 * @returns {Object} - Status information
 */
export function getSchedulerStatus() {
  return {
    activeJobs: activeCronJobs.size,
    configIds: Array.from(activeCronJobs.keys()),
  };
}

/**
 * Stop all scheduled jobs
 */
export function stopScheduler() {
  console.log('🛑 Stopping all scheduled jobs...');
  
  for (const [configId, job] of activeCronJobs.entries()) {
    job.stop();
    console.log(`   Stopped job for config ${configId}`);
  }
  
  activeCronJobs.clear();
  console.log('✅ Scheduler stopped');
}
