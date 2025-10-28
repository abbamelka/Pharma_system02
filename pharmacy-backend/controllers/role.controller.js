const Role = require("../models/role");
const User = require("../models/user");
const Menu = require("../models/menu"); // Add this import

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Error fetching roles" });
  }
};

exports.getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, { 
      include: [{
        model: Role,
        as: 'Roles',
        through: { attributes: [] }
      }]
    });
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.Roles);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res.status(500).json({ message: "Error fetching user roles" });
  }
};

// ✅ ADD THIS MISSING FUNCTION
exports.getMenusByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const role = await Role.findByPk(roleId, {
      include: [{
        model: Menu,
        through: { attributes: [] }
      }]
    });

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role.Menus || []);
  } catch (error) {
    console.error("Error fetching role menus:", error);
    res.status(500).json({ message: "Error fetching role menus" });
  }
};

exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);
    if (!user || !role) return res.status(404).json({ message: "User or Role not found" });

    await user.addRole(role);
    res.json({ message: "Role assigned successfully" });
  } catch (error) {
    console.error("Error assigning role:", error);
    res.status(500).json({ message: "Error assigning role" });
  }
};

exports.removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const user = await User.findByPk(userId);
    const role = await Role.findByPk(roleId);
    if (!user || !role) return res.status(404).json({ message: "User or Role not found" });

    await user.removeRole(role);
    res.json({ message: "Role removed successfully" });
  } catch (error) {
    console.error("Error removing role:", error);
    res.status(500).json({ message: "Error removing role" });
  }
};