import { Router } from 'express';
import { getActivityLog } from '../../db/queries.js';

const router = Router();

router.get('/', (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  res.json(getActivityLog(parseInt(page), parseInt(limit)));
});

export default router;
