import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config.js';

const router = Router();

const adminHash = bcrypt.hashSync(config.ADMIN_PASSWORD, 10);

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== config.ADMIN_USERNAME || !bcrypt.compareSync(password, adminHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, config.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
  res.json({ token, username });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    res.json({ username: payload.username });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
