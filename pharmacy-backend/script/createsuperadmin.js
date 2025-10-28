// scripts/createsuperadmin.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize, User, Role, UserRoles } = require("../models");

async function createSuperAdmin() {
  try {
    console.log("⚙️ Checking for existing superadmin user...");

    await sequelize.authenticate();

    // Check if superadmin already exists
    const existingSuperAdmin = await User.findOne({ 
      where: { username: process.env.SUPERADMIN_USERNAME || "superadmin" } 
    });
    if (existingSuperAdmin) {
      console.log(`✅ Superadmin user already exists: ${existingSuperAdmin.username}`);
      process.exit(0);
    }

    // Load superadmin info from .env
    const username = process.env.SUPERADMIN_USERNAME || "superadmin";
    const email = process.env.SUPERADMIN_EMAIL || "superadmin@pharma.com";
    const roleName = process.env.SUPERADMIN_ROLE || "superadmin"; // Fixed variable name
    const password = process.env.SUPERADMIN_PASSWORD || "Super@123";
    const status = process.env.SUPERADMIN_STATUS || "active";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create superadmin user
    const superAdminUser = await User.create({
      username,
      email,
      password: hashedPassword,
      status,
      // Remove superadminRole field - it doesn't exist in User model
    });

    // Ensure superadmin role exists
    const [superAdminRole] = await Role.findOrCreate({
      where: { name: roleName },
      defaults: { name: roleName },
    });

    // Assign superadmin role using the correct method
    await superAdminUser.addRole(superAdminRole);

    console.log("✅ Superadmin user created successfully!");
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${roleName}`);
    console.log(`   Status: ${status}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating superadmin user:", err);
    process.exit(1);
  }
}

createSuperAdmin();