import * as db from '../db/queries.js';
import * as keyboards from './keyboards.js';
import { encryptPrivateKey, isValidPrivateKey } from '../services/encryption.js';
import { getPublicKeyFromPrivate } from '../services/pumpfun.js';

// Store user setup sessions
const setupSessions = new Map();

/**
 * Handle /start command
 */
export async function handleStart(ctx) {
  const welcomeMessage = `
🪃 *Welcome to Boomerang!*

Your fees always come back! I help PumpFun token creators automatically:
• 💰 Claim volume fees from PumpFun
• 🔄 Buy back any token with the fees
• 🎁 Airdrop to your token holders proportionally

*Get Started:*
Use the menu below to set up your bot.

⚠️ *Security Note:*
Your private keys are encrypted with AES-256 and stored securely.
  `;

  await ctx.replyWithMarkdown(welcomeMessage, keyboards.mainMenuKeyboard());
}

/**
 * Handle /help command
 */
export async function handleHelp(ctx) {
  const helpMessage = `
📚 *Boomerang Help* 🪃

*Commands:*
/start - Show main menu
/setup - Configure your bot
/status - View current configuration
/pause - Temporarily pause the bot
/resume - Resume bot operations
/stop - Delete bot configuration
/help - Show this help message

*Setup Process:*
1. Provide your dev wallet private key
2. Enter your PumpFun token address
3. Enter the target token to buy & airdrop
4. Choose execution interval

*How It Works:*
The bot runs on your chosen interval and:
1. Checks for unclaimed PumpFun fees
2. Claims fees to your dev wallet
3. Swaps SOL for your target token
4. Gets current token holders
5. Airdrops proportionally to holders

*Support:*
For issues or questions, contact the developer.
  `;

  await ctx.replyWithMarkdown(helpMessage, keyboards.backToMenuKeyboard());
}

/**
 * Handle setup start
 */
export async function handleSetupStart(ctx) {
  const telegramId = ctx.from.id;
  const username = ctx.from.username;

  // Create or get user
  const user = await db.createOrGetUser(telegramId, username);

  // Check if user already has a config
  const existingConfig = await db.getBotConfigByUserId(user.id);

  if (existingConfig) {
    await ctx.reply(
      '⚠️ You already have an active configuration. Please use /stop first to create a new one.',
      keyboards.backToMenuKeyboard()
    );
    return;
  }

  // Show warning message first
  const warningMessage = `
⚠️ *IMPORTANT WARNING - READ CAREFULLY* ⚠️

*This setup is IRREVERSIBLE!*

By providing your private key, you authorize this bot to:

🔐 *Access your wallet* - The bot will have full access to execute transactions
💰 *Claim PumpFun fees* - Automatically on your chosen schedule
🔄 *Swap tokens* - Using Jupiter aggregator
🎁 *Airdrop to holders* - Proportional distribution

⚠️ *CRITICAL SECURITY WARNINGS:*

❌ *DO NOT* use your main wallet
❌ *DO NOT* use a wallet with large holdings
✅ *DO* create a dedicated wallet just for this bot
✅ *DO* only fund it with necessary amounts

🛑 *ONCE ACTIVATED:*
• The bot will run automatically every interval
• Transactions cannot be reversed
• You can /pause or /stop the bot anytime
• To fully remove access, use /stop to delete the config

*Do you understand and want to proceed?*
  `;

  // Initialize setup session with confirmation step
  setupSessions.set(telegramId, {
    userId: user.id,
    step: 'warning_confirmation',
    data: {},
  });

  await ctx.replyWithMarkdown(warningMessage, keyboards.warningConfirmationKeyboard());
}

/**
 * Handle text messages during setup
 */
