const streamService = require('../services/streamService');

const streamController = {
  async getStreamInfo(req, res, next) {
    try {
      const info = await streamService.getStreamConfig(req.params.cameraId);
      res.json({
        success: true,
        data: info
      });
    } catch (error) {
      next(error);
    }
  },

  async getStatuses(req, res, next) {
    try {
      const statuses = await streamService.getAllStreamStatuses();
      res.json({
        success: true,
        data: statuses
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = streamController;
