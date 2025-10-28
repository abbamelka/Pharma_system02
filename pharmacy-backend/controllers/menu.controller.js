const Role = require("../models/role");
const Menu = require("../models/menu");

const getMenusByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await Role.findByPk(roleId, { include: { model: Menu, as: "Menus" } });
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role.Menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const fetchAllMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignMenuToRole = async (req, res) => {
  try {
    const { roleId, menuId } = req.body;
    const role = await Role.findByPk(roleId);
    const menu = await Menu.findByPk(menuId);
    if (!role || !menu) return res.status(404).json({ message: "Role or Menu not found" });

    await role.addMenu(menu);
    res.json({ message: "Menu assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeMenuFromRole = async (req, res) => {
  try {
    const { roleId, menuId } = req.body;
    const role = await Role.findByPk(roleId);
    const menu = await Menu.findByPk(menuId);
    if (!role || !menu) return res.status(404).json({ message: "Role or Menu not found" });

    await role.removeMenu(menu);
    res.json({ message: "Menu removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMenusByRole,
  fetchAllMenus,
  assignMenuToRole,
  removeMenuFromRole,
};
