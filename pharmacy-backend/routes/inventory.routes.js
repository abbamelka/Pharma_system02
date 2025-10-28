// routes/inventory.routes.js
const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/inventory.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Manage medicine stock batches
 */

/**
 * @swagger
 * /inventory/batch:
 *   post:
 *     summary: Add a new inventory batch
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicineId
 *               - batchNumber
 *               - quantity
 *               - expiryDate
 *             properties:
 *               medicineId:
 *                 type: integer
 *               supplierId:
 *                 type: integer
 *                 nullable: true
 *               batchNumber:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               purchasePrice:
 *                 type: number
 *                 format: float
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Batch added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/batch", authenticate, authorizeRoles("pharmacist", "admin","superadmin"), InventoryController.addBatch);

/**
 * @swagger
 * /inventory/batch/{id}:
 *   put:
 *     summary: Update an inventory batch
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               purchasePrice:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Batch updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Batch not found
 *       401:
 *         description: Unauthorized
 */
router.put("/batch/:id", authenticate, authorizeRoles("pharmacist", "admin","superadmin"), InventoryController.updateBatch);

/**
 * @swagger
 * /inventory/medicine/{medicineId}:
 *   get:
 *     summary: Get all batches for a medicine
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicineId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of batches
 *       404:
 *         description: No batches found
 *       401:
 *         description: Unauthorized
 */
router.get("/medicine/:medicineId", authenticate, authorizeRoles("pharmacist", "admin", "cashier","superadmin"), InventoryController.getBatchesByMedicine);

/**
 * @swagger
 * /inventory/low-stock:
 *   get:
 *     summary: Get low stock alerts
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *         default: 5
 *     responses:
 *       200:
 *         description: List of low stock batches
 *       401:
 *         description: Unauthorized
 */
router.get("/low-stock", authenticate, authorizeRoles("admin", "pharmacist","superadmin"), InventoryController.getLowStockAlerts);

/**
 * @swagger
 * /inventory/expiring-soon:
 *   get:
 *     summary: Get batches expiring soon
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         default: 30
 *     responses:
 *       200:
 *         description: List of expiring soon batches
 *       401:
 *         description: Unauthorized
 */
router.get("/expiring-soon", authenticate, authorizeRoles("admin", "pharmacist","superadmin"), InventoryController.getExpiringSoonAlerts);
/**
 * @swagger
 * /inventory/batch/{id}:
 *   get:
 *     summary: Get batch by ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Batch details
 *       404:
 *         description: Batch not found
 *       401:
 *         description: Unauthorized
 */
router.get("/batch/:id", authenticate, authorizeRoles("pharmacist", "admin", "cashier","superadmin"), InventoryController.getBatchById);

module.exports = router;