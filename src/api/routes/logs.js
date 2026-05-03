import { Router } from 'express';
import { getActivityLog } from '../../db/queries.js';

const router = Router();

router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  res.json(getActivityLog(page, limit));
});

export default router;
