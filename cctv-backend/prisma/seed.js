const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Starting seed process...');
  
  try {
    // 1. ตรวจสอบการเชื่อมต่อฐานข้อมูล
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected!');

    // 2. สร้าง Admin User
    console.log('👤 Creating Admin user...');
    const adminPassword = await bcrypt.hash('admin1234', 10);
    
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
        email: 'admin@cctv.local',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✅ Seeded Admin User:', admin.username);
    
    // 3. สร้างตัวอย่างกลุ่มกล้อง
    console.log('📁 Creating Sample Group...');
    const group = await prisma.cameraGroup.upsert({
      where: { name: 'หมู่ 1 - โซนตลาด' },
      update: {},
      create: {
        name: 'หมู่ 1 - โซนตลาด',
        description: 'กล้องบริเวณตลาดสดและจุดคัดกรองหมู่ 1',
      },
    });
    console.log('✅ Seeded Sample Group:', group.name);
    
    console.log('\n✨ Seed process completed successfully!');

  } catch (error) {
    console.error('\n❌ SEED ERROR:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
