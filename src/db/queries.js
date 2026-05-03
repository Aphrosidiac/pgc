import { getDb } from './database.js';

export function createConfession(userId, username, firstName, type, content, fileId) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO confessions (user_id, username, first_name, type, content, file_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(userId, username, firstName, type, content, fileId);
  return result.lastInsertRowid;
}

export function getConfession(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM confessions WHERE id = ?').get(id);
}

export function listConfessions(status, page = 1, limit = 20, search = '') {
  const db = getDb();
  const offset = (page - 1) * limit;
  let where = '1=1';
  const params = [];

  if (status && status !== 'all') {
    where += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    where += ' AND content LIKE ?';
    params.push(`%${search}%`);
  }

  const rows = db.prepare(`
    SELECT * FROM confessions WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const total = db.prepare(`SELECT COUNT(*) as count FROM confessions WHERE ${where}`).get(...params).count;

  return { rows, total, page, limit };
}

export function updateConfessionModMessage(id, modMessageId) {
  const db = getDb();
  db.prepare('UPDATE confessions SET mod_message_id = ? WHERE id = ?').run(modMessageId, id);
}

export function approveConfession(id, reviewedBy) {
  const db = getDb();
  const approve = db.transaction(() => {
    const num = db.prepare("SELECT value FROM settings WHERE key = 'next_confession_number'").get();
    const confessionNumber = parseInt(num.value);
    db.prepare("UPDATE settings SET value = ? WHERE key = 'next_confession_number'").run(String(confessionNumber + 1));
    db.prepare(`
      UPDATE confessions SET status = 'approved', confession_number = ?, reviewed_by = ?, reviewed_at = datetime('now')
      WHERE id = ?
    `).run(confessionNumber, reviewedBy, id);
    logActivity('approve', id, reviewedBy, null);
    return confessionNumber;
  });
  return approve();
}

export function rejectConfession(id, reviewedBy, reason) {
  const db = getDb();
  db.prepare(`
    UPDATE confessions SET status = 'rejected', reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?
  `).run(reviewedBy, id);
  logActivity('reject', id, reviewedBy, reason);
}

export function banUser(userId, username, firstName, reason, bannedBy) {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO banned_users (user_id, username, first_name, reason, banned_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, username, firstName, reason, bannedBy);
  logActivity('ban', userId, bannedBy, reason);
}

export function unbanUser(userId, unbannedBy) {
  const db = getDb();
  db.prepare('DELETE FROM banned_users WHERE user_id = ?').run(userId);
  logActivity('unban', userId, unbannedBy, null);
}

export function isBanned(userId) {
  const db = getDb();
  return !!db.prepare('SELECT 1 FROM banned_users WHERE user_id = ?').get(userId);
}

export function getBanList() {
  const db = getDb();
  return db.prepare('SELECT * FROM banned_users ORDER BY banned_at DESC').all();
}

export function addBannedWord(word, addedBy) {
  const db = getDb();
  try {
    db.prepare('INSERT INTO banned_words (word) VALUES (?)').run(word.toLowerCase());
    logActivity('add_word', null, addedBy, word);
    return true;
  } catch {
    return false;
  }
}

export function removeBannedWord(id, removedBy) {
  const db = getDb();
  const word = db.prepare('SELECT word FROM banned_words WHERE id = ?').get(id);
  db.prepare('DELETE FROM banned_words WHERE id = ?').run(id);
  logActivity('remove_word', id, removedBy, word?.word);
}

export function getBannedWords() {
  const db = getDb();
  return db.prepare('SELECT * FROM banned_words ORDER BY word ASC').all();
}

export function checkBannedWords(text) {
  const db = getDb();
  const words = db.prepare('SELECT word FROM banned_words').all();
  const lower = text.toLowerCase();
  return words.find(w => lower.includes(w.word));
}

export function getStats() {
  const db = getDb();
  const total = db.prepare("SELECT COUNT(*) as count FROM confessions").get().count;
  const approved = db.prepare("SELECT COUNT(*) as count FROM confessions WHERE status = 'approved'").get().count;
  const rejected = db.prepare("SELECT COUNT(*) as count FROM confessions WHERE status = 'rejected'").get().count;
  const pending = db.prepare("SELECT COUNT(*) as count FROM confessions WHERE status = 'pending'").get().count;
  const banned = db.prepare("SELECT COUNT(*) as count FROM banned_users").get().count;
  return { total, approved, rejected, pending, banned };
}

export function getDailyStats(days = 30) {
  const db = getDb();
  return db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM confessions
    WHERE created_at >= datetime('now', ?)
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all(`-${days} days`);
}

export function getHourlyStats() {
  const db = getDb();
  return db.prepare(`
    SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count
    FROM confessions
    GROUP BY hour
    ORDER BY hour ASC
  `).all();
}

export function logActivity(action, targetId, actor, details) {
  const db = getDb();
  db.prepare(`
    INSERT INTO activity_log (action, target_id, actor, details) VALUES (?, ?, ?, ?)
  `).run(action, targetId, actor, details);
}

export function getActivityLog(page = 1, limit = 50) {
  const db = getDb();
  const offset = (page - 1) * limit;
  const rows = db.prepare('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) as count FROM activity_log').get().count;
  return { rows, total, page, limit };
}

export function getSetting(key) {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row?.value;
}

export function setSetting(key, value) {
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export function getUserConfessions(userId) {
  const db = getDb();
  return db.prepare('SELECT * FROM confessions WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}
