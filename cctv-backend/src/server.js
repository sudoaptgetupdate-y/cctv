require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prisma');
const initCronJobs = require('./cronJobs');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test Database Connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Initialize Background Jobs (Health Check, etc.)
    initCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
