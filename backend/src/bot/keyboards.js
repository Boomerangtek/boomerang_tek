import { Markup } from 'telegraf';

const WEBSITE = process.env.WEBSITE_URL || 'https://boomerang.fun';

/**
 * Home menu shown when the user has NO active configuration.
 */
export function welcomeKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🚀 Set up Boomerang', 'setup')],
    [Markup.button.callback('📖 How it works', 'how'), Markup.button.callback('❓ FAQ', 'faq')],
    [Markup.button.url('🌐 Website', WEBSITE)],
  ]);
}

/**
 * Home menu shown when the user HAS a configuration.
 * @param {Object} config - bot config row
 */
export function dashboardKeyboard(config) {
  const toggle = config.is_active
    ? Markup.button.callback('⏸️ Pause', 'pause')
    : Markup.button.callback('▶️ Resume', 'resume');

  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Status', 'status'), Markup.button.callback('⚡ Run now', 'runnow')],
    [Markup.button.callback('⚙️ Settings', 'settings'), toggle],
    [Markup.button.callback('❓ Help', 'help')],
  ]);
}

/**
 * Settings submenu.
 */
export function settingsKeyboard(config) {
  const toggle = config.is_active
    ? Markup.button.callback('⏸️ Pause bot', 'pause')
    : Markup.button.callback('▶️ Resume bot', 'resume');

  const troll = config.troll_mode
    ? Markup.button.callback('👹 Troll Mode: ON — turn off', 'troll_mode')
    : Markup.button.callback('🎲 Enable Troll Mode', 'troll_mode');

  return Markup.inlineKeyboard([
    [Markup.button.callback('⏱️ Change interval', 'change_interval')],
    [Markup.button.callback('🎯 Change reward token', 'change_target')],
    [troll],
    [toggle],
    [Markup.button.callback('🗑️ Delete configuration', 'stop')],
    [Markup.button.callback('⬅️ Back', 'menu')],
  ]);
}

/**
 * Interval selection keyboard.
 * @param {string} prefix - callback prefix ('interval' for setup, 'editint' for edit)
 * @param {string} backAction - where the back/cancel button goes
 */
export function intervalKeyboard(prefix = 'interval', backAction = 'cancel') {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('1 min', `${prefix}_1`),
      Markup.button.callback('2 min', `${prefix}_2`),
      Markup.button.callback('5 min', `${prefix}_5`),
    ],
    [
      Markup.button.callback('10 min', `${prefix}_10`),
      Markup.button.callback('30 min', `${prefix}_30`),
      Markup.button.callback('60 min', `${prefix}_60`),
    ],
    [Markup.button.callback(backAction === 'cancel' ? '❌ Cancel' : '⬅️ Back', backAction)],
  ]);
}

/**
 * Setup confirmation keyboard.
 */
export function confirmationKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ Activate bot', 'confirm_yes')],
    [Markup.button.callback('❌ Cancel', 'confirm_no')],
  ]);
}

/**
 * Status screen actions.
 */
export function statusKeyboard(config) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🔄 Refresh', 'status'), Markup.button.callback('⚡ Run now', 'runnow')],
    [Markup.button.callback('⚙️ Settings', 'settings'), Markup.button.callback('⬅️ Menu', 'menu')],
  ]);
}

/**
 * Cancel-only keyboard (used mid-input).
 */
export function cancelKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('❌ Cancel', 'cancel')]]);
}

/**
 * Back to menu.
 */
export function backToMenuKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to menu', 'menu')]]);
}

/**
 * Irreversible-setup warning confirmation.
 */
export function warningConfirmationKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ I understand — continue', 'warning_accept')],
    [Markup.button.callback('❌ Cancel', 'warning_cancel')],
  ]);
}

/**
 * Delete confirmation.
 */
export function deleteConfirmKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🗑️ Yes, delete it', 'confirm_delete')],
    [Markup.button.callback('⬅️ Keep it', 'menu')],
  ]);
}
