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

  // ดึงข้อมูลกล้องสาธารณะ
  async getAllPublic() {
    return await prisma.camera.findMany({
      where: { 
        status: 'ACTIVE',
        isPublic: true
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        thumbnailUrl: true,
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

  // 🚀 ตรวจสอบข้อมูลซ้ำ (สำหรับ Frontend เรียกเช็ค)
  async validateCameraData(data, excludeId = null) {
    const { name, rtspUrl } = data;
    const warnings = [];
    const errors = [];

    // 1. ตรวจสอบชื่อกล้อง (Strict Unique)
    const existingName = await prisma.camera.findFirst({
      where: { 
        name,
        id: excludeId ? { not: parseInt(excludeId) } : undefined
      }
    });
    if (existingName) {
      errors.push(`ชื่อกล้อง "${name}" ถูกใช้งานแล้วในระบบ`);
    }

    // 2. ตรวจสอบ RTSP URL (Warning only)
    if (rtspUrl) {
      const existingUrl = await prisma.camera.findFirst({
        where: { 
          rtspUrl,
          id: excludeId ? { not: parseInt(excludeId) } : undefined
        }
      });
      if (existingUrl) {
        warnings.push(`URL นี้กำลังถูกใช้งานโดยกล้อง "${existingUrl.name}" คุณแน่ใจว่าต้องการใช้ซ้ำ?`);
      }
    }

    return { 
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // เพิ่มกล้องใหม่
  async createCamera(data, userId) {
    let { groupIds, ...cameraData } = data;
    
    // ตรวจสอบชื่อซ้ำก่อนสร้าง
    const validation = await this.validateCameraData(cameraData);
    if (!validation.isValid) {
      throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
    }

    // 🚀 เพิ่มกลุ่ม "All Camera" เข้าไปโดยอัตโนมัติ
    const allGroup = await prisma.cameraGroup.findFirst({ where: { name: 'All Camera' } });
    if (allGroup) {
      if (!groupIds) groupIds = [];
      if (!groupIds.includes(allGroup.id) && !groupIds.includes(allGroup.id.toString())) {
        groupIds.push(allGroup.id);
      }
    }

    return await prisma.camera.create({
      data: {
        ...cameraData,
        userId: userId,
        groups: (groupIds && Array.isArray(groupIds) && groupIds.length > 0) ? {
          connect: groupIds.map(id => ({ id: parseInt(id) }))
        } : undefined
      }
    });
  },

  // แก้ไขข้อมูลกล้อง
  async updateCamera(id, data) {
    const { groupIds, ...cameraData } = data;
    
    // ตรวจสอบชื่อซ้ำ (ยกเว้นตัวเอง)
    const validation = await this.validateCameraData(cameraData, id);
    if (!validation.isValid) {
      throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
    }

    // แปลงค่าพิกัด
    if (cameraData.latitude) cameraData.latitude = parseFloat(cameraData.latitude);
    if (cameraData.longitude) cameraData.longitude = parseFloat(cameraData.longitude);

    return await prisma.camera.update({
      where: { id: parseInt(id) },
      data: {
        ...cameraData,
        groups: groupIds !== undefined ? {
          set: Array.isArray(groupIds) ? groupIds.map(gid => ({ id: parseInt(gid) })) : []
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

  // ดึงประวัติเหตุการณ์
  async getCameraEvents(id, limit = 50) {
    return await prisma.cameraEventLog.findMany({
      where: { cameraId: parseInt(id) },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
};

module.exports = cameraService;
