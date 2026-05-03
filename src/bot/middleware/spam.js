import config from '../../config.js';
import { getSetting } from '../../db/queries.js';

const cooldowns = new Map();

export function spamMiddleware(ctx, next) {
  if (!ctx.from) return next();
  const userId = ctx.from.id;
  const now = Date.now();
  const last = cooldowns.get(userId) || 0;

  if (now - last < config.COOLDOWN_MS) {
    return ctx.reply(getSetting('msg_spam') || 'jangan spam pls');
  }

  cooldowns.set(userId, now);
  return next();
}
