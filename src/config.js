import 'dotenv/config';

export default {
  BOT_TOKEN: process.env.BOT_TOKEN,
  CHANNEL_ID: process.env.CHANNEL_ID || '@pagohconfessv2',
  MOD_GROUP_ID: process.env.MOD_GROUP_ID,
  ADMIN_IDS: (process.env.ADMIN_IDS || '').split(',').map(Number),
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'changeme',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  PORT: parseInt(process.env.PORT || '3100'),
  COOLDOWN_MS: parseInt(process.env.COOLDOWN_MS || '5000'),
};
