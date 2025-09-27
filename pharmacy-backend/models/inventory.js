// models/inventory.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Inventory = sequelize.define("Inventory", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
   medicineId: { // ✅ Add medicineId
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Medicines",
      key: "id",
    },
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  supplierId: {
    type: DataTypes.INTEGER,
    references: {
      model: "Suppliers",
      key: "id",
    },
  },
});

// ❗ Associations moved to index.js

module.exports = Inventory;