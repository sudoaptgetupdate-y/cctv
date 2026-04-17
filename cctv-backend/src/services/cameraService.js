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

  // 🚀 ตรวจสอบข้อมูลซ้ำ
  async validateCameraData(data, excludeId = null) {
    const { name, rtspUrl } = data;
    const warnings = [];
    const errors = [];

    const existingName = await prisma.camera.findFirst({
      where: { 
        name,
        id: excludeId ? { not: parseInt(excludeId) } : undefined
      }
    });
    if (existingName) {
      errors.push(`ชื่อกล้อง "${name}" ถูกใช้งานแล้วในระบบ`);
    }

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

    return { isValid: errors.length === 0, errors, warnings };
  },

  // เพิ่มกล้องใหม่
  async createCamera(data, userId) {
    let { groupIds, ...cameraData } = data;
    
    const validation = await this.validateCameraData(cameraData);
    if (!validation.isValid) {
      throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
    }

    // 🚀 เพิ่มกลุ่ม "All Cameras" เข้าไปโดยอัตโนมัติ
    const allGroup = await prisma.cameraGroup.findFirst({ 
      where: { OR: [{ name: 'All Camera' }, { name: 'All Cameras' }] } 
    });
    
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

  // 🚀 เพิ่มกล้องจำนวนมาก (Bulk Create) - รองรับชื่อกลุ่มอัตโนมัติ
  async bulkCreateCameras(cameras, userId) {
    // 1. เตรียมกลุ่ม "All Cameras"
    const allGroup = await prisma.cameraGroup.findFirst({ 
      where: { OR: [{ name: 'All Camera' }, { name: 'All Cameras' }] } 
    });
    const allGroupId = allGroup ? allGroup.id : null;

    const results = [];
    
    // ใช้ for loop เพื่อให้จัดการ async/await ภายในแต่ละรายการได้แม่นยำ
    for (const cam of cameras) {
      let { groupIds, targetGroupName, ...cameraData } = cam;
      const finalGroupIds = new Set();

      // ใส่ All Cameras เสมอ
      if (allGroupId) finalGroupIds.add(allGroupId);

      // จัดการกลุ่มที่ระบุมา
      if (targetGroupName && targetGroupName.toLowerCase() !== 'all cameras' && targetGroupName.toLowerCase() !== 'all camera') {
        // ค้นหากลุ่มตามชื่อ
        let group = await prisma.cameraGroup.findFirst({
          where: { name: { equals: targetGroupName.trim() } }
        });

        // ถ้าไม่มีกลุ่มนี้ ให้สร้างใหม่ทันที!
        if (!group) {
          group = await prisma.cameraGroup.create({
            data: { 
              name: targetGroupName.trim(),
              description: `Auto-created during bulk import from camera "${cameraData.name}"`
            }
          });
        }
        finalGroupIds.add(group.id);
      }

      // รวมกลุ่มเดิมที่ส่งมา (ถ้ามี)
      if (groupIds && Array.isArray(groupIds)) {
        groupIds.forEach(id => finalGroupIds.add(parseInt(id)));
      }

      const created = await prisma.camera.create({
        data: {
          ...cameraData,
          userId: userId,
          groups: {
            connect: Array.from(finalGroupIds).map(id => ({ id }))
          }
        }
      });
      results.push(created);
    }

    return results;
  },

  async updateCamera(id, data) {
    const { groupIds, ...cameraData } = data;
    const validation = await this.validateCameraData(cameraData, id);
    if (!validation.isValid) {
      throw new Error(`VALIDATION_ERROR: ${validation.errors.join(', ')}`);
    }

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

  async deleteCamera(id) {
    const cameraId = parseInt(id);
    const camera = await prisma.camera.findUnique({ where: { id: cameraId } });
    if (!camera) return { success: true };

    await prisma.maintenanceRecord.deleteMany({ where: { cameraId } });
    await prisma.cameraEventLog.deleteMany({ where: { cameraId } });

    return await prisma.camera.deleteMany({ where: { id: cameraId } });
  },

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

  async getCameraEvents(id, limit = 50) {
    return await prisma.cameraEventLog.findMany({
      where: { cameraId: parseInt(id) },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
};

module.exports = cameraService;
