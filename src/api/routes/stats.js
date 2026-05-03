import { Router } from 'express';
import { getStats, getDailyStats, getHourlyStats } from '../../db/queries.js';

const router = Router();

router.get('/overview', (req, res) => {
  res.json(getStats());
});

router.get('/daily', (req, res) => {
  const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 30));
  res.json(getDailyStats(days));
});

router.get('/hourly', (req, res) => {
  res.json(getHourlyStats());
});

export default router;
