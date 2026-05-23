import { PublicKey } from '@solana/web3.js';
import * as db from '../db/queries.js';
import * as keyboards from './keyboards.js';
import { encryptPrivateKey, isValidPrivateKey } from '../services/encryption.js';
import { getPublicKeyFromPrivate } from '../services/pumpfun.js';
import { getSolBalance } from '../services/solana.js';

// In-memory setup / edit sessions, keyed by telegram id
const sessions = new Map();

const FRONTEND = process.env.FRONTEND_URL || process.env.WEBSITE_URL || 'https://boomerang.fun';

// ---------- helpers ----------

function short(addr) {
  return addr ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : '—';
}

function isValidSolAddress(addr) {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(addr.trim());
    return true;
  } catch {
    return false;
  }
}

function dashboardLink(config) {
  return `${FRONTEND}/${config.source_token_address}`;
}

async function getUserConfig(telegramId) {
  const user = await db.getUserByTelegramId(telegramId);
  if (!user) return { user: null, config: null };
  const config = await db.getBotConfigByUserId(user.id);
  return { user, config };
}

/** Reschedule a config immediately (don't wait for the 5-min refresh). */
async function reschedule(config) {
  try {
    const { scheduleConfig } = await import('../scheduler/cron.js');
    scheduleConfig(config);
  } catch (e) {
    console.error('reschedule failed:', e.message);
  }
}

// ---------- home ----------

export async function handleStart(ctx) {
  const telegramId = ctx.from.id;
  await db.createOrGetUser(telegramId, ctx.from.username);
  const { config } = await getUserConfig(telegramId);

  if (config) {
    const msg =
      `🪃 *Welcome back!*\n\n` +
      `Your Boomerang is ${config.is_active ? '🟢 *running*' : '⏸️ *paused*'} — ` +
      `rewarding holders of \`${short(config.source_token_address)}\` ` +
      `every *${config.interval_minutes} min*.\n\n` +
      `What would you like to do?`;
    return ctx.replyWithMarkdown(msg, keyboards.dashboardKeyboard(config));
  }

  const welcome =
    `🪃 *Boomerang* — your fees always come back.\n\n` +
    `Bank coins only share fees in USDC. *Boomerang pays your holders in any token you choose.*\n\n` +
    `Here's the loop, fully automated:\n` +
    `💰 Claim your PumpFun creator fees\n` +
    `🔄 Buy any token you pick (via Jupiter)\n` +
    `🎁 Airdrop it to your holders, proportionally\n\n` +
    `Ready when you are 👇`;
  await ctx.replyWithMarkdown(welcome, keyboards.welcomeKeyboard());
}

export async function handleMenu(ctx) {
  const { config } = await getUserConfig(ctx.from.id);
  const text = config
    ? `🪃 *Main menu*\n\nBoomerang is ${config.is_active ? '🟢 running' : '⏸️ paused'}. Pick an option:`
    : `🪃 *Main menu*\n\nLet's get your fees flowing back to holders:`;
  const kb = config ? keyboards.dashboardKeyboard(config) : keyboards.welcomeKeyboard();
  try {
    await ctx.editMessageText(text, { parse_mode: 'Markdown', ...kb });
  } catch {
    await ctx.replyWithMarkdown(text, kb);
  }
  if (ctx.callbackQuery) await ctx.answerCbQuery();
}

export async function handleHelp(ctx) {
  const msg =
    `❓ *Boomerang — Help*\n\n` +
    `*Commands*\n` +
    `/start — open the menu\n` +
    `/setup — configure your bot\n` +
    `/status — view your bot\n` +
    `/help — this message\n\n` +
    `*The flow*\n` +
    `Every interval, Boomerang claims your PumpFun fees, swaps the SOL into your reward token, and airdrops it to holders of your token — the more they hold, the bigger their share.\n\n` +
    `*Good to know*\n` +
    `🔐 Your key is encrypted (AES-256) and only decrypted at run time\n` +
    `⏸️ You can pause, resume or delete anytime\n` +
    `🎯 You can change the reward token & interval whenever\n\n` +
    `Need a hand? Reach out to the team.`;
  await ctx.replyWithMarkdown(msg, keyboards.backToMenuKeyboard());
  if (ctx.callbackQuery) await ctx.answerCbQuery();
}

