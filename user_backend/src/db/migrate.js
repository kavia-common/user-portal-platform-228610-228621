const { getPool } = require('./pool');

/**
 * PUBLIC_INTERFACE
 * Ensures required database tables exist (idempotent).
 *
 * This runs lightweight DDL on startup. In production you'd typically
 * use a migration tool, but for this app we keep it self-contained.
 *
 * @returns {Promise<void>}
 */
async function migrate() {
  const pool = getPool();

  // Create users table
  await pool.query(
    `CREATE TABLE IF NOT EXISTS users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  );
}

module.exports = {
  migrate,
};
