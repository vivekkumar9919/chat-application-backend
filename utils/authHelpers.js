const bcrypt = require('bcrypt');

const DEFAULT_SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

/**
 * Hash a password (async).
 * @param {string} password - Plain-text password
 * @param {number} [saltRounds=DEFAULT_SALT_ROUNDS]
 * @returns {Promise<string>} bcrypt hash
 */
async function hashPassword(password, saltRounds = DEFAULT_SALT_ROUNDS) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string');
  }
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain password to a stored bcrypt hash.
 * @param {string} password - Plain-text password
 * @param {string} hash - Stored bcrypt hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  if (typeof password !== 'string' || typeof hash !== 'string') return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    // Optionally log the error, but don't expose details to client
    return false;
  }
}


module.exports = {
  hashPassword,
  comparePassword
};