export async function handleHowItWorks(ctx) {
  const msg =
    `📖 *How Boomerang works*\n\n` +
    `1️⃣ *Claim* — we watch your PumpFun creator vault and auto-claim your SOL fees on schedule.\n\n` +
    `2️⃣ *Buy* — that SOL is swapped into the *reward token you choose* (your coin, SOL, USDC… anything) at Jupiter best price.\n\n` +
    `3️⃣ *Airdrop* — the tokens are sent to your holders, proportional to how much they hold.\n\n` +
    `You set the interval (1–60 min). Everything runs on autopilot. 🪃`;
  await ctx.replyWithMarkdown(msg, keyboards.welcomeKeyboard());
  if (ctx.callbackQuery) await ctx.answerCbQuery();
}

export async function handleFaq(ctx) {
  const msg =
    `❓ *FAQ*\n\n` +
    `*Are my funds safe?*\n` +
    `Your key is encrypted (AES-256) and only decrypted in memory at run time. Use a *dedicated wallet* funded with just what the bot needs.\n\n` +
    `*What can the bot do with my wallet?*\n` +
    `Only three things: claim fees, swap via Jupiter, airdrop to holders. Nothing else.\n\n` +
    `*Which token gets airdropped?*\n` +
    `Any SPL token you choose — not just USDC.\n\n` +
    `*Can I stop it?*\n` +
    `Yes — pause, resume or delete anytime from the menu.`;
  await ctx.replyWithMarkdown(msg, keyboards.welcomeKeyboard());
  if (ctx.callbackQuery) await ctx.answerCbQuery();
}

// ---------- setup flow ----------

export async function handleSetupStart(ctx) {
  const telegramId = ctx.from.id;
  const user = await db.createOrGetUser(telegramId, ctx.from.username);
  const existing = await db.getBotConfigByUserId(user.id);

  if (existing) {
    await ctx.replyWithMarkdown(
      `⚠️ You already have an active configuration.\n\nUse *Settings* to change it, or delete it first to start fresh.`,
      keyboards.dashboardKeyboard(existing)
    );
    if (ctx.callbackQuery) await ctx.answerCbQuery();
    return;
  }

  const warning =
    `⚠️ *Before we start — read this*\n\n` +
    `To automate claims & airdrops, Boomerang needs your dev wallet's *private key*. That's powerful, so:\n\n` +
    `❌ *Don't* use your main wallet\n` +
    `✅ *Do* create a fresh, dedicated wallet\n` +
    `✅ Fund it with only what the bot needs\n\n` +
    `🔐 Your key is encrypted immediately (AES-256) and your message is deleted right after.\n` +
    `🛑 You stay in control — pause, resume or delete anytime.\n\n` +
    `Understood?`;

  sessions.set(telegramId, { userId: user.id, step: 'warning', data: {} });
  await ctx.replyWithMarkdown(warning, keyboards.warningConfirmationKeyboard());
  if (ctx.callbackQuery) await ctx.answerCbQuery();
}

export async function handleWarningAccept(ctx) {
  const session = sessions.get(ctx.from.id);
  if (!session || session.step !== 'warning') {
    return ctx.answerCbQuery('Session expired — send /setup to start again.');
  }
  session.step = 'private_key';
  await ctx.editMessageText(
    `🔐 *Step 1 of 4 — Dev wallet key*\n\n` +
      `Send the *private key* of your dedicated dev wallet.\n\n` +
      `Accepted formats:\n• Base58 string _(recommended)_\n• JSON array \`[12,34,...]\`\n\n` +
      `_Your message is deleted the instant it's received._`,
    { parse_mode: 'Markdown', ...keyboards.cancelKeyboard() }
  );
  await ctx.answerCbQuery('Let’s go 🚀');
}

export async function handleWarningCancel(ctx) {
  sessions.delete(ctx.from.id);
  await ctx.editMessageText('❌ Setup cancelled. Send /setup whenever you’re ready.', {
    parse_mode: 'Markdown',
    ...keyboards.welcomeKeyboard(),
  });
  await ctx.answerCbQuery();
}

export async function handleSetupMessage(ctx) {
  const telegramId = ctx.from.id;
  const session = sessions.get(telegramId);
  if (!session) return;

  const text = (ctx.message.text || '').trim();

  // Only the private key is sensitive — delete that message immediately.
  if (session.step === 'private_key') {
    try { await ctx.deleteMessage(ctx.message.message_id); } catch { /* ignore */ }
  }

  try {
    switch (session.step) {
      case 'private_key':
        return await handlePrivateKeyInput(ctx, session, text);
      case 'source_token':
        return await handleSourceTokenInput(ctx, session, text);
      case 'target_token':
        return await handleTargetTokenInput(ctx, session, text);
      case 'edit_target':
        return await handleEditTargetInput(ctx, session, text);
      default:
        return;
    }
  } catch (error) {
    await ctx.reply(`❌ ${error.message}`);
  }
}

