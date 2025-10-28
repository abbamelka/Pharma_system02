// routes/receipt.routes.js
const express = require("express");
const router = express.Router();
const ReceiptController = require("../controllers/receipt.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Receipts
 *   description: Generate and download order receipts
 */

/**
 * @swagger
 * /receipts/{id}:
 *   get:
 *     summary: Generate receipt for an order
 *     tags: [Receipts]
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
 *         description: Receipt generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 receipt:
 *                   $ref: '#/components/schemas/Receipt'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authenticate, authorizeRoles("admin", "pharmacist", "cashier","superadmin"), ReceiptController.generateReceipt);

/**
 * @swagger
 * /receipts/{id}/download:
 *   get:
 *     summary: Download receipt as plain text file
 *     tags: [Receipts]
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
 *         description: Receipt file downloaded
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id/download", authenticate, authorizeRoles("admin", "pharmacist", "cashier","superadmin"), ReceiptController.downloadReceipt);

module.exports = router;