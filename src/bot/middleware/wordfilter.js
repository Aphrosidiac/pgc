import { checkBannedWords, getSetting } from '../../db/queries.js';

export function wordFilterMiddleware(ctx, next) {
  const text = ctx.message?.text || ctx.message?.caption || '';
  if (!text) return next();

  const matched = checkBannedWords(text);
  if (matched) {
    return ctx.reply(getSetting('msg_wordfilter') || 'banned words detected');
  }
  return next();
}
