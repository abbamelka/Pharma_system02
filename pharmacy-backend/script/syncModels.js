// scripts/syncModels.js
require("dotenv").config();
const sequelize = require("../config/db"); // your sequelize instance
const User = require("../models/user");
const Role = require("../models/role");
const Menu = require("../models/menu");

// Junction tables for many-to-many
const UserRoles = require("../models/userRole");
const RoleMenus = require("../models/roleMenu");

// Define associations if not already in models
User.belongsToMany(Role, { through: UserRoles });
Role.belongsToMany(User, { through: UserRoles });

Role.belongsToMany(Menu, { through: RoleMenus });
Menu.belongsToMany(Role, { through: RoleMenus });

async function syncAll() {
  try {
    await sequelize.authenticate();
    console.log("⚡ Database connected successfully.");

    // Sync all models (creates tables and relations)
    await sequelize.sync({ alter: true }); // alter:true updates tables if needed
    console.log("✅ All models synced successfully!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to sync models:", err);
    process.exit(1);
  }
}

syncAll();
