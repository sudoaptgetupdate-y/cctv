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

  // ดึงข้อมูลกล้องสาธารณะ (ไม่รวม Username/Password และดึงเฉพาะที่ ACTIVE)
  async getAllPublic() {
    return await prisma.camera.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        rtspUrl: true, // RTSP URL จำเป็นต้องใช้ในการสตรีม
        subStream: true,
        status: true,
        groups: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
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
    console.log(`[CameraService] Updating camera ${id} with:`, cameraData);
    
    // บังคับแปลงค่าพิกัดให้เป็น Float เพื่อความชัวร์ (ถ้ามีส่งมา)
    if (cameraData.latitude) cameraData.latitude = parseFloat(cameraData.latitude);
    if (cameraData.longitude) cameraData.longitude = parseFloat(cameraData.longitude);

    return await prisma.camera.update({
      where: { id: parseInt(id) },
      data: {
        ...cameraData,
        groups: groupId ? {
          set: [{ id: parseInt(groupId) }]
        } : undefined
      }
    });
  },

  // ลบกล้อง
  async deleteCamera(id) {
    return await prisma.camera.delete({
      where: { id: parseInt(id) }
    });
  },

  // รับทราบเหตุการณ์ (Acknowledge)
  async acknowledgeCamera(id, data) {
    return await prisma.camera.update({
      where: { id: parseInt(id) },
      data: {
        isAcknowledged: true,
        acknowledgeReason: data.reason || 'Manually Acknowledged',
        acknowledgedAt: new Date(),
      }
    });
  },

  // ดึงประวัติเหตุการณ์ของกล้อง
  async getCameraEvents(id, limit = 50) {
    return await prisma.cameraEventLog.findMany({
      where: { cameraId: parseInt(id) },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
};

module.exports = cameraService;
