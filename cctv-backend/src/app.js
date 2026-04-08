const express = require('express');
const cors = require('cors');
const path = require('path');
const errorMiddleware = require('./middlewares/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const groupRoutes = require('./routes/groupRoutes');
const streamRoutes = require('./routes/streamRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const logRoutes = require('./routes/logRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: "CCTV Monitoring API is running..." });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cameras', cameraRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/logs', logRoutes);

// Error Handling
app.use(errorMiddleware);

module.exports = app;
