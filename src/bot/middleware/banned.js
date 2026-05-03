import { isBanned } from '../../db/queries.js';

export function bannedMiddleware(ctx, next) {
  if (!ctx.from) return next();
  if (isBanned(ctx.from.id)) {
    return ctx.reply('YOURE BANNED DUMBASS LMFAOO LOOSER ASS BITCH');
  }
  return next();
}
