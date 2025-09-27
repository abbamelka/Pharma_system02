// routes/supplier.routes.js
const express = require("express");
const router = express.Router();
const SupplierController = require("../controllers/supplier.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Manage pharmacy suppliers
 */

/**
 * @swagger
 * /suppliers:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       201:
 *         description: Supplier created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, authorizeRoles("admin", "pharmacist"), SupplierController.createSupplier);

/**
 * @swagger
 * /suppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of suppliers
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, authorizeRoles("admin", "pharmacist"), SupplierController.getAllSuppliers);

/**
 * @swagger
 * /suppliers/search:
 *   get:
 *     summary: Search suppliers by name
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.get("/search", authenticate, authorizeRoles("admin", "pharmacist"), SupplierController.searchSuppliers);

/**
 * @swagger
 * /suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Suppliers]
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
 *         description: Supplier details
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authenticate, authorizeRoles("admin", "pharmacist"), SupplierController.getSupplierById);

/**
 * @swagger
 * /suppliers/{id}:
 *   put:
 *     summary: Update supplier
 *     tags: [Suppliers]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               contact:
 *                 type: string
 *     responses:
 *       200:
 *         description: Supplier updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authenticate, authorizeRoles("admin", "pharmacist"), SupplierController.updateSupplier);

/**
 * @swagger
 * /suppliers/{id}:
 *   delete:
 *     summary: Delete supplier
 *     tags: [Suppliers]
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
 *         description: Supplier deleted
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authenticate, authorizeRoles("admin"), SupplierController.deleteSupplier);

module.exports = router;