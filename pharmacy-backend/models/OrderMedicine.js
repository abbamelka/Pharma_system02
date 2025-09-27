// models/orderMedicine.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OrderMedicine = sequelize.define("OrderMedicine", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    references: { model: "Orders", key: "id" },
    allowNull: false,
    onDelete: "CASCADE",
  },
  medicineId: {
    type: DataTypes.INTEGER,
    references: { model: "Medicines", key: "id" },
    allowNull: false,
    onDelete: "CASCADE",
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: "Captured at time of sale for accurate reporting",
  },
}, {
  timestamps: false,
  tableName: "OrderMedicines",
});

// ❗ Associations moved to index.js

module.exports = OrderMedicine;