const authService = require('../services/auth');

class UserController {
  /**
   * PUBLIC_INTERFACE
   * GET /me
   * Returns the currently authenticated user.
   */
  async me(req, res, next) {
    try {
      const userId = req.session.userId;
      const user = await authService.getUserById(userId);
      if (!user) {
        // Session exists but user removed
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
   * Returns personalized homepage data for authenticated user.
   */
  async home(req, res, next) {
    try {
      const userId = req.session.userId;
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
            { label: 'Logout', href: '/auth/logout' },
          ],
        },
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new UserController();
