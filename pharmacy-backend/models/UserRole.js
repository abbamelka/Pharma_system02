// models/UserRole.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserRoles = sequelize.define("UserRoles", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Roles',
      key: 'id'
    }
  }
});

module.exports = UserRoles;