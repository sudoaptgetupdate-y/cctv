const cameraService = require('../services/cameraService');

const cameraController = {
  async getAll(req, res, next) {
    try {
      const cameras = await cameraService.getAllCameras();
      res.json({ success: true, data: cameras });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const camera = await cameraService.getCameraById(req.params.id);
      if (!camera) return res.status(404).json({ success: false, message: 'Camera not found' });
      res.json({ success: true, data: camera });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      // req.user.id มาจาก verifyToken middleware
      const camera = await cameraService.createCamera(req.body, req.user.id);
      res.status(211).json({ success: true, message: 'Camera created successfully', data: camera });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const camera = await cameraService.updateCamera(req.params.id, req.body);
      res.json({ success: true, message: 'Camera updated successfully', data: camera });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await cameraService.deleteCamera(req.params.id);
      res.json({ success: true, message: 'Camera deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = cameraController;
