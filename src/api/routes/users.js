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
  const uid = parseInt(telegram_user_id);
  if (!uid || uid < 1) return res.status(400).json({ error: 'Valid telegram_user_id required' });
  banUser(uid, null, null, reason || 'Banned from dashboard', req.user.username);
  broadcast('moderation_action', { action: 'banned', user_id: uid });
  res.json({ ok: true });
});

router.post('/unban', (req, res) => {
  const { telegram_user_id } = req.body;
  const uid = parseInt(telegram_user_id);
  if (!uid || uid < 1) return res.status(400).json({ error: 'Valid telegram_user_id required' });
  unbanUser(uid, req.user.username);
  broadcast('moderation_action', { action: 'unbanned', user_id: uid });
  res.json({ ok: true });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!id || id < 1) return res.status(400).json({ error: 'Invalid ID' });
  const confessions = getUserConfessions(id);
  res.json(confessions);
});

export default router;
