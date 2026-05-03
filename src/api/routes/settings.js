import { Router } from 'express';
import { getSetting, setSetting } from '../../db/queries.js';

const router = Router();

router.get('/bot-status', (req, res) => {
  const active = getSetting('bot_active') !== 'false';
  res.json({ active });
});

router.post('/bot-status', (req, res) => {
  const { active } = req.body;
  setSetting('bot_active', active ? 'true' : 'false');
  res.json({ active });
});

router.get('/moderation', (req, res) => {
  const enabled = getSetting('moderation_enabled') === 'true';
  res.json({ enabled });
});

router.post('/moderation', (req, res) => {
  const { enabled } = req.body;
  setSetting('moderation_enabled', enabled ? 'true' : 'false');
  res.json({ enabled });
});

export default router;
