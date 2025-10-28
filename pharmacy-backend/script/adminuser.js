// scripts/adminuser.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const { sequelize } = require("../models");
const User = require("../models/user");

async function createAdminUser() {
  try {
    console.log("⚙️ Checking for existing admin user...");

    await sequelize.authenticate();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: "admin" } });
    if (existingAdmin) {
      console.log(`✅ Admin user already exists: ${existingAdmin.username}`);
      process.exit(0);
    }

    // Load admin info from .env
    const username = process.env.ADMIN_USERNAME || "admin";
    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const role = process.env.ADMIN_ROLE || "admin";
    const status = process.env.ADMIN_STATUS || "active";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const adminUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      status,
    });

    console.log(" Admin user created successfully!");
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);
    console.log(`   Status: ${status}`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin user:", err);
    process.exit(1);
  }
}

createAdminUser();
