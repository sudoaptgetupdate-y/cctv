const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Seeding Process ---');

  // 1. ล้างข้อมูลเก่าทั้งหมด (ลำดับการลบสำคัญเพื่อไม่ให้ติด Foreign Key)
  console.log('Cleaning old data...');
  await prisma.activityLog.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.cameraEventLog.deleteMany();
  
  // ลบความสัมพันธ์ระหว่าง Camera และ CameraGroup ก่อน
  await prisma.$executeRaw`DELETE FROM _CameraToCameraGroup`;
  
  await prisma.camera.deleteMany();
  await prisma.cameraGroup.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  // 2. สร้าง User ใหม่ (เข้ารหัสรหัสผ่านด้วย bcryptjs)
  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('admin1234', 10);

  const superAdmin = await prisma.user.create({
    data: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@cctv.com',
      username: 'superadmin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

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

  // 3. สร้างกลุ่มกล้อง (Camera Groups)
  console.log('Creating camera groups...');
  const mainGroup = await prisma.cameraGroup.create({
    data: {
      name: 'Main Monitoring Zone',
      description: 'ศูนย์ควบคุมหลัก',
      isNotifyEnabled: true,
    },
  });

  // 4. สร้างกล้องตัวอย่าง (Sample Camera)
  console.log('Creating sample cameras...');
  await prisma.camera.create({
    data: {
      name: '🔴 ระบบทดสอบสตรีมมิ่ง (Big Buck Bunny)',
      latitude: 13.7563,
      longitude: 100.5018,
      rtspUrl: 'rtsp://admin:admin1234@10.0.0.100:554/live',
      status: 'ACTIVE',
      isPublic: true,
      userId: adminUser.id,
      groups: {
        connect: { id: mainGroup.id }
      }
    },
  });

  // 5. สร้างการตั้งค่าระบบ (System Settings)
  console.log('Creating system settings...');
  await prisma.systemSetting.createMany({
    data: [
      { key: 'systemName', value: 'CCTV Monitoring System', description: 'ชื่อระบบ' },
      { key: 'healthCheckInterval', value: '60', description: 'ความถี่ในการเช็คสถานะกล้อง (วินาที)' },
    ],
  });

  console.log('--- Seeding Completed Successfully ---');
  console.log('User: admin / Password: admin1234');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
