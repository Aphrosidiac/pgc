import config from '../../config.js';
import { createConfession, updateConfessionModMessage, getSetting, approveConfession } from '../../db/queries.js';
import { moderationKeyboard } from '../keyboards.js';

export function setupConfessionHandler(bot, broadcast) {
  bot.on('message:text', async (ctx) => {
    if (ctx.chat.type !== 'private') return;

    if (getSetting('bot_active') === 'false') {
      return ctx.reply('Confessions are currently paused. Please try again later.');
    }

    const user = ctx.from;
    const text = ctx.message.text;
    const id = createConfession(user.id, user.username, user.first_name, 'text', text, null);
    const modEnabled = getSetting('moderation_enabled') === 'true';

    if (modEnabled) {
      const modText = `📨 #${id} — New Confession\n\n${text}\n\n👤 ${user.first_name || ''}${user.username ? ' @' + user.username : ''}\n🆔 ${user.id}`;
      try {
        const modMsg = await bot.api.sendMessage(config.MOD_GROUP_ID, modText, {
          reply_markup: moderationKeyboard(id),
        });
        updateConfessionModMessage(id, modMsg.message_id);
      } catch (e) {
        console.error('Failed to send to mod group:', e.message);
      }
      broadcast('new_confession', { id, type: 'text', content: text, user_id: user.id, username: user.username });
      await ctx.reply('Your confession has been submitted for review.');
    } else {
      const num = approveConfession(id, 'auto');
      try {
        await bot.api.sendMessage(config.CHANNEL_ID, `#${num}\n\n${text}`);
      } catch (e) {
        console.error('Failed to post to channel:', e.message);
      }
      try {
        await bot.api.sendMessage(config.MOD_GROUP_ID, `✅ #${num} Auto-posted\n\n${text}\n\n👤 ${user.first_name || ''}${user.username ? ' @' + user.username : ''}\n🆔 ${user.id}`);
      } catch {}
      broadcast('new_confession', { id, type: 'text', content: text, user_id: user.id, username: user.username, auto: true });
      await ctx.reply(`Your confession #${num} has been posted!`);
    }
  });

  bot.on('message:photo', async (ctx) => {
    if (ctx.chat.type !== 'private') return;

    if (getSetting('bot_active') === 'false') {
      return ctx.reply('Confessions are currently paused. Please try again later.');
    }

    const user = ctx.from;
    const photo = ctx.message.photo;
    const fileId = photo[photo.length - 1].file_id;
    const caption = ctx.message.caption || '';
    const id = createConfession(user.id, user.username, user.first_name, 'photo', caption, fileId);
    const modEnabled = getSetting('moderation_enabled') === 'true';

    if (modEnabled) {
      const modCaption = `📨 #${id} — Photo Confession\n\n${caption}\n\n👤 ${user.first_name || ''}${user.username ? ' @' + user.username : ''}\n🆔 ${user.id}`;
      try {
        const modMsg = await bot.api.sendPhoto(config.MOD_GROUP_ID, fileId, {
          caption: modCaption,
          reply_markup: moderationKeyboard(id),
        });
        updateConfessionModMessage(id, modMsg.message_id);
      } catch (e) {
        console.error('Failed to send photo to mod group:', e.message);
      }
      broadcast('new_confession', { id, type: 'photo', content: caption, user_id: user.id, username: user.username });
      await ctx.reply('Your confession has been submitted for review.');
    } else {
      const num = approveConfession(id, 'auto');
      try {
        await bot.api.sendPhoto(config.CHANNEL_ID, fileId, {
          caption: `#${num}\n\n${caption}`,
        });
      } catch (e) {
        console.error('Failed to post photo to channel:', e.message);
      }
      try {
        await bot.api.sendPhoto(config.MOD_GROUP_ID, fileId, {
          caption: `✅ #${num} Auto-posted\n\n${caption}\n\n👤 ${user.first_name || ''}${user.username ? ' @' + user.username : ''}\n🆔 ${user.id}`,
        });
      } catch {}
      broadcast('new_confession', { id, type: 'photo', content: caption, user_id: user.id, username: user.username, auto: true });
      await ctx.reply(`Your confession #${num} has been posted!`);
    }
  });
}
