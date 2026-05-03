import { checkBannedWords } from '../../db/queries.js';

export function wordFilterMiddleware(ctx, next) {
  const text = ctx.message?.text || ctx.message?.caption || '';
  if (!text) return next();

  const matched = checkBannedWords(text);
  if (matched) {
    return ctx.reply('Your message contains a banned word and cannot be submitted.');
  }
  return next();
}
