const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seeding Process ---');

  // 1. ล้างข้อมูลเก่าทั้งหมด (ลำดับการลบสำคัญ)
  console.log('Cleaning old data...');
  try {
    await prisma.viewingSession.deleteMany(); // 🚀 ล้าง Session คนดู
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
    console.log('Note: Some tables might not exist yet, skipping cleanup for those.');
  }

  // 2. สร้าง User ใหม่ (admin1234)
  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('admin1234', 10);

  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Arichai',
      lastName: 'Admin',
      email: 'admin@ntnakhon.com',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // 3. สร้างกลุ่มกล้อง
  const mainGroup = await prisma.cameraGroup.create({
    data: {
      name: 'Main Monitoring Zone',
      description: 'ศูนย์ควบคุมหลัก',
      isNotifyEnabled: true,
    },
  });

  // 4. สร้างกล้องตัวอย่าง
  console.log('Creating sample cameras...');
  
  // กล้องแบบ Pass-through (ปกติ)
  await prisma.camera.create({
    data: {
      name: '🔴 กล้องทดสอบ (Native Stream)',
      latitude: 13.7563,
      longitude: 100.5018,
      rtspUrl: 'rtsp://admin:admin1234@10.0.0.100:554/live',
      status: 'ACTIVE',
      isPublic: true,
      userId: adminUser.id,
      groups: { connect: { id: mainGroup.id } }
    },
  });

  // กล้องแบบเปิด Transcoding (เพื่อทดสอบการ Fix 15fps/Resolution)
  await prisma.camera.create({
    data: {
      name: '⚙️ กล้องทดสอบ (Transcoding 10fps)',
      latitude: 13.7500,
      longitude: 100.5100,
      rtspUrl: 'rtsp://admin:admin1234@192.168.10.219:554/live', 
      status: 'ACTIVE',
      isPublic: true,
      isTranscodeEnabled: true,
      resolution: '1280x720',
      fps: 10,
      userId: adminUser.id,
      groups: { connect: { id: mainGroup.id } }
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
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
