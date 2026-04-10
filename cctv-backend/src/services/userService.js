const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const canManageRole = (callerRole, targetRole) => {
  if (callerRole === 'SUPER_ADMIN') return true; 
  if (callerRole === 'ADMIN' && targetRole === 'EMPLOYEE') return true; 
  return false;
};

const userService = {
  async createUser(callerRole, userData) {
    const { firstName, lastName, email, role, password } = userData;

    if (!canManageRole(callerRole, role)) {
      throw new Error("FORBIDDEN: You don't have permission to create a user with this role.");
    }

    if (!validatePassword(password)) {
      throw new Error("BAD_REQUEST: Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.");
    }

    let generatedUsername = email.split('@')[0];
    const existingUser = await prisma.user.findUnique({ where: { username: generatedUsername } });
    if (existingUser) {
      generatedUsername = `${generatedUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const newUser = await prisma.user.create({
        data: { 
          firstName, 
          lastName, 
          email, 
          username: generatedUsername, 
          password: hashedPassword, 
          role 
        }
      });
      const { password: _, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      if (error.code === 'P2002' && error.meta.target.includes('email')) {
        throw new Error("BAD_REQUEST: This email is already registered.");
      }
      throw error;
    }
  },

  async getUsers(callerRole) {
    const roleFilter = callerRole === 'ADMIN' ? { role: 'EMPLOYEE' } : {};
    return await prisma.user.findMany({
      where: roleFilter,
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        username: true, 
        role: true, 
        isActive: true, 
        createdAt: true 
      }
    });
  },

  async getUserById(id, callerId, callerRole) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { 
        id: true, 
        username: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        role: true, 
        isActive: true 
      }
    });

    if (!user) throw new Error("NOT_FOUND");
    
    // Allow self-view or higher role management
    if (callerId !== user.id && !canManageRole(callerRole, user.role)) {
      throw new Error("FORBIDDEN: Access denied. You don't have permission to view this profile.");
    }
    return user;
  },

  async updateUser(id, callerId, callerRole, updateDataInput) {
    const { firstName, lastName, currentPassword, password, role, isActive } = updateDataInput;

    const targetUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!targetUser) throw new Error("NOT_FOUND");

    const isUpdatingSelf = callerId === targetUser.id;

    if (!isUpdatingSelf && !canManageRole(callerRole, targetUser.role)) {
      throw new Error("FORBIDDEN: Access denied. You don't have permission to update this user.");
    }

    let updateData = { firstName, lastName };

    if (password) {
      if (!validatePassword(password)) {
        throw new Error("BAD_REQUEST: Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.");
      }
      
      if (isUpdatingSelf && currentPassword) {
        const isMatch = await bcrypt.compare(currentPassword, targetUser.password);
        if (!isMatch) throw new Error("BAD_REQUEST: Incorrect current password");
      }
      
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (role !== undefined || isActive !== undefined) {
      if (isUpdatingSelf && role && role !== targetUser.role) {
        throw new Error("FORBIDDEN: You cannot change your own role.");
      }
      if (role && role !== targetUser.role) {
        if (!canManageRole(callerRole, role)) {
          throw new Error("FORBIDDEN: You don't have permission to assign this role.");
        }
        updateData.role = role;
      }
      if (isActive !== undefined) {
        if (isUpdatingSelf && isActive === false) {
          throw new Error("FORBIDDEN: You cannot deactivate your own account.");
        }
        updateData.isActive = isActive;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: { 
        id: true, 
        username: true, 
        firstName: true, 
        lastName: true, 
        email: true, 
        role: true, 
        isActive: true 
      }
    });
    return updatedUser;
  },

  async deleteUser(id, callerRole) {
    const userId = parseInt(id);
    const targetUser = await prisma.user.findUnique({ 
      where: { id: userId },
      include: {
        _count: {
          select: {
            managedCameras: true,
            maintenanceTasks: true,
            logs: true
          }
        }
      }
    });

    if (!targetUser) throw new Error("NOT_FOUND");
    if (!canManageRole(callerRole, targetUser.role)) {
      throw new Error("FORBIDDEN: You don't have permission to delete this user.");
    }

    const hasRelatedData = targetUser._count.managedCameras > 0 || 
                           targetUser._count.maintenanceTasks > 0 || 
                           targetUser._count.logs > 0;

    if (hasRelatedData) {
      // Since we don't have isArchived in schema yet, we deactivate instead
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });
      return { message: "User has related data. Deactivated instead of deleted.", type: "DEACTIVATE" };
    } else {
      await prisma.user.delete({ where: { id: userId } });
      return { message: "User deleted successfully.", type: "DELETE" };
    }
  }
};

module.exports = userService;
