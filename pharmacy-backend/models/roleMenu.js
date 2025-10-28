// models/roleMenu.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RoleMenus = sequelize.define("RoleMenus", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Roles',
      key: 'id'
    }
  },
  menuId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Menus',
      key: 'id'
    }
  }
});

module.exports = RoleMenus;