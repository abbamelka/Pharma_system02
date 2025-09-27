const sequelize = require("../config/db");

// Import models
const User = require("./user");
const Medicine = require("./medicine");
const Inventory = require("./inventory");
const Prescription = require("./prescription");
const Supplier = require("./supplier");
const Order = require("./order");
const OrderMedicine = require("./OrderMedicine");

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

module.exports = {
  sequelize,
  User,
  Medicine,
  Inventory,
  Prescription,
  Supplier,
  Order,
  OrderMedicine,
};
