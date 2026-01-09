const jwt = require('jsonwebtoken');

/**
 * PUBLIC_INTERFACE
 * Express middleware that requires a valid Bearer JWT (issued by the API Gateway).
 *
 * Expected header:
 *   Authorization: Bearer <token>
 *
 * On success:
 *   - sets req.auth = decoded JWT payload
 *
 * Environment variables required:
 *   - JWT_SECRET (shared secret with the API Gateway)
 */
function requireJwt(req, res, next) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) {
    // Misconfiguration should surface loudly; do not silently allow access.
    return res.status(500).json({ status: 'error', message: 'Server misconfigured: JWT_SECRET missing' });
  }

  try {
    // Verify token signature and standard claims (exp, nbf if present).
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
}

module.exports = {
  requireJwt,
};
