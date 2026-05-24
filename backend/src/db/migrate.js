import pool from './connection.js';

async function migrate() {
  console.log('🚀 Starting database migration...');

  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        username VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created users table');

    // Create bot_configs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bot_configs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        dev_wallet_encrypted TEXT NOT NULL,
        dev_wallet_public VARCHAR(44) NOT NULL,
        target_token_address VARCHAR(44) NOT NULL,
        source_token_address VARCHAR(44) NOT NULL,
        interval_minutes INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        slippage_bps INTEGER DEFAULT 100,
        min_holder_amount BIGINT DEFAULT 0,
        last_execution TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created bot_configs table');

    // Create execution_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS execution_logs (
        id SERIAL PRIMARY KEY,
        config_id INTEGER REFERENCES bot_configs(id) ON DELETE CASCADE,
        claimed_sol_amount BIGINT,
        bought_token_amount BIGINT,
        holder_count INTEGER,
        total_airdropped BIGINT,
        status VARCHAR(50),
        error_message TEXT,
        execution_time TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created execution_logs table');

    // Create airdrop_transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS airdrop_transactions (
        id SERIAL PRIMARY KEY,
        execution_log_id INTEGER REFERENCES execution_logs(id) ON DELETE CASCADE,
        holder_address VARCHAR(44) NOT NULL,
        holder_balance BIGINT,
        airdrop_amount BIGINT,
        tx_signature VARCHAR(88),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created airdrop_transactions table');

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_bot_configs_user_id ON bot_configs(user_id);
      CREATE INDEX IF NOT EXISTS idx_bot_configs_is_active ON bot_configs(is_active);
      CREATE INDEX IF NOT EXISTS idx_execution_logs_config_id ON execution_logs(config_id);
      CREATE INDEX IF NOT EXISTS idx_airdrop_transactions_log_id ON airdrop_transactions(execution_log_id);
    `);
    console.log('✅ Created indexes');

    // Troll Mode — randomized reward token every cycle (idempotent add-ons).
    await pool.query(`ALTER TABLE bot_configs ADD COLUMN IF NOT EXISTS troll_mode BOOLEAN DEFAULT false;`);
    await pool.query(`ALTER TABLE execution_logs ADD COLUMN IF NOT EXISTS reward_token_used VARCHAR(44);`);
    console.log('✅ Ensured troll_mode / reward_token_used columns');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