export async function handleSetupMessage(ctx) {
  const telegramId = ctx.from.id;
  const session = setupSessions.get(telegramId);

  if (!session) {
    return; // Not in setup mode
  }

  const text = ctx.message.text;

  try {
    switch (session.step) {
      case 'private_key':
        await handlePrivateKeyInput(ctx, session, text);
        break;

      case 'source_token':
        await handleSourceTokenInput(ctx, session, text);
        break;

      case 'target_token':
        await handleTargetTokenInput(ctx, session, text);
        break;

      default:
        break;
    }
  } catch (error) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }

  // Delete user's message for security (private key)
  try {
    await ctx.deleteMessage(ctx.message.message_id);
  } catch (e) {
    // Ignore if can't delete
  }
}

/**
 * Handle private key input
 */
async function handlePrivateKeyInput(ctx, session, privateKey) {
  // Validate private key format
  if (!isValidPrivateKey(privateKey)) {
    await ctx.reply(
      '❌ Invalid private key format. Please send a valid Solana private key (base58 or array format).',
      keyboards.cancelKeyboard()
    );
    return;
  }

  // Get public key
  const publicKey = getPublicKeyFromPrivate(privateKey);

  // Encrypt private key
  const encrypted = encryptPrivateKey(privateKey);

  // Store in session
  session.data.privateKey = encrypted;
  session.data.publicKey = publicKey;
  session.step = 'source_token';

  await ctx.reply(
    `✅ Private key received and encrypted!\n\n` +
    `📍 Public Key: \`${publicKey}\`\n\n` +
    `💎 *Step 2/4: Source Token*\n\n` +
    `Please send your PumpFun token address (the token whose holders will receive airdrops).\n\n` +
    `Example: \`pump123...abc\``,
    { parse_mode: 'Markdown', ...keyboards.cancelKeyboard() }
  );
}

/**
 * Handle source token input
 */
async function handleSourceTokenInput(ctx, session, tokenAddress) {
  // Basic validation (44 characters for Solana addresses)
  if (tokenAddress.length < 32 || tokenAddress.length > 44) {
    await ctx.reply(
      '❌ Invalid token address. Please send a valid Solana token address.',
      keyboards.cancelKeyboard()
    );
    return;
  }

  session.data.sourceToken = tokenAddress;
  session.step = 'target_token';

  await ctx.reply(
    `✅ Source token set!\n\n` +
    `🎯 *Step 3/4: Target Token*\n\n` +
    `Please send the token address you want to buy and airdrop to holders.\n\n` +
    `Example: \`So11111111111111111111111111111111111111112\` (for SOL)\n` +
    `Or any SPL token address.`,
    { parse_mode: 'Markdown', ...keyboards.cancelKeyboard() }
  );
}

/**
 * Handle target token input
 */
async function handleTargetTokenInput(ctx, session, tokenAddress) {
  // Basic validation
  if (tokenAddress.length < 32 || tokenAddress.length > 44) {
    await ctx.reply(
      '❌ Invalid token address. Please send a valid Solana token address.',
      keyboards.cancelKeyboard()
    );
    return;
  }

  session.data.targetToken = tokenAddress;
  session.step = 'interval';

  await ctx.reply(
    `✅ Target token set!\n\n` +
    `⏱️ *Step 4/4: Interval*\n\n` +
    `How often should the bot claim fees and distribute rewards?`,
    { parse_mode: 'Markdown', ...keyboards.intervalKeyboard() }
  );
}

/**
 * Handle interval selection
 */
export async function handleIntervalSelection(ctx, interval) {
  const telegramId = ctx.from.id;
  const session = setupSessions.get(telegramId);

  if (!session || session.step !== 'interval') {
    await ctx.answerCbQuery('Please start setup first with /setup');
    return;
  }

  session.data.interval = interval;

  // Show confirmation
  const confirmMessage = `
📋 *Configuration Summary*

🔐 Wallet: \`${session.data.publicKey}\`
💎 Source Token: \`${session.data.sourceToken}\`
🎯 Target Token: \`${session.data.targetToken}\`
⏱️ Interval: ${interval} minutes

*Ready to activate?*
  `;

  await ctx.editMessageText(confirmMessage, {
    parse_mode: 'Markdown',
    ...keyboards.confirmationKeyboard()
  });

  await ctx.answerCbQuery();
}

