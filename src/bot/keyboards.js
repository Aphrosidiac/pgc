import { InlineKeyboard } from 'grammy';

export function moderationKeyboard(confessionId) {
  return new InlineKeyboard()
    .text('✓ Approve', `approve:${confessionId}`)
    .text('✗ Reject', `reject:${confessionId}`)
    .text('⛔ Ban', `ban:${confessionId}`);
}
