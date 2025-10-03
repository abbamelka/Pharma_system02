const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/auth");
const auditService = require("../services/audit.service");
const db = require("../models");

/**
 * @swagger
 * /api/audit/logs:
 *   get:
 *     summary: Get all audit logs with pagination (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 */
router.get("/logs", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const offset = (page - 1) * limit;

    const { count, rows: logs } = await db.AuditLog.findAndCountAll({
      include: [{ model: db.User, as: 'Performer', attributes: ['username', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    return res.json({
      success: true,
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        hasNext: page * limit < count,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs"
    });
  }
});

module.exports = router;