async function handlePrivateKeyInput(ctx, session, privateKey) {
  if (!isValidPrivateKey(privateKey)) {
    return ctx.replyWithMarkdown(
      `❌ That doesn't look like a valid Solana private key.\n\nSend a *base58* string or a JSON byte array.`,
      keyboards.cancelKeyboard()
    );
  }

  const publicKey = getPublicKeyFromPrivate(privateKey);
  session.data.privateKey = encryptPrivateKey(privateKey);
  session.data.publicKey = publicKey;
  session.step = 'source_token';

  await ctx.replyWithMarkdown(
    `✅ Key received & encrypted.\n` +
      `📍 Wallet: \`${publicKey}\`\n\n` +
      `💎 *Step 2 of 4 — Your token*\n\n` +
      `Send your *PumpFun token address* — the token whose *holders will be rewarded*.`,
    keyboards.cancelKeyboard()
  );
}

async function handleSourceTokenInput(ctx, session, tokenAddress) {
  if (!isValidSolAddress(tokenAddress)) {
    return ctx.replyWithMarkdown(
      `❌ That's not a valid Solana token address. Try again.`,
      keyboards.cancelKeyboard()
    );
  }
  session.data.sourceToken = tokenAddress;
  session.step = 'target_token';

  await ctx.replyWithMarkdown(
    `✅ Your token set.\n\n` +
      `🎯 *Step 3 of 4 — Reward token*\n\n` +
      `Send the *token holders should receive*.\n\n` +
      `• \`So11111111111111111111111111111111111111112\` — SOL\n` +
      `• \`EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\` — USDC\n` +
      `• …or any SPL token (even your own).`,
    keyboards.cancelKeyboard()
  );
}

async function handleTargetTokenInput(ctx, session, tokenAddress) {
  if (!isValidSolAddress(tokenAddress)) {
    return ctx.replyWithMarkdown(
      `❌ That's not a valid Solana token address. Try again.`,
      keyboards.cancelKeyboard()
    );
  }
  session.data.targetToken = tokenAddress;
  session.step = 'interval';

  await ctx.replyWithMarkdown(
    `✅ Reward token set.\n\n` + `⏱️ *Step 4 of 4 — Interval*\n\nHow often should Boomerang run?`,
    keyboards.intervalKeyboard('interval', 'cancel')
  );
}

export async function handleIntervalSelection(ctx, interval) {
  const session = sessions.get(ctx.from.id);
  if (!session || session.step !== 'interval') {
    return ctx.answerCbQuery('Send /setup to start again.');
  }
  session.data.interval = interval;

  const summary =
    `📋 *Review your Boomerang*\n\n` +
    `🔐 Wallet: \`${short(session.data.publicKey)}\`\n` +
    `💎 Your token: \`${short(session.data.sourceToken)}\`\n` +
    `🎯 Reward: \`${short(session.data.targetToken)}\`\n` +
    `⏱️ Interval: every *${interval} min*\n\n` +
    `Activate now?`;
  await ctx.editMessageText(summary, { parse_mode: 'Markdown', ...keyboards.confirmationKeyboard() });
  await ctx.answerCbQuery();
}

export async function handleSetupConfirmation(ctx, confirmed) {
  const telegramId = ctx.from.id;
  const session = sessions.get(telegramId);
  if (!session) return ctx.answerCbQuery('Session expired — send /setup to start again.');

  if (!confirmed) {
    sessions.delete(telegramId);
    await ctx.editMessageText('❌ Setup cancelled.', { parse_mode: 'Markdown', ...keyboards.welcomeKeyboard() });
    return ctx.answerCbQuery('Cancelled');
  }

  try {
    const config = await db.createBotConfig({
      userId: session.userId,
      devWalletEncrypted: session.data.privateKey,
      devWalletPublic: session.data.publicKey,
      sourceTokenAddress: session.data.sourceToken,
      targetTokenAddress: session.data.targetToken,
      intervalMinutes: session.data.interval,
    });
    sessions.delete(telegramId);
    await reschedule(config);

    await ctx.editMessageText(
      `🎉 *Boomerang is live!*\n\n` +
        `It'll run every *${config.interval_minutes} min*, claiming fees and rewarding your holders automatically.\n\n` +
        `📊 Dashboard: ${dashboardLink(config)}\n\n` +
        `Tip: hit *⚡ Run now* to fire the first round immediately.`,
      { parse_mode: 'Markdown', ...keyboards.dashboardKeyboard(config) }
    );
    await ctx.answerCbQuery('🎉 Activated!');
    console.log(`🎉 New bot configured for user ${telegramId}`);
  } catch (error) {
    console.error('Error saving configuration:', error);
    await ctx.answerCbQuery('❌ Error saving config');
    await ctx.reply(`❌ ${error.message}`);
  }
}

