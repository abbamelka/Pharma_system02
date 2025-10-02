// services/user.service.js
const bcrypt = require("bcrypt");
const { User } = require("../models");
const { generateToken } = require("../utils/jwt");
const UserRepository = require("../repositories/user.repository");

class UserService {
  // ✅ Create a new user (registration)
  static async register({ username, email, password, role }) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Validate role against allowed roles
    const allowedRoles = ['admin', 'pharmacist', 'cashier', 'doctor'];
    if (!allowedRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${allowedRoles.join(', ')}`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      status: "active" // Default status
    });

    return user;
  }

  // ✅ Login and return JWT
  static async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    if (user.status === "suspended") {
      throw new Error("User account is suspended");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("Invalid email or password");

    const token = generateToken({ id: user.id, role: user.role });

    // Return safe user object (exclude password)
    const { password: _, ...safeUser } = user.toJSON();
    return { token, user: safeUser };
  }

  // ✅ Change password
  static async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Old password is incorrect");

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: "Password updated successfully" };
  }

  // ✅ Update user status: active/suspended (admin only)
  static async updateUserStatus(userId, newStatus) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    if (!['active', 'suspended'].includes(newStatus)) {
      throw new Error("Status must be 'active' or 'suspended'");
    }

    user.status = newStatus;
    await user.save();

    return {
      success: true,
      message: `User ${user.username} is now ${newStatus}`,
      user: {
        id: user.id,
        username: user.username,
        status: user.status,
        role: user.role
      }
    };
  }

  // ✅ Delete user (admin only)
  static async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    // Prevent self-deletion? Optional security
    // if (user.id === currentUserId) throw new Error("You cannot delete your own account");

    await user.destroy();

    return {
      success: true,
      message: `User ${user.username} deleted successfully`
    };
  }

  // ✅ Get all users (admin only)
  static async getAllUsers() {
    try {
      const users = await UserRepository.getAllUsers();
      return {
        success: true,
        count: users.length,
        users
      };
    } catch (error) {
      console.error("Error in UserService.getAllUsers:", error);
      throw error;
    }
  }

  // ✅ Admin resets any user's password
  static async resetUserPassword(adminId, targetUserId, newPassword) {
    if (!targetUserId || !newPassword || typeof newPassword !== 'string') {
      throw new Error("User ID and valid password are required");
    }

    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      throw new Error("User not found");
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await UserRepository.updateUser(targetUserId, { password: hashedPassword });

    return { 
      success: true, 
      message: `Password reset successfully for user ID: ${targetUserId}` 
    };
  }

}

module.exports = UserService;