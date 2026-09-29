const express = require('express');
const multer = require('multer');
const requireAdmin = require('../middleware/requireAdmin');

// Images are stored as base64 inside the database (as image_data), not on
// local disk — free hosts wipe local disk on restart, but the database
// (Turso in production) persists on its own.
module.exports = function (db) {
  const router = express.Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 }, // keep photos modest since they live in the DB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
      cb(null, true);
    }
  });

  router.get('/', async (req, res) => {
    const { category, q } = req.query;
    let sql = 'SELECT * FROM products';
    const conds = [];
    const args = [];
    if (category && category !== 'All') { conds.push('category = ?'); args.push(category); }
    if (q) { conds.push('LOWER(name) LIKE ?'); args.push('%' + String(q).toLowerCase() + '%'); }
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY id DESC';
    const result = await db.execute({ sql, args });
    res.json(result.rows);
  });

  router.post('/', requireAdmin, (req, res) => {
    upload.single('image')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      const { name, price, market, category } = req.body;
      if (!name || !price || !market || !category) {
        return res.status(400).json({ error: 'Missing fields' });
      }
      const image_data = req.file
        ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
        : null;
      const result = await db.execute({
        sql: 'INSERT INTO products (name, price, market, category, image_data) VALUES (?,?,?,?,?)',
        args: [name, Number(price), market, category, image_data]
      });
      const id = Number(result.lastInsertRowid);
      const row = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [id] });
      res.json(row.rows[0]);
    });
  });

  router.delete('/:id', requireAdmin, async (req, res) => {
    await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [req.params.id] });
    res.json({ ok: true });
  });

  return router;
};
