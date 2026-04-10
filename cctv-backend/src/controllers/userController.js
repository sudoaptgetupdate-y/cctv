const userService = require('../services/userService');
const logService = require('../services/logService');

const userController = {
  async createUser(req, res, next) {
    try {
      const newUser = await userService.createUser(req.user.role, req.body);
      
      await logService.createActivityLog({
        userId: req.user.id,
        action: 'CREATE_USER',
        details: `สร้างผู้ใช้งานใหม่: ${newUser.username} (${newUser.role})`,
        ipAddress: req.ip
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  },

  async getUsers(req, res, next) {
    try {
      const users = await userService.getUsers(req.user.role);
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id, req.user.id, req.user.role);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const oldUser = await userService.getUserById(req.params.id, req.user.id, req.user.role);
      const updatedUser = await userService.updateUser(req.params.id, req.user.id, req.user.role, req.body);
      
      let action = 'UPDATE_USER';
      let details = `อัปเดตข้อมูลผู้ใช้งาน: ${updatedUser.username}`;

      if (req.body.hasOwnProperty('isActive') && oldUser.isActive !== req.body.isActive) {
        action = 'TOGGLE_USER_STATUS';
        details = `${req.body.isActive ? 'เปิดการใช้งาน' : 'ปิดการใช้งาน'} ผู้ใช้: ${updatedUser.username}`;
      }

      await logService.createActivityLog({
        userId: req.user.id,
        action,
        details,
        ipAddress: req.ip
      });

      res.json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const userToDelete = await userService.getUserById(req.params.id, 0, req.user.role);
      const result = await userService.deleteUser(req.params.id, req.user.role);
      
      await logService.createActivityLog({
        userId: req.user.id,
        action: 'DELETE_USER',
        details: `${result.message} (${userToDelete.username})`,
        ipAddress: req.ip
      });

      res.json({
        success: true,
        message: result.message,
        type: result.type
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
