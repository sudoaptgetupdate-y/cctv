const prisma = require('../config/prisma');

const settingsController = {
  /**
   * ดึงการตั้งค่าทั้งหมด
   */
  async getSettings(req, res, next) {
    try {
      const settings = await prisma.systemSetting.findMany();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * อัปเดตการตั้งค่า (รองรับการส่งมาหลายค่าพร้อมกัน)
   */
  async updateSettings(req, res, next) {
    try {
      const settingsData = req.body;
      const results = [];

      // ใช้ Transaction เพื่อความมั่นใจว่าข้อมูลจะถูกบันทึกทั้งหมด
      await prisma.$transaction(
        Object.entries(settingsData).map(([key, value]) => {
          return prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
          });
        })
      );

      res.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = settingsController;
