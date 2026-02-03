import { Markup } from 'telegraf';

/**
 * Main menu keyboard
 */
export function mainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⚙️ Setup Bot', 'setup')],
    [Markup.button.callback('📊 Status', 'status')],
    [Markup.button.callback('⏸️ Pause', 'pause'), Markup.button.callback('▶️ Resume', 'resume')],
    [Markup.button.callback('🛑 Stop Bot', 'stop')],
    [Markup.button.callback('❓ Help', 'help')],
  ]);
}

/**
 * Interval selection keyboard
 */
export function intervalKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('1 min', 'interval_1'),
      Markup.button.callback('2 min', 'interval_2'),
      Markup.button.callback('5 min', 'interval_5'),
    ],
    [
      Markup.button.callback('10 min', 'interval_10'),
      Markup.button.callback('30 min', 'interval_30'),
      Markup.button.callback('60 min', 'interval_60'),
    ],
    [Markup.button.callback('❌ Cancel', 'cancel')],
  ]);
}

/**
 * Confirmation keyboard
 */
export function confirmationKeyboard() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Confirm', 'confirm_yes'),
      Markup.button.callback('❌ Cancel', 'confirm_no'),
    ],
  ]);
}

/**
 * Cancel keyboard
 */
export function cancelKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('❌ Cancel Setup', 'cancel')],
  ]);
}

/**
 * Back to menu keyboard
 */
export function backToMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🏠 Back to Menu', 'menu')],
  ]);
}

/**
 * Warning confirmation keyboard
 */
export function warningConfirmationKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✅ I Understand, Continue', 'warning_accept')],
    [Markup.button.callback('❌ Cancel Setup', 'warning_cancel')],
  ]);
}