/**
 * Handle setup confirmation
 */
export async function handleSetupConfirmation(ctx, confirmed) {
  const telegramId = ctx.from.id;
  const session = setupSessions.get(telegramId);

  if (!session) {
    await ctx.answerCbQuery('Setup session expired. Please start again with /setup');
    return;
  }

  if (!confirmed) {
    setupSessions.delete(telegramId);
    await ctx.editMessageText('❌ Setup cancelled.', keyboards.mainMenuKeyboard());
    await ctx.answerCbQuery('Setup cancelled');
    return;
  }

  try {
    // Save configuration to database
    const config = await db.createBotConfig({
      userId: session.userId,
      devWalletEncrypted: session.data.privateKey,
      devWalletPublic: session.data.publicKey,
      sourceTokenAddress: session.data.sourceToken,
      targetTokenAddress: session.data.targetToken,
      intervalMinutes: session.data.interval,
    });

    // Clear session
    setupSessions.delete(telegramId);

    await ctx.editMessageText(
      `✅ *Bot configured successfully!*\n\n` +
      `Your bot is now active and will run every ${session.data.interval} minutes.\n\n` +
      `Use /status to check its progress.`,
      { parse_mode: 'Markdown', ...keyboards.backToMenuKeyboard() }
    );

    await ctx.answerCbQuery('✅ Bot activated!');

    console.log(`🎉 New bot configured for user ${telegramId}`);
  } catch (error) {
    console.error('Error saving configuration:', error);
    await ctx.answerCbQuery('❌ Error saving configuration');
    await ctx.reply(`❌ Error: ${error.message}`);
  }
}

/**
 * Handle status command
 */
export async function handleStatus(ctx) {
  const telegramId = ctx.from.id;

  try {
    const user = await db.getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.reply('Please use /start first.');
      return;
    }

    const config = await db.getBotConfigByUserId(user.id);
    if (!config) {
      await ctx.reply('No active configuration. Use /setup to create one.', keyboards.mainMenuKeyboard());
      return;
    }

    const lastLog = await db.getLastExecutionLog(config.id);

    let statusMessage = `
📊 *Bot Status*

🔐 Wallet: \`${config.dev_wallet_public}\`
💎 Source: \`${config.source_token_address}\`
🎯 Target: \`${config.target_token_address}\`
⏱️ Interval: ${config.interval_minutes} minutes
📍 Status: ${config.is_active ? '✅ Active' : '⏸️ Paused'}
    `;

    if (lastLog) {
      const status = lastLog.status === 'success' ? '✅' : '❌';
      statusMessage += `\n*Last Execution:*\n`;
      statusMessage += `${status} ${new Date(lastLog.execution_time).toLocaleString()}\n`;
      statusMessage += `💰 Claimed: ${lastLog.claimed_sol_amount ? (Number(lastLog.claimed_sol_amount) / 1e9).toFixed(4) : '0'} SOL\n`;
      statusMessage += `🎁 Airdropped to: ${lastLog.holder_count || 0} holders\n`;
    } else {
      statusMessage += `\n⏳ No executions yet.\n`;
    }

    // Add dashboard link
    const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    statusMessage += `\n📊 [View Public Dashboard](${dashboardUrl}/${config.source_token_address})`;

    await ctx.replyWithMarkdown(statusMessage, keyboards.backToMenuKeyboard());
  } catch (error) {
    console.error('Error getting status:', error);
    await ctx.reply(`❌ Error: ${error.message}`);
  }
}

/**
 * Handle pause command
 */
