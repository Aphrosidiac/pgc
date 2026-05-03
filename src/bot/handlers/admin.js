import config from '../../config.js';
import { banUser, unbanUser, getBanList, addBannedWord, removeBannedWord, getBannedWords, getStats, getSetting, setSetting } from '../../db/queries.js';

function isAdmin(ctx) {
  return config.ADMIN_IDS.includes(ctx.from?.id);
}

export function setupAdminHandler(bot) {
  bot.command('ban', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const args = ctx.message.text.split(' ').slice(1);
    const userId = parseInt(args[0]);
    const reason = args.slice(1).join(' ') || 'No reason';
    if (!userId) return ctx.reply('Usage: /ban <user_id> [reason]');
    banUser(userId, null, null, reason, ctx.from.first_name);
    await ctx.reply(`Banned user ${userId}. Reason: ${reason}`);
  });

  bot.command('unban', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const userId = parseInt(ctx.message.text.split(' ')[1]);
    if (!userId) return ctx.reply('Usage: /unban <user_id>');
    unbanUser(userId, ctx.from.first_name);
    await ctx.reply(`Unbanned user ${userId}.`);
  });

  bot.command('banlist', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const list = getBanList();
    if (!list.length) return ctx.reply('No banned users.');
    const text = list.map(u => `• ${u.user_id}${u.username ? ' @' + u.username : ''} — ${u.reason || 'no reason'}`).join('\n');
    await ctx.reply(`Banned users:\n\n${text}`);
  });

  bot.command('addword', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const word = ctx.message.text.split(' ').slice(1).join(' ').trim();
    if (!word) return ctx.reply('Usage: /addword <word>');
    const ok = addBannedWord(word, ctx.from.first_name);
    await ctx.reply(ok ? `Added "${word}" to banned words.` : `"${word}" already exists.`);
  });

  bot.command('removeword', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const word = ctx.message.text.split(' ').slice(1).join(' ').trim();
    if (!word) return ctx.reply('Usage: /removeword <word>');
    const words = getBannedWords();
    const found = words.find(w => w.word === word.toLowerCase());
    if (!found) return ctx.reply(`"${word}" not found.`);
    removeBannedWord(found.id, ctx.from.first_name);
    await ctx.reply(`Removed "${word}" from banned words.`);
  });

  bot.command('words', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const words = getBannedWords();
    if (!words.length) return ctx.reply('No banned words.');
    await ctx.reply(`Banned words:\n\n${words.map(w => `• ${w.word}`).join('\n')}`);
  });

  bot.command('stats', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const s = getStats();
    await ctx.reply(`📊 Stats\n\nTotal: ${s.total}\nApproved: ${s.approved}\nRejected: ${s.rejected}\nPending: ${s.pending}\nBanned users: ${s.banned}`);
  });

  bot.command('toggle', async (ctx) => {
    if (!isAdmin(ctx)) return;
    const current = getSetting('bot_active');
    const newVal = current === 'true' ? 'false' : 'true';
    setSetting('bot_active', newVal);
    await ctx.reply(`Bot is now ${newVal === 'true' ? '✅ ACTIVE' : '⏸️ PAUSED'}`);
  });

  bot.command('start', async (ctx) => {
    if (ctx.chat.type !== 'private') return;
    await ctx.reply('Welcome to Pagoh Confess! Send me your confession (text or photo) and it will be reviewed before posting anonymously to the channel.');
  });
}
