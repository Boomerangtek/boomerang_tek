import pool from './connection.js';

// Export pool for direct queries
export { pool };

// ========== USER QUERIES ==========

export async function createOrGetUser(telegramId, username) {
  const query = `
    INSERT INTO users (telegram_id, username)
    VALUES ($1, $2)
    ON CONFLICT (telegram_id) 
    DO UPDATE SET username = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [telegramId, username]);
  return result.rows[0];
}

export async function getUserByTelegramId(telegramId) {
  const query = 'SELECT * FROM users WHERE telegram_id = $1';
  const result = await pool.query(query, [telegramId]);
  return result.rows[0];
}

// ========== BOT CONFIG QUERIES ==========

export async function createBotConfig(config) {
  const query = `
    INSERT INTO bot_configs (
      user_id, dev_wallet_encrypted, dev_wallet_public,
      target_token_address, source_token_address,
      interval_minutes, slippage_bps, min_holder_amount
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [
    config.userId,
    JSON.stringify(config.devWalletEncrypted), // Store as JSON string
    config.devWalletPublic,
    config.targetTokenAddress,
    config.sourceTokenAddress,
    config.intervalMinutes,
    config.slippageBps || 100,
    config.minHolderAmount || 0
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getBotConfigByUserId(userId) {
  const query = 'SELECT * FROM bot_configs WHERE user_id = $1 AND is_active = true';
  const result = await pool.query(query, [userId]);
  return result.rows[0];
}

export async function getActiveBotConfigs() {
  const query = 'SELECT * FROM bot_configs WHERE is_active = true';
  const result = await pool.query(query);
  return result.rows;
}

export async function updateBotConfigStatus(configId, isActive) {
  const query = `
    UPDATE bot_configs 
    SET is_active = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [isActive, configId]);
  return result.rows[0];
}

export async function updateBotConfigInterval(configId, intervalMinutes) {
  const query = `
    UPDATE bot_configs
    SET interval_minutes = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [intervalMinutes, configId]);
  return result.rows[0];
}

export async function updateBotConfigTargetToken(configId, targetTokenAddress) {
  const query = `
    UPDATE bot_configs
    SET target_token_address = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [targetTokenAddress, configId]);
  return result.rows[0];
}

export async function updateBotConfigTrollMode(configId, trollMode) {
  const query = `
    UPDATE bot_configs
    SET troll_mode = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [trollMode, configId]);
  return result.rows[0];
}

export async function updateLastExecution(configId) {
  const query = `
    UPDATE bot_configs 
    SET last_execution = NOW(), updated_at = NOW()
    WHERE id = $1;
  `;
  await pool.query(query, [configId]);
}

export async function deleteBotConfig(configId) {
  const query = 'DELETE FROM bot_configs WHERE id = $1';
  await pool.query(query, [configId]);
}

// ========== EXECUTION LOG QUERIES ==========

export async function createExecutionLog(log) {
  const query = `
    INSERT INTO execution_logs (
      config_id, claimed_sol_amount, bought_token_amount,
      holder_count, total_airdropped, status, error_message, reward_token_used
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [
    log.configId,
    log.claimedSolAmount,
    log.boughtTokenAmount,
    log.holderCount,
    log.totalAirdropped,
    log.status,
    log.errorMessage || null,
    log.rewardTokenUsed || null
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getExecutionLogsByConfigId(configId, limit = 10) {
  const query = `
    SELECT * FROM execution_logs 
    WHERE config_id = $1 
    ORDER BY execution_time DESC 
    LIMIT $2;
  `;
  const result = await pool.query(query, [configId, limit]);
  return result.rows;
}

export async function getLastExecutionLog(configId) {
  const query = `
    SELECT * FROM execution_logs 
    WHERE config_id = $1 
    ORDER BY execution_time DESC 
    LIMIT 1;
  `;
  const result = await pool.query(query, [configId]);
  return result.rows[0];
}

// ========== AIRDROP TRANSACTION QUERIES ==========

export async function createAirdropTransaction(tx) {
  const query = `
    INSERT INTO airdrop_transactions (
      execution_log_id, holder_address, holder_balance,
      airdrop_amount, tx_signature, status
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    tx.executionLogId,
    tx.holderAddress,
    tx.holderBalance,
    tx.airdropAmount,
    tx.txSignature,
    tx.status
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function createAirdropTransactionsBatch(transactions) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const insertPromises = transactions.map(tx => {
      const query = `
        INSERT INTO airdrop_transactions (
          execution_log_id, holder_address, holder_balance,
          airdrop_amount, tx_signature, status
        )
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      return client.query(query, [
        tx.executionLogId,
        tx.holderAddress,
        tx.holderBalance,
        tx.airdropAmount,
        tx.txSignature,
        tx.status
      ]);
    });
    
    await Promise.all(insertPromises);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getAirdropTransactionsByLogId(executionLogId) {
  const query = `
    SELECT * FROM airdrop_transactions 
    WHERE execution_log_id = $1 
    ORDER BY created_at DESC;
  `;
  const result = await pool.query(query, [executionLogId]);
  return result.rows;
}

// ========== DASHBOARD QUERIES ==========

export async function getBotConfigBySourceToken(tokenAddress) {
  const query = 'SELECT * FROM bot_configs WHERE source_token_address = $1 AND is_active = true LIMIT 1';
  const result = await pool.query(query, [tokenAddress]);
  return result.rows[0];
}

export async function getTokenStats(tokenAddress) {
  const query = `
    SELECT 
      COALESCE(SUM(total_airdropped), 0) as total_airdropped,
      COALESCE(SUM(bought_token_amount), 0) as total_bought_back,
      COALESCE(SUM(claimed_sol_amount), 0) as total_sol_claimed,
      COUNT(*) as execution_count,
      MAX(execution_time) as last_execution
    FROM execution_logs el
    JOIN bot_configs bc ON el.config_id = bc.id
    WHERE bc.source_token_address = $1 AND el.status = 'success'
  `;
  const result = await pool.query(query, [tokenAddress]);
  return result.rows[0];
}

export async function getTopRecipients(tokenAddress, limit = 10) {
  const query = `
    SELECT 
      holder_address,
      SUM(airdrop_amount) as total_received,
      COUNT(*) as airdrop_count
    FROM airdrop_transactions at
    JOIN execution_logs el ON at.execution_log_id = el.id
    JOIN bot_configs bc ON el.config_id = bc.id
    WHERE bc.source_token_address = $1 AND at.status = 'success'
    GROUP BY holder_address
    ORDER BY total_received DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [tokenAddress, limit]);
  return result.rows;
}

/**
 * Global recent activity feed across all bots:
 *  - 'paid'   → a successful execution (fees claimed, tokens airdropped)
 *  - 'linked' → a new bot configuration was created
 * Returns newest first.
 */
export async function getRecentActivity(limit = 20) {
  const query = `
    (
      SELECT
        'paid' AS type,
        bc.source_token_address AS source_token,
        bc.target_token_address AS target_token,
        el.holder_count,
        el.total_airdropped,
        el.bought_token_amount,
        el.claimed_sol_amount,
        el.execution_time AS ts
      FROM execution_logs el
      JOIN bot_configs bc ON el.config_id = bc.id
      WHERE el.status = 'success' AND el.holder_count > 0
    )
    UNION ALL
    (
      SELECT
        'linked' AS type,
        bc.source_token_address AS source_token,
        bc.target_token_address AS target_token,
        NULL::int AS holder_count,
        NULL::bigint AS total_airdropped,
        NULL::bigint AS bought_token_amount,
        NULL::bigint AS claimed_sol_amount,
        bc.created_at AS ts
      FROM bot_configs bc
    )
    ORDER BY ts DESC
    LIMIT $1;
  `;
  const result = await pool.query(query, [limit]);
  return result.rows;
}

export async function getRecentExecutions(tokenAddress, limit = 10) {
  const query = `
    SELECT 
      el.id,
      el.claimed_sol_amount,
      el.bought_token_amount,
      el.total_airdropped,
      el.holder_count,
      el.execution_time,
      el.status
    FROM execution_logs el
    JOIN bot_configs bc ON el.config_id = bc.id
    WHERE bc.source_token_address = $1
    ORDER BY el.execution_time DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [tokenAddress, limit]);
  return result.rows;
}
