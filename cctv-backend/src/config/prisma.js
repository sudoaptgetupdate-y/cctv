const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error'], // 🛡️ ปิด query, info เพื่อความสะอาดตามคำขอ
});

module.exports = prisma;
