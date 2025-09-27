const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicine.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Medicines
 *   description: Manage pharmacy medicines and inventory
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Medicine:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         category:
 *           type: string
 *           enum: [prescription, OTC, supplement]
 *         barcode:
 *           type: string
 *         manufacturer:
 *           type: string
 *         expiryDate:
 *           type: string
 *           format: date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     MedicineUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         category:
 *           type: string
 *           enum: [prescription, OTC, supplement]
 *         barcode:
 *           type: string
 *         manufacturer:
 *           type: string
 *
 *     InventoryCreate:
 *       type: object
 *       required:
 *         - batchNumber
 *         - quantity
 *         - expiryDate
 *       properties:
 *         batchNumber:
 *           type: string
 *         quantity:
 *           type: integer
 *         expiryDate:
 *           type: string
 *           format: date
 *
 *     InventoryBatch:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         medicineId:
 *           type: integer
 *         batchNumber:
 *           type: string
 *         quantity:
 *           type: integer
 *         expiryDate:
 *           type: string
 *           format: date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /medicine:
 *   post:
 *     summary: Create a new medicine
 *     tags: [Medicines]
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
 *               - price
 *               - expiryDate
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               category:
 *                 type: string
 *                 enum: [prescription, OTC, supplement]
 *               barcode:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               inventories:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/InventoryCreate'
 *     responses:
 *       201:
 *         description: Medicine created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, authorizeRoles("admin", "pharmacist"), medicineController.createMedicine);

/**
 * @swagger
 * /medicine:
 *   get:
 *     summary: Get all medicines
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of medicines
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
 *                     $ref: '#/components/schemas/Medicine'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, authorizeRoles("admin", "pharmacist", "cashier"), medicineController.getAllMedicines);

/**
 * @swagger
 * /medicine/low-stock:
 *   get:
 *     summary: Get low stock medicines
 *     tags: [Medicines]
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
 *         description: Low stock list
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
 *                     $ref: '#/components/schemas/InventoryBatch'
 *       401:
 *         description: Unauthorized
 */
router.get("/low-stock", authenticate, authorizeRoles("admin", "pharmacist"), medicineController.getLowStock);

/**
 * @swagger
 * /medicine/expiring-soon:
 *   get:
 *     summary: Get expiring soon medicines
 *     tags: [Medicines]
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
 *         description: Expiring soon list
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
 *                     $ref: '#/components/schemas/InventoryBatch'
 *       401:
 *         description: Unauthorized
 */
router.get("/expiring-soon", authenticate, authorizeRoles("admin", "pharmacist"), medicineController.getExpiringSoon);
/**
 * @swagger
 * /medicine/search:
 *   get:
 *     summary: Search and filter medicines
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by medicine name (case-insensitive)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [prescription, OTC, supplement]
 *         description: Filter by category
 *       - in: query
 *         name: barcode
 *         schema:
 *           type: string
 *         description: Search by barcode
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Only show medicines with available stock
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *     responses:
 *       200:
 *         description: Search results
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
 *                     $ref: '#/components/schemas/Medicine'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/search", authenticate, authorizeRoles("admin", "pharmacist", "cashier"), medicineController.searchMedicines);

/**
 * @swagger
 * /medicine/{id}:
 *   get:
 *     summary: Get medicine by ID
 *     tags: [Medicines]
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
 *         description: Medicine details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Medicine'
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authenticate, authorizeRoles("admin", "pharmacist", "cashier"), medicineController.getMedicineById);

/**
 * @swagger
 * /medicine/{id}:
 *   put:
 *     summary: Update medicine
 *     tags: [Medicines]
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
 *             $ref: '#/components/schemas/MedicineUpdate'
 *     responses:
 *       200:
 *         description: Medicine updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Medicine'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authenticate, authorizeRoles("admin", "pharmacist"), medicineController.updateMedicine);

/**
 * @swagger
 * /medicine/{id}:
 *   delete:
 *     summary: Delete medicine
 *     tags: [Medicines]
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
 *         description: Medicine deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authenticate, authorizeRoles("admin"), medicineController.deleteMedicine);

/**
 * @swagger
 * /medicine/{medicineId}/inventory:
 *   post:
 *     summary: Add inventory batch to a medicine
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicineId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryCreate'
 *     responses:
 *       201:
 *         description: Inventory added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/InventoryBatch'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/:medicineId/inventory", authenticate, authorizeRoles("admin", "pharmacist"), medicineController.addInventory);


module.exports = router;
