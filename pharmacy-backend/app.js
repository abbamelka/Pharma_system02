const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const sequelize = require("./config/db");
const { errorHandler } = require("./middleware/error.middleware");

dotenv.config();

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================
// 🔧 Middleware Setup
// =====================
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Needed for file uploads (multipart/form-data)
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// =====================
// 📘 Swagger Setup
// =====================
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Pharmacy Backend API",
      version: "1.0.0",
      description: "API documentation for Pharmacy Management System",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // 👈 includes all route files
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// =====================
// 📦 Static Files (Prescriptions, etc.)
// =====================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =====================
// 🚦 Routes
// =====================
app.use("/users", require("./routes/user.routes"));
app.use("/orders", require("./routes/order.routes"));
app.use("/inventory", require("./routes/inventory.routes"));
app.use("/prescriptions", require("./routes/prescription.routes"));
app.use("/reports", require("./routes/report.routes"));
app.use("/suppliers", require("./routes/supplier.routes"));
app.use("/medicine", require("./routes/medicine.routes"));
app.use("/receipts", require("./routes/receipt.routes"));
app.use("/audit", require("./routes/audit.routes"));
app.use('/ai', require('./routes/ai'));
const roleRoutes = require("./routes/role.routes");
app.use("/roles", roleRoutes);
app.use("/menus",require("./routes/menu.routes"));
// =====================
// ⚠️ Error Handler
// =====================
app.use(errorHandler);

// =====================
// 🧩 Database Sync
// =====================
sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("✅ Database synced successfully.");
  })
  .catch((err) => {
    console.error("❌ Database sync error:", err.message);
  });

// =====================
// 🚀 Server Export
// =====================
module.exports = app;
