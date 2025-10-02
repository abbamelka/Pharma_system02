// models/index.js
const { Sequelize, DataTypes } = require("sequelize"); 
const sequelize = require("../config/db");

// Import models
const User = require("./user");
const Medicine = require("./medicine");
const Inventory = require("./inventory");
const Prescription = require("./prescription");
const Supplier = require("./supplier");
const Order = require("./order");
const OrderMedicine = require("./OrderMedicine");
const AuditLog = require("./AuditLog.model")(sequelize, DataTypes);
// ========== Associations ==========

// User → Orders
User.hasMany(Order, { as: "processedOrders", foreignKey: "cashierId" });
Order.belongsTo(User, { as: "cashier", foreignKey: "cashierId" });

// Prescription → Doctor (User)
Prescription.belongsTo(User, { as: "doctor", foreignKey: "doctorId" });
User.hasMany(Prescription, { as: "doctorPrescriptions", foreignKey: "doctorId" });

// Medicine ↔ Inventory
Medicine.hasMany(Inventory, { foreignKey: "medicineId", as: "Inventory" });
Inventory.belongsTo(Medicine, { foreignKey: "medicineId" });

// Inventory → Supplier
Inventory.belongsTo(Supplier, { foreignKey: "supplierId" });

// Medicine ↔ Order via OrderMedicine
Medicine.belongsToMany(Order, { through: OrderMedicine, foreignKey: "medicineId", otherKey: "orderId" });
Order.belongsToMany(Medicine, { through: OrderMedicine, foreignKey: "orderId", otherKey: "medicineId" });

// OrderMedicine associations
OrderMedicine.belongsTo(Order, { foreignKey: "orderId" });
OrderMedicine.belongsTo(Medicine, { foreignKey: "medicineId" });
Order.hasMany(OrderMedicine, { foreignKey: "orderId" });
Medicine.hasMany(OrderMedicine, { foreignKey: "medicineId" });

// Order → Prescription
Order.belongsTo(Prescription, { foreignKey: "prescriptionId" });

// ✅ AuditLog → User
AuditLog.belongsTo(User, { foreignKey: 'performedById', as: 'Performer' });
// ========== Sync All Models ==========
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: true }); // Use { force: true } only in dev if needed
    console.log("✅ All models synchronized successfully.");
  } catch (error) {
    console.error("❌ Error syncing models:", error.message);
  }
};

// Optional: Call sync only once when server starts
// syncModels();

module.exports = {
  sequelize,
  User,
  Medicine,
  Inventory,
  Prescription,
  Supplier,
  Order,
  OrderMedicine,
  AuditLog, // ✅ Export AuditLog
};