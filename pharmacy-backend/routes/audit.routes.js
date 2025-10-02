// routes/audit.routes.js
const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/auth");
const auditService = require("../services/audit.service");

/**
 * @swagger
 * audit/logs:
 *   get:
 *     summary: Get all audit logs (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *                   example: true
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/logs", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    const logs = await auditService.getAllLogs(200);
    return res.json({ success: true, logs });
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs"
    });
  }
});

module.exports = router;