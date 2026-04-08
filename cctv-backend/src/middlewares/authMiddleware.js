const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma'); 

const JWT_SECRET = process.env.JWT_SECRET;

// 🛡️ ฟังก์ชันตรวจ Token สำหรับ User (แอดมิน/เจ้าหน้าที่)
exports.verifyToken = async (req, res, next) => { 
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ตรวจสอบว่า User ยังมีตัวตนและยัง Active อยู่หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive.' });
    }

    req.user = user; 
    next(); 
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// 🔑 ฟังก์ชันตรวจสิทธิ์ (Role-Based Access Control)
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next(); 
  };
};
