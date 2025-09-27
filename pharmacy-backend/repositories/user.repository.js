// repositories/user.repository.js
const { User } = require("../models");

class UserRepository {
  // Create a new user
  async createUser(userData) {
    return await User.create(userData);
  }

  // Find user by ID
  async findById(id) {
    return await User.findByPk(id);
  }

  // Find user by username
  async findByUsername(username) {
    return await User.findOne({ where: { username } });
  }

  // Find user by email
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  // Get all users
  async getAllUsers() {
    return await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'status', 'createdAt']
    });
  }

  // Update user (e.g., password, email, role)
  async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.update(updateData);
    return user;
  }

  // ✅ Suspend or activate user using status field
  async updateUserStatus(id, status) {
    const validStatuses = ['active', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status must be ${validStatuses.join(' or ')}`);
    }

    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update({ status });
    return user;
  }

  // Delete user
  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.destroy();
    return true;
  }
}

module.exports = new UserRepository();