// ---------- status ----------

export async function handleStatus(ctx) {
  const { user, config } = await getUserConfig(ctx.from.id);
  if (!user) {
    if (ctx.callbackQuery) await ctx.answerCbQuery();
    return ctx.reply('Send /start first.');
  }
  if (!config) {
    if (ctx.callbackQuery) await ctx.answerCbQuery();
    return ctx.replyWithMarkdown('You have no active bot yet.', keyboards.welcomeKeyboard());
  }

  let balanceLine = '';
  try {
    const sol = await getSolBalance(config.dev_wallet_public);
    balanceLine = `\n💳 Wallet balance: *${sol.toFixed(4)} SOL*`;
  } catch { /* RPC hiccup — skip */ }

  const last = await db.getLastExecutionLog(config.id);
  let lastLine = `\n📭 No runs yet — hit *⚡ Run now*.`;
  if (last) {
    const ok = last.status === 'success';
    const when = new Date(last.execution_time).toLocaleString();
    lastLine =
      `\n*Last run* ${ok ? '✅' : '❌'} _(${when})_\n` +
      `💰 Claimed: ${last.claimed_sol_amount ? (Number(last.claimed_sol_amount) / 1e9).toFixed(4) : '0'} SOL\n` +
      `🎁 Holders: ${last.holder_count || 0}` +
      (last.error_message ? `\n⚠️ ${last.error_message}` : '');
  }

  const msg =
    `📊 *Your Boomerang*\n\n` +
    `📍 Status: ${config.is_active ? '🟢 Running' : '⏸️ Paused'}\n` +
    `⏱️ Interval: every *${config.interval_minutes} min*\n` +
    `🔐 Wallet: \`${config.dev_wallet_public}\`${balanceLine}\n` +
    `💎 Your token: \`${short(config.source_token_address)}\`\n` +
    `🎯 Reward: \`${short(config.target_token_address)}\`\n` +
    lastLine +
    `\n\n📈 Dashboard: ${dashboardLink(config)}`;

  await ctx.replyWithMarkdown(msg, keyboards.statusKeyboard(config));
  if (ctx.callbackQuery) await ctx.answerCbQuery();
}

// ---------- settings & edits ----------

export async function handleSettings(ctx) {
  const { config } = await getUserConfig(ctx.from.id);
  if (!config) {
    if (ctx.callbackQuery) await ctx.answerCbQuery('No config yet.');
    return ctx.replyWithMarkdown('You have no active bot yet.', keyboards.welcomeKeyboard());
  }
  const text =
    `⚙️ *Settings*\n\n` +
    `⏱️ Interval: every *${config.interval_minutes} min*\n` +
    `🎯 Reward token: \`${short(config.target_token_address)}\`\n` +
    `📍 ${config.is_active ? '🟢 Running' : '⏸️ Paused'}`;
  try {
    await ctx.editMessageText(text, { parse_mode: 'Markdown', ...keyboards.settingsKeyboard(config) });
  } catch {
    await ctx.replyWithMarkdown(text, keyboards.settingsKeyboard(config));
  }
  if (ctx.callbackQuery) await ctx.answerCbQuery();
}

export async function handleChangeIntervalPrompt(ctx) {
  await ctx.editMessageText('⏱️ *Pick a new interval:*', {
    parse_mode: 'Markdown',
    ...keyboards.intervalKeyboard('editint', 'settings'),
  });
  await ctx.answerCbQuery();
}

export async function handleEditInterval(ctx, interval) {
  const { config } = await getUserConfig(ctx.from.id);
  if (!config) return ctx.answerCbQuery('No config found.');
  const updated = await db.updateBotConfigInterval(config.id, interval);
  await reschedule(updated);
  await ctx.editMessageText(
    `✅ Interval updated — Boomerang now runs every *${interval} min*.`,
    { parse_mode: 'Markdown', ...keyboards.settingsKeyboard(updated) }
  );
  await ctx.answerCbQuery('Updated ✅');
}

export async function handleChangeTargetPrompt(ctx) {
  const { user, config } = await getUserConfig(ctx.from.id);
  if (!config) return ctx.answerCbQuery('No config found.');
  sessions.set(ctx.from.id, { userId: user.id, step: 'edit_target', data: { configId: config.id } });
  await ctx.editMessageText(
    `🎯 *Change reward token*\n\nSend the new SPL token address holders should receive.`,
    { parse_mode: 'Markdown', ...keyboards.cancelKeyboard() }
  );
  await ctx.answerCbQuery();
}

