import { Bot } from 'grammy';
import { spamMiddleware } from './middleware/spam.js';
import { bannedMiddleware } from './middleware/banned.js';
import { wordFilterMiddleware } from './middleware/wordfilter.js';
import { setupConfessionHandler } from './handlers/confession.js';
import { setupModerationHandler } from './handlers/moderation.js';
import { setupAdminHandler } from './handlers/admin.js';

export function createBot(token, { broadcast }) {
  const bot = new Bot(token);

  bot.use(async (ctx, next) => {
    if (ctx.callbackQuery) return next();
    if (ctx.message?.chat?.type !== 'private') return next();

    if (ctx.message?.text?.startsWith('/')) return next();

    await spamMiddleware(ctx, async () => {
      await bannedMiddleware(ctx, async () => {
        await wordFilterMiddleware(ctx, next);
      });
    });
  });

  setupAdminHandler(bot);
  setupConfessionHandler(bot, broadcast);
  setupModerationHandler(bot, broadcast);

  bot.catch((err) => {
    console.error('Bot error:', err.message);
  });

  return bot;
}
