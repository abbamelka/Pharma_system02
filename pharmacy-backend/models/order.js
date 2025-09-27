// models/order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "cancelled"),
    defaultValue: "pending"
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cashierId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Users",
      key: "id"
    },
    allowNull: false,
    comment: 'Staff who processed the order'
  },
  // 👤 Walk-in customer info (anonymous)
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Name of walk-in customer (not a User)'
  },
  customerPhone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    comment: 'Phone number of walk-in customer'
  },
  prescriptionId: {
    type: DataTypes.INTEGER,
    references: {
      model: "prescriptions", // ✅ lowercase — matches actual table name
      key: "id"
    },
    allowNull: true
  }
}, {
  tableName: 'Orders',
  timestamps: true,
  underscored: true,
  comment: 'Sales orders; supports walk-in customers without accounts'
});

module.exports = Order;