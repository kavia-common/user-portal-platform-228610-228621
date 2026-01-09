/**
 * PUBLIC_INTERFACE
 * Express middleware that requires an authenticated session.
 *
 * Assumes express-session has been configured and sets req.session.userId on login.
 */
function requireAuth(req, res, next) {
  const userId = req.session && req.session.userId;
  if (!userId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  return next();
}

module.exports = {
  requireAuth,
};
