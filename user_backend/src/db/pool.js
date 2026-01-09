const mysql = require('mysql2/promise');

/**
 * Creates a singleton MySQL connection pool using environment variables.
 * This avoids reconnect overhead and provides safe, parameterized query support.
 */
let pool;

/**
 * PUBLIC_INTERFACE
 * Get (and lazily initialize) the shared MySQL pool.
 *
 * Environment variables required:
 * - DB_HOST
 * - DB_PORT
 * - DB_USER
 * - DB_PASSWORD
 * - DB_NAME
 *
 * @returns {import('mysql2/promise').Pool} MySQL pool
 */
function getPool() {
  if (pool) return pool;

  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
  } = process.env;

  if (!DB_HOST || !DB_PORT || !DB_USER || !DB_NAME) {
    throw new Error(
      'Database configuration missing. Require DB_HOST, DB_PORT, DB_USER, DB_NAME (and DB_PASSWORD if set).'
    );
  }

  pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Keep MySQL DATETIME/TIMESTAMP consistent; app can treat them as strings.
    dateStrings: true,
  });

  return pool;
}

module.exports = {
  getPool,
};