async function handleEditTargetInput(ctx, session, tokenAddress) {
  if (!isValidSolAddress(tokenAddress)) {
    return ctx.replyWithMarkdown('❌ Not a valid Solana token address. Try again.', keyboards.cancelKeyboard());
  }
  const updated = await db.updateBotConfigTargetToken(session.data.configId, tokenAddress);
  sessions.delete(ctx.from.id);
  await ctx.replyWithMarkdown(
    `✅ Reward token updated to \`${short(tokenAddress)}\`.`,
    keyboards.settingsKeyboard(updated)
  );
}

// ---------- run now ----------

export async function handleRunNow(ctx) {
  const { config } = await getUserConfig(ctx.from.id);
  if (!config) return ctx.answerCbQuery('No config found.');
  if (!config.is_active) {
    return ctx.answerCbQuery('Bot is paused — resume it first.', { show_alert: true });
  }

  await ctx.answerCbQuery('⚡ Running now…');
  await ctx.replyWithMarkdown('⚡ *Running a round now…* I’ll message you with the result.');

  // Fire and forget — the executor sends its own success/failure notification.
  import('../scheduler/executor.js')
    .then(({ executeBotConfig }) => executeBotConfig(config))
    .catch((e) => {
      console.error('Run-now failed:', e);
      ctx.reply(`❌ Run failed: ${e.message}`);
    });
}

// ---------- pause / resume / delete ----------

export async function handlePause(ctx) {
  const { config } = await getUserConfig(ctx.from.id);
  if (!config) return ctx.answerCbQuery('No config found.');
  if (!config.is_active) return ctx.answerCbQuery('Already paused.');
  const updated = await db.updateBotConfigStatus(config.id, false);
  await reschedule(updated);
  await ctx.answerCbQuery('⏸️ Paused');
  try {
    await ctx.editMessageText('⏸️ *Bot paused.* No runs until you resume.', {
      parse_mode: 'Markdown',
      ...keyboards.dashboardKeyboard(updated),
    });
  } catch {
    await ctx.replyWithMarkdown('⏸️ *Bot paused.*', keyboards.dashboardKeyboard(updated));
  }
}

export async function handleResume(ctx) {
  const { config } = await getUserConfig(ctx.from.id);
  if (!config) return ctx.answerCbQuery('No config found.');
  if (config.is_active) return ctx.answerCbQuery('Already running.');
  const updated = await db.updateBotConfigStatus(config.id, true);
  await reschedule(updated);
  await ctx.answerCbQuery('▶️ Resumed');
  try {
    await ctx.editMessageText('▶️ *Bot resumed* — back to rewarding your holders.', {
      parse_mode: 'Markdown',
      ...keyboards.dashboardKeyboard(updated),
    });
  } catch {
    await ctx.replyWithMarkdown('▶️ *Bot resumed.*', keyboards.dashboardKeyboard(updated));
  }
}

export async function handleStop(ctx) {
  const { config } = await getUserConfig(ctx.from.id);
  if (!config) {
    if (ctx.callbackQuery) await ctx.answerCbQuery('No config found.');
    return;
  }
  await ctx.editMessageText(
    `🗑️ *Delete configuration?*\n\nThis stops the bot and removes its access to your wallet. This can't be undone.`,
    { parse_mode: 'Markdown', ...keyboards.deleteConfirmKeyboard() }
  );
  await ctx.answerCbQuery();
}

export async function handleConfirmDelete(ctx) {
  const { config } = await getUserConfig(ctx.from.id);
  if (!config) return ctx.answerCbQuery('Nothing to delete.');
  await db.updateBotConfigStatus(config.id, false);
  await reschedule({ ...config, is_active: false });
  await db.deleteBotConfig(config.id);
  await ctx.editMessageText('🛑 *Configuration deleted.*\n\nSend /setup to create a new one anytime.', {
    parse_mode: 'Markdown',
    ...keyboards.welcomeKeyboard(),
  });
  await ctx.answerCbQuery('Deleted');
}

export async function handleCancel(ctx) {
  sessions.delete(ctx.from.id);
  try {
    await ctx.editMessageText('❌ Cancelled.', { parse_mode: 'Markdown', ...keyboards.backToMenuKeyboard() });
  } catch {
    await ctx.reply('❌ Cancelled.');
  }
  if (ctx.callbackQuery) await ctx.answerCbQuery();
}
