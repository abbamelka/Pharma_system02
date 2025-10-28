// models/user.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "pharmacist", "cashier","doctor","superadmin"),
    defaultValue: "pharmacist",
  },
  status: {
    type: DataTypes.ENUM("active", "suspended"),
    allowNull: false,
    defaultValue: "active",
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});

// ❗ Associations moved to index.js

module.exports = User;