const express = require('express');
const requireAdmin = require('../middleware/requireAdmin');

module.exports = function (db) {
  const router = express.Router();

  // Public: place an order
  router.post('/', async (req, res) => {
    const { customerName, phone, address, items } = req.body || {};
    if (!customerName || !phone || !address || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    const orderResult = await db.execute({
      sql: 'INSERT INTO orders (customer_name, phone, address) VALUES (?,?,?)',
      args: [customerName, phone, address]
    });
    const orderId = Number(orderResult.lastInsertRowid);

    let total = 0;
    for (const it of items) {
      const productRes = await db.execute({ sql: 'SELECT * FROM products WHERE id = ?', args: [it.productId] });
      const product = productRes.rows[0];
      if (!product) continue;
      const qty = Math.max(1, parseInt(it.qty) || 1);
      await db.execute({
        sql: 'INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?,?,?,?,?)',
        args: [orderId, product.id, product.name, product.price, qty]
      });
      total += product.price * qty;
    }
    await db.execute({ sql: 'UPDATE orders SET total = ? WHERE id = ?', args: [total, orderId] });
    res.json({ ok: true, orderId });
  });

  // Admin: all orders. Public: a customer's own orders by phone (?phone=...)
  router.get('/', async (req, res) => {
    const { phone } = req.query;
    const isAdmin = req.session && req.session.isAdmin;
    if (!isAdmin && !phone) return res.status(400).json({ error: 'Phone number required' });

    const ordersRes = isAdmin && !phone
      ? await db.execute('SELECT * FROM orders ORDER BY id DESC')
      : await db.execute({ sql: 'SELECT * FROM orders WHERE phone = ? ORDER BY id DESC', args: [phone] });

    const withItems = [];
    for (const o of ordersRes.rows) {
      const itemsRes = await db.execute({ sql: 'SELECT * FROM order_items WHERE order_id = ?', args: [o.id] });
      withItems.push({ ...o, items: itemsRes.rows });
    }
    res.json(withItems);
  });

  // Admin only: update an order's status
  router.patch('/:id', requireAdmin, async (req, res) => {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'Missing status' });
    await db.execute({ sql: 'UPDATE orders SET status = ? WHERE id = ?', args: [status, req.params.id] });
    res.json({ ok: true });
  });

  return router;
};
