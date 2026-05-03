import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'pagoh-confess.db');

let db;

export function initDb() {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS confessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      username TEXT,
      first_name TEXT,
      type TEXT NOT NULL DEFAULT 'text',
      content TEXT,
      file_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      confession_number INTEGER,
      mod_message_id INTEGER,
      channel_message_id INTEGER,
      reviewed_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      reviewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS banned_users (
      user_id INTEGER PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      reason TEXT,
      banned_by TEXT,
      banned_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS banned_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL UNIQUE COLLATE NOCASE
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      target_id INTEGER,
      actor TEXT,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('next_confession_number', '1');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('bot_active', 'true');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('moderation_enabled', 'false');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('msg_start', 'You can start confessing to Pagoh Confess. Simply write your confession and it will be sent automatically. Photos confessions are also supported. Just dont be too extreme. Wait 5 seconds before sending each messages to avoid spam');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('msg_spam', 'jangan spam pls');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('msg_banned', 'YOURE BANNED DUMBASS LMFAOO LOOSER ASS BITCH');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('msg_wordfilter', 'banned words detected');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('msg_paused', 'Confessions are currently paused. Please try again later.');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('msg_submitted', 'Your confession has been submitted for review.');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('msg_posted', 'Your confession #{{number}} has been posted!');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('msg_channel_format', '#{{number}}\n\n{{content}}');
    INSERT OR IGNORE INTO banned_words (word) VALUES ('bodo');
  `);

  return db;
}

export function getDb() {
  return db;
}
