const express = require("express");
const router = express.Router();
const PrescriptionController = require("../controllers/prescription.controller");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Prescriptions
 *   description: Manage doctor prescriptions and fulfillment for walk-in patients
 */

/**
 * @swagger
 * /prescriptions:
 *   post:
 *     summary: Create a new prescription (doctor only) - supports walk-in patients
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - details
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: Name of the patient (walk-in allowed)
 *               customerPhone:
 *                 type: string
 *                 nullable: true
 *                 description: Phone number of the patient
 *               details:
 *                 type: string
 *                 description: Format "medicineId:quantity,..." e.g., "3:2,7:1"
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               duration:
 *                 type: string
 *               validUntil:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Bad request (e.g., invalid details)
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, authorizeRoles("doctor"), PrescriptionController.createPrescription);

/**
 * @swagger
 * /prescriptions/pending:
 *   get:
 *     summary: Get all pending prescriptions (pharmacist/admin)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending prescriptions
 *       401:
 *         description: Unauthorized
 */
router.get("/pending", authenticate, authorizeRoles("pharmacist", "admin"), PrescriptionController.getPendingPrescriptions);

/**
 * @swagger
 * /prescriptions/search:
 *   get:
 *     summary: Search prescriptions by patient name or phone
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Patient name
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Patient phone number
 *     responses:
 *       200:
 *         description: List of matching prescriptions
 *       400:
 *         description: At least one of 'name' or 'phone' is required
 *       401:
 *         description: Unauthorized
 */
router.get("/search", authenticate, authorizeRoles("pharmacist", "admin", "doctor"), PrescriptionController.searchPrescriptions);

/**
 * @swagger
 * /prescriptions/{id}:
 *   get:
 *     summary: Get prescription by ID
 *     tags: [Prescriptions]
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
 *         description: Prescription details
 *       404:
 *         description: Not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authenticate, authorizeRoles("pharmacist", "admin", "doctor"), PrescriptionController.getPrescriptionById);

/**
 * @swagger
 * /prescriptions/{id}/fulfill:
 *   patch:
 *     summary: Fulfill a prescription → create order (pharmacist only)
 *     tags: [Prescriptions]
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
 *         description: Prescription fulfilled and order created
 *       400:
 *         description: Bad request (e.g., expired, invalid format)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prescription not found
 */
router.patch("/:id/fulfill", authenticate, authorizeRoles("pharmacist", "admin"), PrescriptionController.fulfillPrescription);

/**
 * @swagger
 * /prescriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel a pending prescription (doctor/pharmacist)
 *     tags: [Prescriptions]
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
 *         description: Prescription cancelled
 *       400:
 *         description: Bad request (e.g., already fulfilled)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prescription not found
 */
router.patch("/:id/cancel", authenticate, authorizeRoles("doctor", "pharmacist"), PrescriptionController.cancelPrescription);

// routes/prescription.routes.js


module.exports = router;