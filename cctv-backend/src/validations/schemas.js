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

module.exports = {
  createUserSchema,
  updateUserSchema
};
