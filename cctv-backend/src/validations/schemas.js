const { z } = require('zod');

// กฎสำหรับรหัสผ่าน (ต้องมีพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข อักขระพิเศษ อย่างน้อย 8 ตัว)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ==========================================
// 1. User Schemas
// ==========================================
const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "กรุณากรอกชื่อจริง"),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
    email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'GUEST']),
    password: z.string().regex(passwordRegex, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ")
  })
});

const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "กรุณากรอกชื่อจริง").optional(),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล").optional(),
    currentPassword: z.string().optional(),
    password: z.string().regex(passwordRegex, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ").optional(),
    role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EMPLOYEE', 'GUEST']).optional(),
    isActive: z.boolean().optional()
  })
});

// ==========================================
// 2. Camera Schemas
// ==========================================
const cameraSchema = z.object({
  body: z.object({
    name: z.string().min(1, "กรุณากรอกชื่อกล้อง"),
    ipAddress: z.string().optional().nullable(),
    rtspUrl: z.string().min(1, "กรุณากรอก RTSP URL"),
    latitude: z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)]).optional().nullable(),
    longitude: z.union([z.number(), z.string().regex(/^-?\d+(\.\d+)?$/)]).optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
    isPublic: z.boolean().optional(),
    groupId: z.union([z.number(), z.string()]).optional().nullable(),
    streamSettings: z.any().optional()
  })
});

// ==========================================
// 3. Group Schemas
// ==========================================
const groupSchema = z.object({
  body: z.object({
    name: z.string().min(1, "กรุณากรอกชื่อกลุ่ม"),
    description: z.string().optional().nullable(),
    telegramToken: z.string().optional().nullable(),
    telegramChatId: z.string().optional().nullable(),
    isNotifyEnabled: z.boolean().optional(),
    aiAnalysisEnabled: z.boolean().optional()
  })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  cameraSchema,
  groupSchema
};
