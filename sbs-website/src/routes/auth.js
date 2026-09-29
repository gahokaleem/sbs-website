const express = require('express');
const { hashPassword, verifyPassword } = require('../password');
const requireAdmin = require('../middleware/requireAdmin');

module.exports = function (db) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
    const result = await db.execute({ sql: 'SELECT * FROM admins WHERE username = ?', args: [username] });
    const admin = result.rows[0];
    if (!admin || !verifyPassword(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    req.session.isAdmin = true;
    req.session.username = admin.username;
    res.json({ ok: true, username: admin.username });
  });

  router.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
  });

  router.get('/me', (req, res) => {
    res.json({
      isAdmin: !!(req.session && req.session.isAdmin),
      username: req.session && req.session.username
    });
  });

  // Change your own password (and optionally your username)
  router.post('/change-password', requireAdmin, async (req, res) => {
    const { currentPassword, newPassword, newUsername } = req.body || {};
    if (!currentPassword || !newPassword || String(newPassword).length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }
    const result = await db.execute({ sql: 'SELECT * FROM admins WHERE username = ?', args: [req.session.username] });
    const admin = result.rows[0];
    if (!admin || !verifyPassword(currentPassword, admin.password_hash)) {
      return res.status(401).json({ error: 'Current password is wrong.' });
    }
    const username = (newUsername || admin.username).trim();
    try {
      await db.execute({
        sql: 'UPDATE admins SET username = ?, password_hash = ? WHERE id = ?',
        args: [username, hashPassword(newPassword), admin.id]
      });
    } catch (e) {
      return res.status(400).json({ error: 'That username is already taken.' });
    }
    req.session.username = username;
    res.json({ ok: true });
  });

  return router;
};
