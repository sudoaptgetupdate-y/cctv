const authService = require('../services/authService');

const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      // ดึงข้อมูล User จาก req.user (ที่ได้จาก authMiddleware)
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
