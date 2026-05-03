import { isBanned, getSetting } from '../../db/queries.js';

export function bannedMiddleware(ctx, next) {
  if (!ctx.from) return next();
  if (isBanned(ctx.from.id)) {
    return ctx.reply(getSetting('msg_banned') || 'You are banned from using this bot.');
  }
  return next();
}
