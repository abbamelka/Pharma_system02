// routes/order.routes.js
const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Pharmacy order/sales management for walk-in customers
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order (walk-in customer)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *                 nullable: true
 *                 description: Name of walk-in customer (optional)
 *               customerPhone:
 *                 type: string
 *                 nullable: true
 *                 description: Phone number of walk-in customer (optional)
 *               prescriptionId:
 *                 type: integer
 *                 nullable: true
 *                 description: Optional prescription linked to this order
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 default: pending
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - medicineId
 *                     - quantity
 *                   properties:
 *                     medicineId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (e.g., insufficient stock, invalid item)
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, authorizeRoles("cashier", "admin", "pharmacist"), OrderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, authorizeRoles("admin", "pharmacist", "cashier"), OrderController.getAllOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authenticate, authorizeRoles("admin", "pharmacist", "cashier"), OrderController.getOrderById);

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Update order status (e.g., mark as completed)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (e.g., insufficient stock when marking as completed)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.patch("/:id/status", authenticate, authorizeRoles("cashier", "admin", "pharmacist"), OrderController.updateOrderStatus);

module.exports = router;