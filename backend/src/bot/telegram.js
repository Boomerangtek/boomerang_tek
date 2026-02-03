import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import * as commands from './commands.js';
import * as keyboards from './keyboards.js';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

/**
 * Initialize bot with all handlers
 */
export function initBot() {
  // Command handlers
  bot.command('start', commands.handleStart);
  bot.command('help', commands.handleHelp);
  bot.command('setup', commands.handleSetupStart);
  bot.command('status', commands.handleStatus);

  // Callback query handlers
  bot.action('setup', commands.handleSetupStart);
  bot.action('status', commands.handleStatus);
  bot.action('help', commands.handleHelp);
  bot.action('pause', commands.handlePause);
  bot.action('resume', commands.handleResume);
  bot.action('stop', commands.handleStop);
  bot.action('cancel', commands.handleCancel);

  // Interval selection handlers
  bot.action(/^interval_(\d+)$/, (ctx) => {
    const interval = parseInt(ctx.match[1]);
    commands.handleIntervalSelection(ctx, interval);
  });

  // Warning confirmation handlers
  bot.action('warning_accept', commands.handleWarningAccept);
  bot.action('warning_cancel', commands.handleWarningCancel);

  // Confirmation handlers
  bot.action('confirm_yes', (ctx) => commands.handleSetupConfirmation(ctx, true));
  bot.action('confirm_no', (ctx) => commands.handleSetupConfirmation(ctx, false));

  // Menu handler
  bot.action('menu', async (ctx) => {
    await ctx.editMessageText(
      '🏠 *Main Menu*\n\nChoose an option:',
      { parse_mode: 'Markdown', ...keyboards.mainMenuKeyboard() }
    );
    await ctx.answerCbQuery();
  });

  // Handle text messages (for setup flow)
  bot.on('text', commands.handleSetupMessage);

  // Error handler
  bot.catch((err, ctx) => {
    console.error('❌ Bot error:', err);
    ctx.reply('An error occurred. Please try again or contact support.');
  });

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
