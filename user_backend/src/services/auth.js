const bcrypt = require('bcryptjs');
const { getPool } = require('../db/pool');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  // Simple validation; production apps should use a more comprehensive approach.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * PUBLIC_INTERFACE
 * Register a new user.
 *
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.displayName
 * @returns {Promise<{id: number, email: string, displayName: string}>}
 */
async function registerUser({ email, password, displayName }) {
  const pool = getPool();

  const normalizedEmail = normalizeEmail(email);
  const safeDisplayName = String(displayName || '').trim();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    const err = new Error('Invalid email.');
    err.statusCode = 400;
    throw err;
  }
  if (!password || String(password).length < 8) {
    const err = new Error('Password must be at least 8 characters.');
    err.statusCode = 400;
    throw err;
  }
  if (!safeDisplayName) {
    const err = new Error('Display name is required.');
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(String(password), 12);

  try {
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
      [normalizedEmail, passwordHash, safeDisplayName]
    );

    return {
      id: Number(result.insertId),
      email: normalizedEmail,
      displayName: safeDisplayName,
    };
  } catch (e) {
    // ER_DUP_ENTRY for duplicate email unique constraint
    if (e && (e.code === 'ER_DUP_ENTRY' || e.errno === 1062)) {
      const err = new Error('Email already registered.');
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }
}

/**
 * PUBLIC_INTERFACE
 * Authenticate a user by email/password.
 *
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.password
 * @returns {Promise<{id: number, email: string, displayName: string}>}
 */
async function authenticateUser({ email, password }) {
  const pool = getPool();

  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    const err = new Error('Email and password are required.');
    err.statusCode = 400;
    throw err;
  }

  const [rows] = await pool.query(
    'SELECT id, email, password_hash, display_name FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (!rows || rows.length === 0) {
    const err = new Error('Invalid credentials.');
    err.statusCode = 401;
    throw err;
  }

  const user = rows[0];
  const ok = await bcrypt.compare(String(password), user.password_hash);
  if (!ok) {
    const err = new Error('Invalid credentials.');
    err.statusCode = 401;
    throw err;
  }

  return {
    id: Number(user.id),
    email: user.email,
    displayName: user.display_name,
  };
}

/**
 * PUBLIC_INTERFACE
 * Get a user by ID (for /me and session hydration).
 *
 * @param {number} userId
 * @returns {Promise<{id: number, email: string, displayName: string} | null>}
 */
async function getUserById(userId) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, email, display_name FROM users WHERE id = ? LIMIT 1',
    [Number(userId)]
  );
  if (!rows || rows.length === 0) return null;
  return {
    id: Number(rows[0].id),
    email: rows[0].email,
    displayName: rows[0].display_name,
  };
}

module.exports = {
  registerUser,
  authenticateUser,
  getUserById,
};
