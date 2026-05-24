import express from 'express';
import dotenv from 'dotenv';
import { initBot } from './bot/telegram.js';
import { initScheduler } from './scheduler/cron.js';
import routes from './api/routes.js';
import * as middleware from './api/middleware.js';
import pool from './db/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Keep the bot alive: a stray RPC error (e.g. a 429 from a WS callback or a
// failed swap/airdrop) must not crash the whole scheduler. Log and continue —
// the affected config simply retries on its next cycle.
process.on('unhandledRejection', (reason) => {
  console.error('⚠️  Unhandled rejection (process kept alive):', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught exception (process kept alive):', err?.message || err);
});

// Middleware
app.use(express.json());
app.use(middleware.cors);
app.use(middleware.requestLogger);

// Routes
app.use('/api', routes);

// 404 handler
app.use(middleware.notFoundHandler);

// Error handler
app.use(middleware.errorHandler);

/**
 * Initialize and start the application
 */
async function start() {
  try {
    console.log('🪃 Starting Boomerang...');
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Solana Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);

    // Test database connection
    console.log('📊 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Start Express server first
    app.listen(PORT, () => {
      console.log(`✅ API server listening on port ${PORT}`);
      console.log(`   API: http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Status: http://localhost:${PORT}/api/status`);
      console.log(`   Stats: http://localhost:${PORT}/api/stats`);
    });

    // Initialize Telegram bot (non-blocking)
    console.log('🤖 Starting Telegram bot...');
    const bot = initBot();
    bot.launch()
      .then(() => {
        console.log('✅ Telegram bot started');
      })
      .catch((error) => {
        console.error('❌ Telegram bot failed to start:', error.message);
        console.log('   The API will continue running without the bot');
      });

    // Initialize scheduler
    console.log('⏰ Starting scheduler...');
    await initScheduler();
    console.log('✅ Scheduler started');

    console.log(`\n🎉 Boomerang is running! 🪃`);

    // Graceful shutdown
    process.once('SIGINT', () => gracefulShutdown(bot));
    process.once('SIGTERM', () => gracefulShutdown(bot));

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(bot) {
  console.log('\n🛑 Shutting down gracefully...');
  
  try {
    console.log('   Stopping Telegram bot...');
    await bot.stop();
    
    console.log('   Closing database connections...');
    await pool.end();
    
    console.log('✅ Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Start the application
start();
