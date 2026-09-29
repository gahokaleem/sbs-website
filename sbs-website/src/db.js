const { createClient } = require('@libsql/client');
const { hashPassword } = require('./password');

// First-run admin account. Only a hash is stored here, never the password itself.
// Change the password right after your first login (Admin > Account).
const DEFAULT_ADMIN = { username: 'sbs_owner', hash: 'scrypt$ff3bdd04189cd6521b304898f65ed55b$9dd9f16bd3edc77c4db4f5574c734d24e66fde92ba149520135e525fa0a37fb24b6a87855b6f47c6b173442a091b5d2b802810b9b6f4b93db9a27dff3341de97' };

// Locally (no TURSO_DATABASE_URL set) this writes to a plain file, local.db,
// so you can develop without any account. In production, set
// TURSO_DATABASE_URL and TURSO_AUTH_TOKEN (from a free Turso database) so
// your data survives your host's restarts instead of living only on its
// temporary disk.
function initDb() {
  const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;
  return createClient(authToken ? { url, authToken } : { url });
}

async function ensureSchema(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    market TEXT NOT NULL,
    category TEXT NOT NULL,
    image_data TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    total REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'New',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.execute(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    qty INTEGER NOT NULL
  )`);
}

// Creates the admin login when none exists yet.
// Recovery: set ADMIN_USERNAME and ADMIN_PASSWORD as environment variables and
// restart. That resets that admin's password. Remove them afterwards.
async function ensureAdmin(db) {
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  if (envUser && envPass) {
    await db.execute({
      sql: 'INSERT INTO admins (username, password_hash) VALUES (?, ?) ' +
           'ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash',
      args: [envUser, hashPassword(envPass)]
    });
    return;
  }
  const res = await db.execute('SELECT COUNT(*) AS n FROM admins');
  if (Number(res.rows[0].n) === 0) {
    await db.execute({
      sql: 'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
      args: [DEFAULT_ADMIN.username, DEFAULT_ADMIN.hash]
    });
  }
}

module.exports = { initDb, ensureSchema, ensureAdmin };
