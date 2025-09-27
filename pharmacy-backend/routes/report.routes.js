// routes/report.routes.js
const express = require("express");
const router = express.Router();
const ReportController = require("../controllers/report.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Dashboard and analytics endpoints (admin only)
 */

/**
 * @swagger
 * /reports/daily-sales:
 *   get:
 *     summary: Get today's sales summary
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daily sales report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                     totalSales:
 *                       type: number
 *                     orderCount:
 *                       type: integer
 *                     avgOrderValue:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/daily-sales", authenticate, authorizeRoles("admin"), ReportController.getDailySales);

/**
 * @swagger
 * /reports/top-medicines:
 *   get:
 *     summary: Get top selling medicines
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *     responses:
 *       200:
 *         description: Top medicines report
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
 *                     type: object
 *                     properties:
 *                       medicineId:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       totalQuantity:
 *                         type: integer
 *                       totalRevenue:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/top-medicines", authenticate, authorizeRoles("admin"), ReportController.getTopMedicines);

/**
 * @swagger
 * /reports/low-stock:
 *   get:
 *     summary: Get low stock alerts
 *     tags: [Reports]
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
 *         description: Low stock report
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
 *                     type: object
 *                     properties:
 *                       batchId:
 *                         type: integer
 *                       medicineName:
 *                         type: string
 *                       category:
 *                         type: string
 *                       currentStock:
 *                         type: integer
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *       401:
 *         description: Unauthorized
 */
router.get("/low-stock", authenticate, authorizeRoles("admin"), ReportController.getLowStockAlerts);

/**
 * @swagger
 * /reports/expiring-soon:
 *   get:
 *     summary: Get expiring soon alerts
 *     tags: [Reports]
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
 *         description: Expiring soon report
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
 *                     type: object
 *                     properties:
 *                       batchId:
 *                         type: integer
 *                       medicineName:
 *                         type: string
 *                       batchNumber:
 *                         type: string
 *                       currentStock:
 *                         type: integer
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *       401:
 *         description: Unauthorized
 */
router.get("/expiring-soon", authenticate, authorizeRoles("admin"), ReportController.getExpiringSoonAlerts);

/**
 * @swagger
 * /reports/prescription-rate:
 *   get:
 *     summary: Get prescription fulfillment rate
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prescription stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPrescriptions:
 *                       type: integer
 *                     fulfilled:
 *                       type: integer
 *                     cancelled:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     fulfillmentRate:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/prescription-rate", authenticate, authorizeRoles("admin"), ReportController.getPrescriptionFulfillmentRate);

/**
 * @swagger
 * /reports/revenue-by-category:
 *   get:
 *     summary: Get revenue breakdown by medicine category
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue by category
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
 *                     type: object
 *                     properties:
 *                       category:
 *                         type: string
 *                       revenue:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/revenue-by-category", authenticate, authorizeRoles("admin"), ReportController.getRevenueByCategory);

module.exports = router;