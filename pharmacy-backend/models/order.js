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
    defaultValue: "pending",
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cashierId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: false,
    field: 'cashier_id' // Explicit mapping
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'customer_name'
  },
  customerPhone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    field: 'customer_phone'
  },
  prescriptionId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'prescriptions',
      key: 'id'
    },
    allowNull: true,
    field: 'prescription_id'
  },
  // ✅ Path to uploaded prescription image
  prescriptionPhoto: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'prescription_photo', // Critical for underscored: true
    comment: 'Path to uploaded prescription image'
  }
}, {
  tableName: 'Orders',
  timestamps: true,
  underscored: true, // JS: camelCase → DB: snake_case
  comment: 'Sales orders; supports walk-in customers without accounts'
});

module.exports = Order;