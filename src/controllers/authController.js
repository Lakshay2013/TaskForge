const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {  // ✅ Add 'next' parameter
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name, email and password',
        });
      }

      const result = await authService.register(name, email, password, role);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);  // ✅ Pass error to Express error handler
    }
  }

  async login(req, res, next) {  // ✅ Add 'next' parameter
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password',
        });
      }

      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);  // ✅ Pass error to Express error handler
    }
  }

  async getProfile(req, res, next) {  // ✅ Add 'next' parameter
    try {
      const user = await authService.getProfile(req.user._id);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);  // ✅ Pass error to Express error handler
    }
  }
}

module.exports = new AuthController();