export async function handlePause(ctx) {
  const telegramId = ctx.from.id;

  try {
    const user = await db.getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.answerCbQuery('Please use /start first.');
      return;
    }

    const config = await db.getBotConfigByUserId(user.id);
    if (!config) {
      await ctx.answerCbQuery('No active configuration found.');
      return;
    }

    if (!config.is_active) {
      await ctx.answerCbQuery('Bot is already paused.');
      return;
    }

    await db.updateBotConfigStatus(config.id, false);
    await ctx.answerCbQuery('✅ Bot paused');
    await ctx.editMessageText('⏸️ Bot paused successfully.', keyboards.backToMenuKeyboard());
  } catch (error) {
    console.error('Error pausing bot:', error);
    await ctx.answerCbQuery('❌ Error pausing bot');
  }
}

/**
 * Handle resume command
 */
export async function handleResume(ctx) {
  const telegramId = ctx.from.id;

  try {
    const user = await db.getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.answerCbQuery('Please use /start first.');
      return;
    }

    const config = await db.getBotConfigByUserId(user.id);
    if (!config) {
      await ctx.answerCbQuery('No configuration found.');
      return;
    }

    if (config.is_active) {
      await ctx.answerCbQuery('Bot is already active.');
      return;
    }

    await db.updateBotConfigStatus(config.id, true);
    await ctx.answerCbQuery('✅ Bot resumed');
    await ctx.editMessageText('▶️ Bot resumed successfully.', keyboards.backToMenuKeyboard());
  } catch (error) {
    console.error('Error resuming bot:', error);
    await ctx.answerCbQuery('❌ Error resuming bot');
  }
}

/**
 * Handle stop command
 */
export async function handleStop(ctx) {
  const telegramId = ctx.from.id;

  try {
    const user = await db.getUserByTelegramId(telegramId);
    if (!user) {
      await ctx.answerCbQuery('No configuration found.');
      return;
    }

    const config = await db.getBotConfigByUserId(user.id);
    if (!config) {
      await ctx.answerCbQuery('No configuration found.');
      return;
    }

    await db.deleteBotConfig(config.id);
    await ctx.answerCbQuery('✅ Bot stopped and deleted');
    await ctx.editMessageText(
      '🛑 Bot configuration deleted successfully.\n\nUse /setup to create a new one.',
      keyboards.mainMenuKeyboard()
    );
  } catch (error) {
    console.error('Error stopping bot:', error);
    await ctx.answerCbQuery('❌ Error stopping bot');
  }
}

/**
 * Handle warning acceptance
 */
export async function handleWarningAccept(ctx) {
  const telegramId = ctx.from.id;
  const session = setupSessions.get(telegramId);

  if (!session || session.step !== 'warning_confirmation') {
    await ctx.answerCbQuery('Please start setup again with /setup');
    return;
  }

  // Move to private key step
  session.step = 'private_key';

  await ctx.editMessageText(
    '🔐 *Step 1/4: Private Key*\n\n' +
    'Please send your dev wallet private key.\n\n' +
    '⚠️ *Security:* Your key will be encrypted immediately and the message will be deleted.\n\n' +
    '✅ Accepted formats:\n' +
    '• Base58 string (recommended)\n' +
    '• JSON array [1,2,3...]\n\n' +
    'Example: `5J6m7n8p9q...` (base58)',
    { parse_mode: 'Markdown', ...keyboards.cancelKeyboard() }
  );

  await ctx.answerCbQuery('✅ Proceeding with setup');
}

/**
 * Handle warning cancellation
 */
export async function handleWarningCancel(ctx) {
  const telegramId = ctx.from.id;
  setupSessions.delete(telegramId);

  await ctx.answerCbQuery('Setup cancelled');
  await ctx.editMessageText(
    '❌ Setup cancelled.\n\n' +
    'You can start again anytime with /setup when you\'re ready.',
    keyboards.mainMenuKeyboard()
  );
}

/**
 * Handle cancel during setup
 */
export async function handleCancel(ctx) {
  const telegramId = ctx.from.id;
  setupSessions.delete(telegramId);

  await ctx.answerCbQuery('Setup cancelled');
  await ctx.editMessageText('❌ Setup cancelled.', keyboards.mainMenuKeyboard());
}
