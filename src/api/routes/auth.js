import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config.js';

const router = Router();

const adminHash = bcrypt.hashSync(config.ADMIN_PASSWORD, 10);
let loginAttempts = {};

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  const now = Date.now();
  if (loginAttempts[ip] && loginAttempts[ip].count >= 10 && now - loginAttempts[ip].first < 900000) {
    return res.status(429).json({ error: 'Too many attempts. Try again later.' });
  }

  if (username !== config.ADMIN_USERNAME || !bcrypt.compareSync(password, adminHash)) {
    if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, first: now };
    loginAttempts[ip].count++;
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  delete loginAttempts[ip];
  const token = jwt.sign({ username }, config.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
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
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
