// controllers/user.controller.js
const UserService = require("../services/user.service");

class UserController {
  // ✅ Register a new user
  static async register(req, res) {
    try {
      const { username, email, password, role } = req.body;
      const user = await UserService.register({ username, email, password, role });
      res.status(201).json({ 
        success: true, 
        message: "User registered successfully", 
        user 
      });
    } catch (err) {
      res.status(400).json({ 
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
      res.json({ 
        success: true, 
        message: "Login successful", 
        token, 
        user 
      });
    } catch (err) {
      res.status(401).json({ 
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
      res.json(result);
    } catch (err) {
      res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
  }

  // ✅ Update user status: active/suspended (admin only)
  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'active' or 'suspended'

      if (!['active', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be 'active' or 'suspended'"
        });
      }

      const result = await UserService.updateUserStatus(id, status);
      res.json(result);
    } catch (err) {
      const status = err.message.includes("not found") ? 404 : 400;
      res.status(status).json({ 
        success: false, 
        error: err.message 
      });
    }
  }

  // ✅ Get all users (admin only)
 static async getAllUsers(req, res) {
  try {
    const users = await UserService.getAllUsers(); // Should return array

    return res.json({
      success: true,
      count: users.length,
      users  // ← Wrap array
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
      const result = await UserService.deleteUser(id);
      res.json(result);
    } catch (err) {
      res.status(404).json({ 
        success: false, 
        error: err.message 
      });
    }
  }
 static async resetUserPassword(req, res){
  try {
    const adminId = req.user.id; // from auth middleware
    const { userId, newPassword } = req.body;

    // Validate request
    if (!userId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "User ID and new password are required"
      });
    }

    // Perform reset
    const result = await UserService.resetUserPassword(adminId, userId, newPassword);

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
};
  
}

module.exports = UserController;