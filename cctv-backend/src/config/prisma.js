const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

// 🚀 แสดง Log Query และเวลาที่ใช้ประมวลผล
prisma.$on('query', (e) => {
  console.log('---');
  console.log(`🔍 Query: ${e.query}`);
  console.log(`⏱️ Duration: ${e.duration}ms`);
});

module.exports = prisma;
