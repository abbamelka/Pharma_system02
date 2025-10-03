const prescriptionService = require("../services/prescription.service");
const auditService = require("../services/audit.service");

exports.createPrescription = async (req, res) => {
  try {
    const prescription = await prescriptionService.createPrescription({
      ...req.body,
      doctorId: req.user.id
    });

    // ✅ Audit log
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

    // ✅ Audit log
    await auditService.log(
      "PRESCRIPTION_FULFILL",
      "Prescription",
      prescriptionId,
      { cashierId, orderId: result?.order?.id },
      req.user
    );

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

    // ✅ Audit log
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
    const prescription = await prescriptionService.getPrescriptionById(req.params.id);

    const response = {
      ...prescription.toJSON()
    };

    if (!response.doctor) {
      response.doctor = null;
    }

    // ✅ Audit log
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
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.cancelPrescription = async (req, res) => {
  try {
    await prescriptionService.cancelPrescription(req.params.id);

    // ✅ Audit log
    await auditService.log(
      "PRESCRIPTION_CANCEL",
      "Prescription",
      req.params.id,
      { reason: req.body?.reason || "No reason provided" },
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

    // ✅ Audit log
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
