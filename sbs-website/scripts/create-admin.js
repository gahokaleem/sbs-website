// Optional: set/reset an admin from the command line.
// Usage: node scripts/create-admin.js <username> <password>
require('dotenv').config();
const { hashPassword } = require('../src/password');
const { initDb, ensureSchema } = require('../src/db');

const [, , username, password] = process.argv;
if (!username || !password) {
  console.error('Usage: node scripts/create-admin.js <username> <password>');
  process.exit(1);
}
(async () => {
  const db = initDb();
  await ensureSchema(db);
  await db.execute({
    sql: 'INSERT INTO admins (username, password_hash) VALUES (?, ?) ' +
         'ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash',
    args: [username, hashPassword(password)]
  });
  console.log('Admin account ready: ' + username);
})();
