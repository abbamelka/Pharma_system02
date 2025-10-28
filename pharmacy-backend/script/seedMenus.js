require("dotenv").config();
const { sequelize } = require("../models");
const Menu = require("../models/menu");

const seedMenus = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to DB");

    const menus = [
      // === Dashboard ===
      { title: "Dashboard", text: "Dashboard", icon: "DashboardIcon", path: "/dashboard" },

      // === Billing & Orders ===
      { title: "Billing & Orders", text: "Create Order", icon: "ReceiptIcon", path: "/orders/create" },
      { title: "Billing & Orders", text: "Order Management", icon: "ListAltIcon", path: "/orders/manage" },

      // === Medicines & Inventory ===
      { title: "Medicines & Inventory", text: "Medicine Management", icon: "MedicineIcon", path: "/medicines/manage" },
      { title: "Medicines & Inventory", text: "Inventory Management", icon: "InventoryIcon", path: "/inventory/manage" },
      { title: "Medicines & Inventory", text: "Inventory Alerts", icon: "WarningIcon", path: "/inventory/alerts" },
      { title: "Medicines & Inventory", text: "Supplier Management", icon: "BusinessIcon", path: "/suppliers" },

      // === Prescriptions ===
      { title: "Prescriptions", text: "Prescriptions", icon: "DescriptionIcon", path: "/prescriptions" },
      { title: "Prescriptions", text: "Prescription Management", icon: "DescriptionIcon", path: "/prescriptions/manage" },

      // === Administration ===
      { title: "Administration", text: "User Management", icon: "PeopleIcon", path: "/users" },
      { title: "Administration", text: "Audit Logs", icon: "HistoryIcon", path: "/audit-logs" },
    ];

    for (const menu of menus) {
      await Menu.findOrCreate({ where: { path: menu.path }, defaults: menu });
    }

    console.log("✅ Default menus seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding menus:", error);
    process.exit(1);
  }
};

seedMenus();
