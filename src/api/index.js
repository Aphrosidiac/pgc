import { Router } from 'express';
import { authMiddleware } from './middleware/auth.js';
import { sseHandler } from './sse.js';
import authRouter from './routes/auth.js';
import confessionsRouter from './routes/confessions.js';
import usersRouter from './routes/users.js';
import filtersRouter from './routes/filters.js';
import statsRouter from './routes/stats.js';
import logsRouter from './routes/logs.js';
import settingsRouter from './routes/settings.js';

export function createApiRouter(bot) {
  const router = Router();

  router.use('/auth', authRouter);

  router.use('/confessions', authMiddleware, confessionsRouter(bot));
  router.use('/users', authMiddleware, usersRouter);
  router.use('/filters', authMiddleware, filtersRouter);
  router.use('/stats', authMiddleware, statsRouter);
  router.use('/logs', authMiddleware, logsRouter);
  router.use('/settings', authMiddleware, settingsRouter);
  router.get('/events', authMiddleware, sseHandler);

  return router;
}
