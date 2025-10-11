// src/controllers/prescription.controller.js
const { Prescription, User, Medicine } = require("../models"); // ✅ Import models
const prescriptionService = require("../services/prescription.service");
const auditService = require("../services/audit.service");

exports.createPrescription = async (req, res) => {
  try {
    const prescription = await prescriptionService.createPrescription({
      ...req.body,
      doctorId: req.user.id
    });

    await auditService.log(
      "PRESCRIPTION_CREATE",
      "Prescription",
      prescription.id,
      { doctorId: req.user.id, customerName: req.body.customerName },
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription
    });
  } catch (error) {
    console.error("Create prescription error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.fulfillPrescription = async (req, res) => {
  try {
    const { id: prescriptionId } = req.params;

    // Find prescription
    const prescription = await Prescription.findByPk(prescriptionId);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    // Check role: only pharmacists/admins can fulfill
    if (!["pharmacist", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to fulfill prescriptions"
      });
    }

    // Only allow pending prescriptions
    if (prescription.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending prescriptions can be fulfilled"
      });
    }

    // Expired?
    if (prescription.validUntil && new Date() > new Date(prescription.validUntil)) {
      return res.status(400).json({
        success: false,
        message: "Prescription has expired"
      });
    }

    // ✅ Simple: Just update status
    await prescription.update({ status: "fulfilled" });

    // Log audit
    await auditService.log(
      "PRESCRIPTION_FULFILL",
      "Prescription",
      prescription.id,
      { fulfilledBy: req.user.id },
      req.user
    );

    return res.json({
      success: true,
      message: "✅ Prescription marked as fulfilled",
      prescription: {
        ...prescription.toJSON(),
        status: "fulfilled"
      }
    });
  } catch (error) {
    console.error("Fulfill prescription error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fulfill prescription"
    });
  }
};

exports.getPendingPrescriptions = async (req, res) => {
  try {
    const prescriptions = await prescriptionService.getPendingPrescriptions();

    await auditService.log(
      "PRESCRIPTION_PENDING_LIST",
      "Prescription",
      null,
      { count: prescriptions.length },
      req.user
    );

    res.json({
      success: true,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching prescriptions"
    });
  }
};

exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findByPk(id, {
      include: [
        {
          model: User,
          as: 'doctor',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    // Enrich with medicine names
    let medicineDetails = [];
    if (Array.isArray(prescription.medicines) && prescription.medicines.length > 0) {
      const medicineIds = prescription.medicines.map(m => m.medicineId);
      const medicines = await Medicine.findAll({
        where: { id: medicineIds },
        attributes: ['id', 'name', 'dosageForm', 'strength']
      });

      const map = {};
      medicines.forEach(m => { map[m.id] = m; });

      medicineDetails = prescription.medicines.map(item => {
        const med = map[item.medicineId];
        return {
          medicineId: item.medicineId,
          medicineName: med?.name || 'Unknown',
          dosageForm: med?.dosageForm || '',
          strength: med?.strength || '',
          quantity: item.quantity
        };
      });
    }

    const response = {
      ...prescription.toJSON(),
      medicineDetails
    };

    await auditService.log(
      "PRESCRIPTION_VIEW",
      "Prescription",
      prescription.id,
      { doctorId: prescription.doctorId },
      req.user
    );

    res.json({
      success: true,
      prescription: response
    });
  } catch (error) {
    console.error("Get prescription error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prescription"
    });
  }
};

exports.cancelPrescription = async (req, res) => {
  try {
    await prescriptionService.cancelPrescription(req.params.id);

    await auditService.log(
      "PRESCRIPTION_CANCEL",
      "Prescription",
      req.params.id,
      { reason: req.body.reason || "No reason provided" },
      req.user
    );

    res.json({
      success: true,
      message: "Prescription cancelled successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.searchPrescriptions = async (req, res) => {
  try {
    const { name, phone } = req.query;

    if (!name && !phone) {
      return res.status(400).json({
        success: false,
        message: "At least one of 'name' or 'phone' is required"
      });
    }

    const prescriptions = await prescriptionService.searchPrescriptions({
      customerName: name,
      customerPhone: phone
    });

    await auditService.log(
      "PRESCRIPTION_SEARCH",
      "Prescription",
      null,
      { name, phone, results: prescriptions.length },
      req.user
    );

    res.json({
      success: true,
      prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error searching prescriptions"
    });
  }
};