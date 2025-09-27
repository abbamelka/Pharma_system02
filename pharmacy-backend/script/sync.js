const { sequelize } = require("../models");

async function syncDatabase() {
  try {
    console.log("⚙️  Syncing database...");

    // Temporarily disable foreign key checks to avoid errors during drop
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    await sequelize.sync({ force: true }); // drops & recreates tables

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ All tables created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
}

syncDatabase();
