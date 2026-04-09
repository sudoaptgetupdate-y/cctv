const groupService = require('../services/groupService');

const groupController = {
  async getAll(req, res, next) {
    try {
      const groups = await groupService.getAllGroups();
      res.json({ success: true, data: groups });
    } catch (error) {
      next(error);
    }
  },

  async getAllPublic(req, res, next) {
    try {
      const groups = await groupService.getAllPublic();
      res.json({ success: true, data: groups });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const group = await groupService.getGroupById(req.params.id);
      if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
      res.json({ success: true, data: group });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const group = await groupService.createGroup(req.body);
      res.status(201).json({ success: true, message: 'Group created successfully', data: group });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const group = await groupService.updateGroup(req.params.id, req.body);
      res.json({ success: true, message: 'Group updated successfully', data: group });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await groupService.deleteGroup(req.params.id);
      res.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async updateCameras(req, res, next) {
    try {
      const { cameraIds } = req.body;
      const group = await groupService.updateGroupCameras(req.params.id, cameraIds);
      res.json({ success: true, message: 'Group members updated successfully', data: group });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = groupController;
