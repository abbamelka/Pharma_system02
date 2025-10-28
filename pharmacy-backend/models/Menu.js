// models/menu.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Menu = sequelize.define("Menu", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  text: { type: DataTypes.STRING, allowNull: false },
  icon: { type: DataTypes.STRING, allowNull: true }, // store icon name or type
  path: { type: DataTypes.STRING, allowNull: false },
  badge: { type: DataTypes.INTEGER, defaultValue: 0 },
});

module.exports = Menu;