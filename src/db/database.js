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
    INSERT OR IGNORE INTO banned_words (word) VALUES ('bodo');
  `);

  return db;
}

export function getDb() {
  return db;
}
