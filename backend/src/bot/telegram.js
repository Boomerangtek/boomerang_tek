import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import * as commands from './commands.js';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

/**
 * Initialize bot with all handlers
 */
export function initBot() {
  // Slash commands
  bot.command('start', commands.handleStart);
  bot.command('help', commands.handleHelp);
  bot.command('setup', commands.handleSetupStart);
  bot.command('status', commands.handleStatus);

  // Navigation
  bot.action('menu', commands.handleMenu);
  bot.action('help', commands.handleHelp);
  bot.action('how', commands.handleHowItWorks);
  bot.action('faq', commands.handleFaq);

  // Setup flow
  bot.action('setup', commands.handleSetupStart);
  bot.action('warning_accept', commands.handleWarningAccept);
  bot.action('warning_cancel', commands.handleWarningCancel);
  bot.action('confirm_yes', (ctx) => commands.handleSetupConfirmation(ctx, true));
  bot.action('confirm_no', (ctx) => commands.handleSetupConfirmation(ctx, false));
  bot.action(/^interval_(\d+)$/, (ctx) => commands.handleIntervalSelection(ctx, parseInt(ctx.match[1])));

  // Status & control
  bot.action('status', commands.handleStatus);
  bot.action('runnow', commands.handleRunNow);
  bot.action('pause', commands.handlePause);
  bot.action('resume', commands.handleResume);

  // Settings & edits
  bot.action('settings', commands.handleSettings);
  bot.action('change_interval', commands.handleChangeIntervalPrompt);
  bot.action(/^editint_(\d+)$/, (ctx) => commands.handleEditInterval(ctx, parseInt(ctx.match[1])));
  bot.action('change_target', commands.handleChangeTargetPrompt);
  bot.action('troll_mode', commands.handleToggleTrollMode);

  // Delete
  bot.action('stop', commands.handleStop);
  bot.action('confirm_delete', commands.handleConfirmDelete);

  // Misc
  bot.action('cancel', commands.handleCancel);

  // Free-text (setup / edit input)
  bot.on('text', commands.handleSetupMessage);

  // Error handler
  bot.catch((err, ctx) => {
    console.error('❌ Bot error:', err);
    try { ctx.reply('Something went wrong. Please try again or send /start.'); } catch { /* ignore */ }
  });

  // Register the slash-command menu shown in Telegram's "/" picker
  bot.telegram
    .setMyCommands([
      { command: 'start', description: '🪃 Open the Boomerang menu' },
      { command: 'setup', description: '🚀 Set up your bot' },
      { command: 'status', description: '📊 View your bot status' },
      { command: 'help', description: '❓ How it works & FAQ' },
    ])
    .catch(() => { /* token missing / offline — ignore */ });

  console.log('🤖 Telegram bot initialized');
  return bot;
}

/**
 * Send notification to a user
 * @param {number} telegramId - User's Telegram ID
 * @param {string} message - Message to send
 */
export async function sendNotification(telegramId, message) {
  try {
    await bot.telegram.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error(`Failed to send notification to ${telegramId}:`, error);
  }
}

export default bot;
