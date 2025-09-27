// models/prescription.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Prescription = sequelize.define("Prescription", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  doctorId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id'
    },
    allowNull: false
  },
  // 👤 For walk-in patients
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Name of the patient (even if not registered)'
  },
  customerPhone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    comment: 'Phone number for contact'
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Format: medicineId:quantity, e.g., "3:2,7:1"'
  },
  dosage: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'e.g., "1 tablet"'
  },
  frequency: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'e.g., "twice daily"'
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'e.g., "7 days"'
  },
  issuedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("pending", "fulfilled", "cancelled"),
    defaultValue: "pending"
  }
}, {
  tableName: 'prescriptions',
  timestamps: true,
  underscored: true
});

module.exports = Prescription;