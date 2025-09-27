// controllers/prescription.controller.js
const prescriptionService = require("../services/prescription.service");

exports.createPrescription = async (req, res) => {
  try {
    const prescription = await prescriptionService.createPrescription({
      ...req.body,
      doctorId: req.user.id
    });
    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.fulfillPrescription = async (req, res) => {
  try {
    const cashierId = req.user.id;
    const { id: prescriptionId } = req.params;

    const result = await prescriptionService.fulfillPrescription(prescriptionId, cashierId);

    res.json({
      success: true,
      message: "Prescription fulfilled and order created",
      result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPendingPrescriptions = async (req, res) => {
  try {
    const prescriptions = await prescriptionService.getPendingPrescriptions();
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
    const prescription = await prescriptionService.getPrescriptionById(req.params.id);

    // ✅ Sanitize response to avoid null reference
    const response = {
      ...prescription.toJSON()
    };

    if (!response.doctor) {
      response.doctor = null;
    }

    res.json({
      success: true,
      prescription: response
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelPrescription = async (req, res) => {
  try {
    await prescriptionService.cancelPrescription(req.params.id);
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

    const prescriptions = await prescriptionService.searchPrescriptions({ customerName: name, customerPhone: phone });

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