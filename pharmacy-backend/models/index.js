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
const Role = require("./role");
const Menu = require("./menu");
const RoleMenus = require("./roleMenu");
const UserRoles = require("./UserRole");

// ========== Associations ==========

// 🔹 User ↔ Role Many-to-Many Association
User.belongsToMany(Role, { 
  through: UserRoles, 
  foreignKey: 'userId',
  otherKey: 'roleId',
  as: 'Roles'  // This creates user.Roles
});

Role.belongsToMany(User, { 
  through: UserRoles, 
  foreignKey: 'roleId',
  otherKey: 'userId'
  // No alias to avoid conflicts
});

// 🔹 Role ↔ Menu Many-to-Many Association
Role.belongsToMany(Menu, { 
  through: RoleMenus, 
  foreignKey: 'roleId',
  otherKey: 'menuId'
  // No alias to avoid conflicts
});

Menu.belongsToMany(Role, { 
  through: RoleMenus, 
  foreignKey: 'menuId',
  otherKey: 'roleId'
  // No alias to avoid conflicts
});

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
Medicine.belongsToMany(Order, { 
  through: OrderMedicine, 
  foreignKey: "medicineId", 
  otherKey: "orderId" 
});
Order.belongsToMany(Medicine, { 
  through: OrderMedicine, 
  foreignKey: "orderId", 
  otherKey: "medicineId" 
});

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
    await sequelize.sync({ alter: true });
    console.log("✅ All models synchronized successfully.");
  } catch (error) {
    console.error("❌ Error syncing models:", error.message);
  }
};

module.exports = {
  sequelize,
  User,
  Medicine,
  Inventory,
  Prescription,
  Supplier,
  Order,
  OrderMedicine,
  Role,
  Menu,
  RoleMenus,
  UserRoles,
  AuditLog,
};