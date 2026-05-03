import config from '../../config.js';

const cooldowns = new Map();

export function spamMiddleware(ctx, next) {
  if (!ctx.from) return next();
  const userId = ctx.from.id;
  const now = Date.now();
  const last = cooldowns.get(userId) || 0;

  if (now - last < config.COOLDOWN_MS) {
    return ctx.reply('Please wait a few seconds before sending another confession.');
  }

  cooldowns.set(userId, now);
  return next();
}
