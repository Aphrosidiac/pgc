import express from 'express';
import cookieParser from 'cookie-parser';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import config from './config.js';
import { initDb } from './db/database.js';
import { createApiRouter } from './api/index.js';
import { createBot } from './bot/index.js';
import { broadcast } from './api/sse.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

initDb();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

let bot = null;

if (config.BOT_TOKEN) {
  bot = createBot(config.BOT_TOKEN, { broadcast });
  bot.start({ onStart: () => console.log('Telegram bot running') });
}

app.use('/api', createApiRouter(bot));

const dashDist = join(__dirname, '..', 'dashboard', 'dist');
if (existsSync(dashDist)) {
  app.use(express.static(dashDist));
  app.get('/{*splat}', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(dashDist, 'index.html'));
    }
  });
}

app.listen(config.PORT, () => {
  console.log(`Pagoh Confess running on http://localhost:${config.PORT}`);
});
