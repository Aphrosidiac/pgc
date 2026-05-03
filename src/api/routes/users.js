import { Router } from 'express';
import { getBanList, banUser, unbanUser, getUserConfessions } from '../../db/queries.js';
import { broadcast } from '../sse.js';

const router = Router();

router.get('/banned', (req, res) => {
  const list = getBanList();
  const search = req.query.search?.toLowerCase();
  if (search) {
    const filtered = list.filter(u =>
      String(u.user_id).includes(search) ||
      (u.username || '').toLowerCase().includes(search) ||
      (u.first_name || '').toLowerCase().includes(search)
    );
    return res.json(filtered);
  }
  res.json(list);
});

router.post('/ban', (req, res) => {
  const { telegram_user_id, reason } = req.body;
  if (!telegram_user_id) return res.status(400).json({ error: 'telegram_user_id required' });
  banUser(parseInt(telegram_user_id), null, null, reason || 'Banned from dashboard', req.user.username);
  broadcast('moderation_action', { action: 'banned', user_id: telegram_user_id });
  res.json({ ok: true });
});

router.post('/unban', (req, res) => {
  const { telegram_user_id } = req.body;
  if (!telegram_user_id) return res.status(400).json({ error: 'telegram_user_id required' });
  unbanUser(parseInt(telegram_user_id), req.user.username);
  broadcast('moderation_action', { action: 'unbanned', user_id: telegram_user_id });
  res.json({ ok: true });
});

router.get('/:id', (req, res) => {
  const confessions = getUserConfessions(parseInt(req.params.id));
  res.json(confessions);
});

export default router;
