require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const { initDb, ensureSchema, ensureAdmin } = require('./src/db');
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');

const PORT = process.env.PORT || 3000;

async function start() {
  const db = initDb();
  await ensureSchema(db);
  await ensureAdmin(db);

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(session({
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 12 // 12 hours
    }
  }));

  app.use('/api/auth', authRoutes(db));
  app.use('/api/products', productRoutes(db));
  app.use('/api/orders', orderRoutes(db));
  // Separate admin page (not linked from the public storefront)
  app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
  app.use(express.static(path.join(__dirname, 'public')));

  app.listen(PORT, () => console.log(`SBS marketplace running on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
