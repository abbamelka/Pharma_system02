const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Manage system roles and user-role assignments
 */

// Apply authentication to all role routes
router.use(authenticate);

// ✅ PUBLIC ROUTES - Put specific routes FIRST

/**
 * @swagger
 * /roles/user/{userId}:
 *   get:
 *     summary: Get all roles assigned to a specific user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: List of roles assigned to the user
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only access own user data unless admin
 */
router.get("/user/:userId", (req, res, next) => {
  const requestedUserId = parseInt(req.params.userId);
  const currentUserId = req.user.id;
  
  // Users can access their own roles, admins can access any
  if (requestedUserId === currentUserId || 
      req.user.roles.includes('superadmin') || 
      req.user.roles.includes('admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}, roleController.getUserRoles);

/**
 * @swagger
 * /roles/{roleId}/menus:
 *   get:
 *     summary: Get all menus assigned to a specific role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the role
 *     responses:
 *       200:
 *         description: List of menus assigned to the role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only access menus for roles you have
 */
router.get("/:roleId/menus", (req, res, next) => {
  const requestedRoleId = parseInt(req.params.roleId);
  
  // Role ID to name mapping
  const roleMap = {
    1: 'superadmin',
    2: 'admin', 
    3: 'pharmacist',
    4: 'cashier',
    5: 'doctor'
  };
  
  const requestedRoleName = roleMap[requestedRoleId];
  
  // Check if user has the requested role or is admin
  const userHasRequestedRole = req.user.roles.includes(requestedRoleName);
  const isAdmin = req.user.roles.includes('superadmin') || req.user.roles.includes('admin');
  
  if (userHasRequestedRole || isAdmin) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
}, roleController.getMenusByRole);

// 🔒 ADMIN-ONLY ROUTES - Put generic routes LAST

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all available roles (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all roles in the system
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get("/", authorizeRoles("admin", "superadmin"), roleController.getAllRoles);

/**
 * @swagger
 * /roles/assign:
 *   post:
 *     summary: Assign a role to a user (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *               roleId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/assign", authorizeRoles("admin", "superadmin"), roleController.assignRoleToUser);

/**
 * @swagger
 * /roles/remove:
 *   post:
 *     summary: Remove a role from a user (Admin only)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *               roleId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post("/remove", authorizeRoles("admin", "superadmin"), roleController.removeRoleFromUser);

module.exports = router;