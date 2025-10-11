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
 *     description: |
 *       Creates a new pharmacy order for a walk-in customer.
 *       - If any medicine requires a prescription, a prescription photo must be uploaded.
 *       - The request must be sent as **multipart/form-data** when uploading images.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Optional walk-in customer name
 *               customerPhone:
 *                 type: string
 *                 example: "+251912345678"
 *                 description: Optional customer phone number
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 default: pending
 *               items:
 *                 type: string
 *                 description: JSON array of medicineId and quantity objects
 *                 example: '[{"id":1,"quantity":2},{"id":3,"quantity":1}]'
 *               prescriptionPhoto:
 *                 type: string
 *                 format: binary
 *                 description: Upload prescription photo (required if medicines need one)
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order created successfully"
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad request (e.g., insufficient stock, missing prescription)
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("cashier", "admin", "pharmacist"),
  OrderController.createOrder
);

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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
  authorizeRoles("admin", "pharmacist", "cashier"),
  OrderController.getAllOrders
);

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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles("admin", "pharmacist", "cashier"),
  OrderController.getOrderById
);

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
 *                 example: completed
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order status updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status or stock issue
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("cashier", "admin", "pharmacist"),
  OrderController.updateOrderStatus
);

module.exports = router;
