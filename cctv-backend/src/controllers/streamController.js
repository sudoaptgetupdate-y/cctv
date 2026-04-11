const streamService = require('../services/streamService');

const streamController = {
  async getStreamInfo(req, res, next) {
    try {
      const { type } = req.query; // MAIN or SUB
      const info = await streamService.getStreamConfig(req.params.cameraId, type);
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
