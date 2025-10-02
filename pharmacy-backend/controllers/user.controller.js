// controllers/user.controller.js
const UserService = require("../services/user.service");
const auditService = require("../services/audit.service");

class UserController {
  // ✅ Register a new user
  static async register(req, res) {
    try {
      const { username, email, password, role } = req.body;
      const user = await UserService.register({ username, email, password, role });

      // ✅ Log creation
      await auditService.log(
        "USER_CREATE",
        "User",
        user.id,
        { username: user.username, role: user.role },
        req.user || { id: user.id, username: user.username }
      );

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user
      });
    } catch (err) {
      console.error("Register error:", err.message);
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const { token, user } = await UserService.login({ email, password });

      // ✅ Log login
      await auditService.log(
        "USER_LOGIN",
        "User",
        user.id,
        { 
          ip: req.ip, 
          userAgent: req.get('User-Agent').substring(0, 255) // Truncate long string
        },
        { id: user.id, username: user.username }
      );

      return res.json({
        success: true,
        message: "Login successful",
        token,
        user
      });
    } catch (err) {
      // 🛑 Do NOT log failed logins to avoid spamming DB
      return res.status(401).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Change password (authenticated user)
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      const result = await UserService.changePassword(userId, oldPassword, newPassword);

      if (result.success) {
        // ✅ Use distinct action
        await auditService.log(
          "USER_CHANGE_OWN_PASSWORD",
          "User",
          userId,
          { message: "User changed their own password" },
          req.user
        );
      }

      return res.json(result);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Update user status: active/suspended (admin only)
  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be 'active' or 'suspended'"
        });
      }

      const user = await UserService.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      const result = await UserService.updateUserStatus(id, status);

      if (result.success) {
        await auditService.log(
          "USER_STATUS_CHANGE",
          "User",
          id,
          { oldStatus: user.status, newStatus: status },
          req.user
        );
      }

      return res.json(result);
    } catch (err) {
      const statusCode = err.message.includes("not found") ? 404 : 400;
      return res.status(statusCode).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Get all users (admin only)
  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();

      // ✅ Only attempt log if req.user exists
      if (req.user) {
        await auditService.log(
          "USER_ACCESS_USER_LIST", // ← Must be in model validation list!
          "User",
          null,
          { count: users.length },
          {
            id: req.user.id,
            username: req.user.username || req.user.email?.split("@")[0] || `User${req.user.id}`
          }
        );
      }

      return res.json({
        success: true,
        count: users.length,
        users
      });
    } catch (err) {
      console.error("Error in UserController.getAllUsers:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch users"
      });
    }
  }

  // ✅ Delete a user (admin only)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const userToDelete = await UserService.findById(id);
      if (!userToDelete) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      const result = await UserService.deleteUser(id);

      if (result.success) {
        await auditService.log(
          "USER_DELETE",
          "User",
          id,
          { username: userToDelete.username, role: userToDelete.role },
          req.user
        );
      }

      return res.json(result);
    } catch (err) {
      return res.status(404).json({
        success: false,
        error: err.message
      });
    }
  }

  // ✅ Reset User Password (Admin Only)
  static async resetUserPassword(req, res) {
    try {
      const adminId = req.user.id;
      const { userId, newPassword } = req.body;

      if (!userId || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "User ID and new password are required"
        });
      }

      const targetUser = await UserService.findById(userId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Target user not found"
        });
      }

      const result = await UserService.resetUserPassword(adminId, userId, newPassword);

      if (result.success) {
        await auditService.log(
          "USER_PASSWORD_RESET", // Admin-initiated reset
          "User",
          userId,
          { initiatedBy: req.user.username, targetUsername: targetUser.username },
          req.user
        );
      }

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error("Reset password error:", error.message);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = UserController;