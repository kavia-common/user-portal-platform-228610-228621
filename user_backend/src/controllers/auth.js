const authService = require('../services/auth');

class AuthController {
  /**
   * PUBLIC_INTERFACE
   * POST /auth/register
   * Registers a user and starts a session.
   */
  async register(req, res, next) {
    try {
      const { email, password, displayName } = req.body || {};
      const user = await authService.registerUser({ email, password, displayName });

      // Store minimal session info server-side
      req.session.userId = user.id;

      return res.status(201).json({ user });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * POST /auth/login
   * Authenticates and starts a session.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body || {};
      const user = await authService.authenticateUser({ email, password });

      req.session.userId = user.id;

      return res.status(200).json({ user });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * POST /auth/logout
   * Destroys the session.
   */
  logout(req, res, next) {
    try {
      req.session.destroy((destroyErr) => {
        if (destroyErr) return next(destroyErr);

        // Best-effort cookie clear; name must match session middleware name.
        res.clearCookie('sid');
        return res.status(200).json({ status: 'ok' });
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new AuthController();
