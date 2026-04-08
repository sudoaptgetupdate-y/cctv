const prisma = require('../config/prisma');

const cameraService = {
  // ดึงข้อมูลกล้องทั้งหมด พร้อมข้อมูลกลุ่ม
  async getAllCameras() {
    return await prisma.camera.findMany({
      include: {
        groups: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // ดึงข้อมูลกล้องตาม ID
  async getCameraById(id) {
    return await prisma.camera.findUnique({
      where: { id: parseInt(id) },
      include: {
        groups: true,
        eventLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  },

  // เพิ่มกล้องใหม่
  async createCamera(data, userId) {
    const { groupId, ...cameraData } = data;
    
    return await prisma.camera.create({
      data: {
        ...cameraData,
        userId: userId,
        groups: groupId ? {
          connect: { id: parseInt(groupId) }
        } : undefined
      }
    });
  },

  // แก้ไขข้อมูลกล้อง
  async updateCamera(id, data) {
    const { groupId, ...cameraData } = data;
    
    return await prisma.camera.update({
      where: { id: parseInt(id) },
      data: {
        ...cameraData,
        groups: groupId ? {
          set: [{ id: parseInt(groupId) }] // อัปเดตกลุ่มใหม่ (ลบอันเก่าออกถ้ามี)
        } : undefined
      }
    });
  },

  // ลบกล้อง
  async deleteCamera(id) {
    return await prisma.camera.delete({
      where: { id: parseInt(id) }
    });
  }
};

module.exports = cameraService;
