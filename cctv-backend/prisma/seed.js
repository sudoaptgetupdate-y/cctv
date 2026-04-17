const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seeding Process ---');

  // 1. ล้างข้อมูลเก่าทั้งหมด
  console.log('Cleaning old data...');
  try {
    await prisma.viewingSession.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.maintenanceRecord.deleteMany();
    await prisma.cameraEventLog.deleteMany();
    
    // ลบความสัมพันธ์ M-M
    await prisma.$executeRaw`DELETE FROM _CameraToCameraGroup`;
    
    await prisma.camera.deleteMany();
    await prisma.cameraGroup.deleteMany();
    await prisma.user.deleteMany();
    await prisma.systemSetting.deleteMany();
  } catch (e) {
    console.log('Note: Some tables might not exist yet, skipping cleanup.');
  }

  // 2. สร้าง User ใหม่ (ntadmin / admin1234)
  console.log('Creating Super Admin user...');
  const hashedPassword = await bcrypt.hash('nt@nks!234', 10);

  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Arichai',
      lastName: 'SuperAdmin',
      email: 'admin@ntnakhon.com',
      username: 'ntadmin', // 🚀 เปลี่ยนเป็น ntadmin
      password: hashedPassword,
      role: 'SUPER_ADMIN', // 🚀 สิทธิ์สูงสุด
      isActive: true,
    },
  });

  // 3. สร้างกลุ่มกล้อง
  const allCamerasGroup = await prisma.cameraGroup.create({
    data: {
      name: 'All Cameras',
      description: 'รวมกล้องทุกตัวในระบบ (Default Group)',
      isNotifyEnabled: false, // กลุ่มรวมไม่ต้องแจ้งเตือนซ้ำซ้อน
    },
  });

  const mainGroup = await prisma.cameraGroup.create({
    data: {
      name: 'Main Monitoring Zone',
      description: 'ศูนย์ควบคุมหลัก',
      isNotifyEnabled: true,
    },
  });

  // 4. สร้างกล้องตัวอย่าง
  console.log('Creating sample cameras...');
  
  await prisma.camera.create({
    data: {
      name: 'EngineerOffice',
      latitude: 8.3993959,
      longitude: 99.969966,
      rtspUrl: 'rtsp://admin:password@125.24.156.76:1554/cam/realmonitor?channel=1&subtype=0',
      subStream: 'rtsp://admin:password@125.24.156.76:1554/cam/realmonitor?channel=1&subtype=1',
      status: 'ACTIVE',
      isPublic: true,
      userId: adminUser.id,
      groups: { 
        connect: [
          { id: allCamerasGroup.id }
        ]
      }
    },
  });

  // 5. ตั้งค่าระบบ
  console.log('Creating system settings...');
  await prisma.systemSetting.createMany({
    data: [
      { key: 'systemName', value: 'CCTV Monitoring System', description: 'ชื่อระบบ' },
      { key: 'healthCheckInterval', value: '60', description: 'ความถี่ในการเช็คสถานะกล้อง (วินาที)' },
    ],
  });

  console.log('--- Seeding Completed Successfully ---');
  console.log('Username: ntadmin / Password: admin1234 (Role: SUPER_ADMIN)');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
