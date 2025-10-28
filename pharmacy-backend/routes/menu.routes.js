const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");
const { authenticate,authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Manage system menus and their role assignments
 */

/**
 * @swagger
 * /menus/all:
 *   get:
 *     summary: Get all available menus
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all menus in the system
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   text:
 *                     type: string
 *                   path:
 *                     type: string
 *                   icon:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/all",authenticate,authorizeRoles("admin","superadmin"),  menuController.fetchAllMenus);

/**
 * @swagger
 * /menus/{roleId}:
 *   get:
 *     summary: Get all menus assigned to a specific role
 *     tags: [Menus]
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
 *         description: Successfully fetched menus for the role
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   text:
 *                     type: string
 *                   path:
 *                     type: string
 *                   icon:
 *                     type: string
 *       404:
 *         description: Role not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:roleId",authenticate,authorizeRoles("admin","superadmin"), menuController.getMenusByRole);

/**
 * @swagger
 * /menus/assign:
 *   post:
 *     summary: Assign a menu to a role
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - menuId
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: Role ID
 *               menuId:
 *                 type: integer
 *                 description: Menu ID
 *     responses:
 *       200:
 *         description: Menu assigned successfully
 *       404:
 *         description: Role or Menu not found
 *       401:
 *         description: Unauthorized
 */
router.post("/assign",authenticate,authorizeRoles("admin","superadmin"), menuController.assignMenuToRole);

/**
 * @swagger
 * /menus/remove:
 *   post:
 *     summary: Remove a menu from a role
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *               - menuId
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: Role ID
 *               menuId:
 *                 type: integer
 *                 description: Menu ID
 *     responses:
 *       200:
 *         description: Menu removed successfully
 *       404:
 *         description: Role or Menu not found
 *       401:
 *         description: Unauthorized
 */
router.post("/remove",authenticate,authorizeRoles("admin","superadmin"), menuController.removeMenuFromRole);

module.exports = router;
