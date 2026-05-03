import { Router } from 'express';
import { getBannedWords, addBannedWord, removeBannedWord } from '../../db/queries.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(getBannedWords());
});

router.post('/', (req, res) => {
  const { word } = req.body;
  if (!word) return res.status(400).json({ error: 'word required' });
  const ok = addBannedWord(word, req.user.username);
  if (!ok) return res.status(409).json({ error: 'Word already exists' });
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  removeBannedWord(parseInt(req.params.id), req.user.username);
  res.json({ ok: true });
});

export default router;
