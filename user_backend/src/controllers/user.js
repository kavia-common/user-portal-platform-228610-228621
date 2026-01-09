const authService = require('../services/auth');

class UserController {
  /**
   * PUBLIC_INTERFACE
   * GET /me
   * Returns the currently authenticated user (JWT-based).
   */
  async me(req, res, next) {
    try {
      // Convention: API Gateway should include user identifier as `sub`.
      const userId = req.auth && (req.auth.sub || req.auth.userId);

      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const user = await authService.getUserById(userId);
      if (!user) {
        // Token valid but user not present (deleted/disabled)
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      return res.status(200).json({ user });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * GET /home
   * Returns personalized homepage data for authenticated user (JWT-based).
   */
  async home(req, res, next) {
    try {
      const userId = req.auth && (req.auth.sub || req.auth.userId);

      if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const user = await authService.getUserById(userId);
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      return res.status(200).json({
        user,
        home: {
          title: `Welcome, ${user.displayName}`,
          message: 'This is your personalized home feed.',
          links: [
            { label: 'Profile', href: '/me' },
          ],
        },
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new UserController();
