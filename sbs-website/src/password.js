// Password hashing using Node's built-in scrypt (no extra packages needed).
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [scheme, salt, hash] = String(stored).split('$');
    if (scheme !== 'scrypt') return false;
    const test = crypto.scryptSync(String(password), salt, 64);
    const good = Buffer.from(hash, 'hex');
    return good.length === test.length && crypto.timingSafeEqual(good, test);
  } catch (e) {
    return false;
  }
}

module.exports = { hashPassword, verifyPassword };
