import { Router } from 'express';
import { getSetting, setSetting } from '../../db/queries.js';
import { getDb } from '../../db/database.js';

const router = Router();

const MSG_DEFAULTS = {
  msg_start: 'You can start confessing to Pagoh Confess. Simply write your confession and it will be sent automatically. Photos confessions are also supported. Just dont be too extreme. Wait 5 seconds before sending each messages to avoid spam',
  msg_spam: 'jangan spam pls',
  msg_banned: 'YOURE BANNED DUMBASS LMFAOO LOOSER ASS BITCH',
  msg_wordfilter: 'banned words detected',
  msg_paused: 'Confessions are currently paused. Please try again later.',
  msg_submitted: 'Your confession has been submitted for review.',
  msg_posted: 'Your confession #{{number}} has been posted!',
  msg_channel_format: '#{{number}}\n\n{{content}}',
};

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

router.get('/messages', (req, res) => {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'msg_%'").all();
  const messages = {};
  for (const row of rows) {
    messages[row.key] = row.value;
  }
  for (const [key, def] of Object.entries(MSG_DEFAULTS)) {
    if (!(key in messages)) messages[key] = def;
  }
  res.json({ messages, defaults: MSG_DEFAULTS });
});

router.put('/messages/:key', (req, res) => {
  const { key } = req.params;
  if (!(key in MSG_DEFAULTS)) return res.status(400).json({ error: 'Invalid message key' });
  const { value } = req.body;
  if (typeof value !== 'string') return res.status(400).json({ error: 'Value must be a string' });
  setSetting(key, value);
  res.json({ key, value });
});

router.post('/messages/:key/reset', (req, res) => {
  const { key } = req.params;
  if (!(key in MSG_DEFAULTS)) return res.status(400).json({ error: 'Invalid message key' });
  const value = MSG_DEFAULTS[key];
  setSetting(key, value);
  res.json({ key, value });
});

export default router;
