const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/db");
const { errorHandler } = require("./middleware/error.middleware");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

dotenv.config();
const app = express(); // <-- app must be defined BEFORE using it
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Pharmacy Backend API",
      version: "1.0.0",
      description: "API documentation for Pharmacy Backend",
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
  },
  apis: ["./routes/*.js"], // <-- point to your route files
};

const cors = require("cors");

// Allow frontend (React/Vue) to call your APIs
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"], // React, Vite
  credentials: true
}));
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/users", require("./routes/user.routes"));
app.use("/orders", require("./routes/order.routes"));
app.use("/inventory", require("./routes/inventory.routes"));
app.use("/prescriptions", require("./routes/prescription.routes"));
app.use("/reports", require("./routes/report.routes"));
app.use("/suppliers", require("./routes/supplier.routes"));
app.use("/medicine", require("./routes/medicine.routes"));
app.use("/receipts", require("./routes/receipt.routes"));
app.use("/audit",require("./routes/audit.routes"));

// app.use("/api/medicines", require("./routes/medicine.routes"));
// app.use("/api/auth", require("./routes/auth.routes"));

app.use(errorHandler);

// Database sync
sequelize.sync({ alter: false }).then(() => {
  console.log("✅ Database synced");
});

module.exports = app;
