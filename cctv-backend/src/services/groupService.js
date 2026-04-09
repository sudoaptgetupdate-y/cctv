const prisma = require('../config/prisma');

const groupService = {
  // ดึงข้อมูลกลุ่มทั้งหมด พร้อมจำนวนกล้องในแต่ละกลุ่ม
  async getAllGroups() {
    return await prisma.cameraGroup.findMany({
      include: {
        _count: {
          select: { cameras: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  },

  // สำหรับ Public ดึงเฉพาะรายชื่อกลุ่มที่จำกัดข้อมูล
  async getAllPublic() {
    return await prisma.cameraGroup.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: { cameras: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  },

  // ดึงข้อมูลกลุ่มตาม ID พร้อมรายชื่อกล้อง
  async getGroupById(id) {
    return await prisma.cameraGroup.findUnique({
      where: { id: parseInt(id) },
      include: {
        cameras: {
          select: {
            id: true,
            name: true,
            status: true,
            latitude: true,
            longitude: true
          }
        }
      }
    });
  },

  // สร้างกลุ่มใหม่
  async createGroup(data) {
    return await prisma.cameraGroup.create({
      data: data
    });
  },

  // อัปเดตข้อมูลกลุ่ม (รวมถึงการตั้งค่า Telegram/AI)
  async updateGroup(id, data) {
    return await prisma.cameraGroup.update({
      where: { id: parseInt(id) },
      data: data
    });
  },

  // ลบกลุ่ม
  async deleteGroup(id) {
    return await prisma.cameraGroup.delete({
      where: { id: parseInt(id) }
    });
  },

  // จัดการสมาชิกในกลุ่ม (เพิ่ม/ลด กล้องเข้ากลุ่ม)
  async updateGroupCameras(groupId, cameraIds) {
    return await prisma.cameraGroup.update({
      where: { id: parseInt(groupId) },
      data: {
        cameras: {
          set: cameraIds.map(id => ({ id: parseInt(id) }))
        }
      }
    });
  }
};

module.exports = groupService;
