require("dotenv").config();
const { sequelize, Role, Menu } = require("../models"); // ✅ important

const seedRolesAndAssignMenus = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // ensure tables exist
    console.log("✅ Connected to database");

    // === Step 1: Create roles ===
    const rolesData = [
      { name: "superadmin" },
      { name: "admin" },
      { name: "pharmacist" },
      { name: "cashier" },
      { name: "doctor" },
    ];

    const roles = {};
    for (const data of rolesData) {
      const [role] = await Role.findOrCreate({ where: { name: data.name } });
      roles[data.name] = role;
    }
    console.log("✅ Roles created or found");

    // === Step 2: Create menus ===
    const menusData = [
      { title: "Dashboard", text: "Dashboard", icon: "DashboardIcon", path: "/dashboard" },

      { title: "Billing & Orders", text: "Create Order", icon: "ReceiptIcon", path: "/orders/create" },
      { title: "Billing & Orders", text: "Order Management", icon: "ListAltIcon", path: "/orders/manage" },

      { title: "Medicines & Inventory", text: "Medicine Management", icon: "MedicineIcon", path: "/medicines/manage" },
      { title: "Medicines & Inventory", text: "Inventory Management", icon: "InventoryIcon", path: "/inventory/manage" },
      { title: "Medicines & Inventory", text: "Inventory Alerts", icon: "WarningIcon", path: "/inventory/alerts" },
      { title: "Medicines & Inventory", text: "Supplier Management", icon: "BusinessIcon", path: "/suppliers" },

      { title: "Prescriptions", text: "Prescriptions", icon: "DescriptionIcon", path: "/prescriptions" },
      { title: "Prescriptions", text: "Prescription Management", icon: "DescriptionIcon", path: "/prescriptions/manage" },

      { title: "Administration", text: "User Management", icon: "PeopleIcon", path: "/users" },
      { title: "Administration", text: "Audit Logs", icon: "HistoryIcon", path: "/audit-logs" },
    ];

    const menus = {};
    for (const data of menusData) {
      const [menu] = await Menu.findOrCreate({ where: { path: data.path }, defaults: data });
      menus[data.text] = menu;
    }
    console.log("✅ Menus created or found");

    // === Step 3: Assign menus to roles ===
    // Admin
    await roles.admin.setMenus([
      menus["Dashboard"],
      menus["Create Order"],
      menus["Order Management"],
      menus["Medicine Management"],
      menus["Inventory Management"],
      menus["Inventory Alerts"],
      menus["Supplier Management"],
      menus["Prescriptions"],
      menus["Prescription Management"],
      menus["User Management"],
      menus["Audit Logs"],
    ]);

    // Pharmacist
    await roles.pharmacist.setMenus([
      menus["Dashboard"],
      menus["Medicine Management"],
      menus["Inventory Management"],
      menus["Inventory Alerts"],
      menus["Supplier Management"],
      menus["Prescriptions"],
      menus["Prescription Management"],
    ]);

    // Cashier
    await roles.cashier.setMenus([
      menus["Dashboard"],
      menus["Create Order"],
      menus["Order Management"],
    ]);

    // Doctor
    await roles.doctor.setMenus([
      menus["Dashboard"],
      menus["Prescriptions"],
      menus["Prescription Management"],
    ]);

    // Superadmin gets all menus
    const allMenus = await Menu.findAll();
    await roles.superadmin.setMenus(allMenus);

    console.log("✅ Role-menu assignments complete");
    console.log("🎉 Database seeding finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding roles and menus:", err);
    process.exit(1);
  }
};

seedRolesAndAssignMenus();
