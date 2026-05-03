import { Router } from 'express';
import config from '../../config.js';
import { listConfessions, getConfession, approveConfession, rejectConfession } from '../../db/queries.js';
import { broadcast } from '../sse.js';

export default function confessionsRouter(bot) {
  const router = Router();

  router.get('/', (req, res) => {
    const { status, page = 1, limit = 20, search = '' } = req.query;
    const result = listConfessions(status, parseInt(page), parseInt(limit), search);
    res.json(result);
  });

  router.get('/:id', (req, res) => {
    const confession = getConfession(parseInt(req.params.id));
    if (!confession) return res.status(404).json({ error: 'Not found' });
    res.json(confession);
  });

  router.post('/:id/approve', async (req, res) => {
    const confession = getConfession(parseInt(req.params.id));
    if (!confession) return res.status(404).json({ error: 'Not found' });
    if (confession.status !== 'pending') return res.status(400).json({ error: 'Already reviewed' });

    const num = approveConfession(confession.id, req.user.username);

    if (bot) {
      try {
        if (confession.type === 'photo') {
          await bot.api.sendPhoto(config.CHANNEL_ID, confession.file_id, {
            caption: `#${num}\n\n${confession.content || ''}`,
          });
        } else {
          await bot.api.sendMessage(config.CHANNEL_ID, `#${num}\n\n${confession.content}`);
        }
        await bot.api.sendMessage(confession.user_id, `Your confession #${num} has been posted!`).catch(() => {});
      } catch (e) {
        console.error('Channel post failed:', e.message);
      }
    }

    broadcast('moderation_action', { id: confession.id, action: 'approved', confession_number: num });
    res.json({ ok: true, confession_number: num });
  });

  router.post('/:id/reject', (req, res) => {
    const confession = getConfession(parseInt(req.params.id));
    if (!confession) return res.status(404).json({ error: 'Not found' });
    if (confession.status !== 'pending') return res.status(400).json({ error: 'Already reviewed' });

    rejectConfession(confession.id, req.user.username, req.body.reason);

    if (bot) {
      bot.api.sendMessage(confession.user_id, 'Your confession was not approved.').catch(() => {});
    }

    broadcast('moderation_action', { id: confession.id, action: 'rejected' });
    res.json({ ok: true });
  });

  return router;
}
