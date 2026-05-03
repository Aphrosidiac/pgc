import config from '../../config.js';
import { getConfession, approveConfession, rejectConfession, banUser } from '../../db/queries.js';

function isAdmin(ctx) {
  return config.ADMIN_IDS.includes(ctx.from?.id);
}

export function setupModerationHandler(bot, broadcast) {
  bot.callbackQuery(/^approve:(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return ctx.answerCallbackQuery('Not authorized.');
    const id = parseInt(ctx.match[1]);
    const confession = getConfession(id);
    if (!confession) return ctx.answerCallbackQuery('Confession not found.');
    if (confession.status !== 'pending') return ctx.answerCallbackQuery('Already reviewed.');

    const reviewer = ctx.from.first_name || String(ctx.from.id);
    const num = approveConfession(id, reviewer);

    try {
      if (confession.type === 'photo') {
        await bot.api.sendPhoto(config.CHANNEL_ID, confession.file_id, {
          caption: `#${num}\n\n${confession.content || ''}`,
        });
      } else {
        await bot.api.sendMessage(config.CHANNEL_ID, `#${num}\n\n${confession.content}`);
      }
    } catch (e) {
      console.error('Failed to post to channel:', e.message);
    }

    try {
      await bot.api.sendMessage(confession.user_id, `Your confession #${num} has been posted!`);
    } catch {}

    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    const statusText = `✅ Approved (#${num}) by ${reviewer}`;
    try { await ctx.editMessageText(ctx.msg.text + `\n\n${statusText}`); } catch {}
    try { await ctx.editMessageCaption({ caption: (ctx.msg.caption || '') + `\n\n${statusText}` }); } catch {}

    broadcast('moderation_action', { id, action: 'approved', confession_number: num });
    await ctx.answerCallbackQuery('Approved!');
  });

  bot.callbackQuery(/^reject:(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return ctx.answerCallbackQuery('Not authorized.');
    const id = parseInt(ctx.match[1]);
    const confession = getConfession(id);
    if (!confession) return ctx.answerCallbackQuery('Confession not found.');
    if (confession.status !== 'pending') return ctx.answerCallbackQuery('Already reviewed.');

    const reviewer = ctx.from.first_name || String(ctx.from.id);
    rejectConfession(id, reviewer, null);

    try {
      await bot.api.sendMessage(confession.user_id, 'Your confession was not approved.');
    } catch {}

    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    const statusText = `❌ Rejected by ${reviewer}`;
    try { await ctx.editMessageText(ctx.msg.text + `\n\n${statusText}`); } catch {}
    try { await ctx.editMessageCaption({ caption: (ctx.msg.caption || '') + `\n\n${statusText}` }); } catch {}

    broadcast('moderation_action', { id, action: 'rejected' });
    await ctx.answerCallbackQuery('Rejected.');
  });

  bot.callbackQuery(/^ban:(\d+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return ctx.answerCallbackQuery('Not authorized.');
    const id = parseInt(ctx.match[1]);
    const confession = getConfession(id);
    if (!confession) return ctx.answerCallbackQuery('Confession not found.');

    const reviewer = ctx.from.first_name || String(ctx.from.id);
    banUser(confession.user_id, confession.username, confession.first_name, 'Banned via moderation', reviewer);

    if (confession.status === 'pending') {
      rejectConfession(id, reviewer, 'User banned');
    }

    try {
      await bot.api.sendMessage(confession.user_id, 'You have been banned from this bot.');
    } catch {}

    await ctx.editMessageReplyMarkup({ reply_markup: undefined });
    const statusText = `⛔ User banned by ${reviewer}`;
    try { await ctx.editMessageText(ctx.msg.text + `\n\n${statusText}`); } catch {}
    try { await ctx.editMessageCaption({ caption: (ctx.msg.caption || '') + `\n\n${statusText}` }); } catch {}

    broadcast('moderation_action', { id, action: 'banned', user_id: confession.user_id });
    await ctx.answerCallbackQuery('User banned.');
  });
}
