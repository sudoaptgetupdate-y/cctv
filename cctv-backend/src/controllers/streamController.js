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
  },

  async getSingleStatus(req, res, next) {
    try {
      const { streamId } = req.params;
      const status = await streamService.getStreamStatus(streamId);
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  },

  async heartbeat(req, res, next) {
    try {
      const { streamId } = req.params;
      const { sessionId } = req.body;
      const userId = req.user ? req.user.id : null;

      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'Session ID is required' });
      }

      await streamService.heartbeat(streamId, sessionId, userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = streamController;
