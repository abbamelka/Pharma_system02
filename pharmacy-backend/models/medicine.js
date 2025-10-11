// models/medicine.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Medicine = sequelize.define("Medicine", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  barcode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM("prescription", "OTC", "supplement"),
    defaultValue: "OTC",
  },
  manufacturer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  batchNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // ✅ NEW: Flag if prescription is required
  requiresPrescription: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
});

// ❗ Associations moved to index.js

module.exports = Medicine;