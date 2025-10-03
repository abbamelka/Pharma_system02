const inventoryService = require("../services/inventory.service");
const auditService = require("../services/audit.service"); // ✅ Import audit service

exports.addBatch = async (req, res) => {
  try {
    const batch = await inventoryService.addBatch(req.body);

    // ✅ Audit log
    await auditService.log(
      "INVENTORY_ADD",
      "Inventory",
      batch.id,
      {
        medicineId: batch.medicineId,
        batchNumber: batch.batchNumber,
        quantity: batch.quantity,
        expiryDate: batch.expiryDate,
        purchasePrice: batch.purchasePrice
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Inventory batch added successfully",
      batch
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateBatch = async (req, res) => {
  try {
    const batch = await inventoryService.updateBatch(req.params.id, req.body);

    // ✅ Audit log
    await auditService.log(
      "INVENTORY_UPDATE",
      "Inventory",
      batch.id,
      {
        changes: req.body,
        updatedFields: Object.keys(req.body)
      },
      req.user
    );

    res.json({
      success: true,
      message: "Batch updated successfully",
      batch
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBatchesByMedicine = async (req, res) => {
  try {
    const batches = await inventoryService.getBatchesByMedicine(req.params.medicineId);

    // ✅ Audit log
    await auditService.log(
      "INVENTORY_VIEW_BY_MEDICINE",
      "Inventory",
      null,
      { medicineId: req.params.medicineId, batchCount: batches.length },
      req.user
    );

    res.json({
      success: true,
      batches
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.getLowStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const batches = await inventoryService.getLowStockAlerts(threshold);

    // ✅ Audit log
    await auditService.log(
      "INVENTORY_LOW_STOCK_ALERT",
      "Inventory",
      null,
      { threshold, batchCount: batches.length },
      req.user
    );

    res.json({
      success: true,
      batches
    });
  } catch (error) {
    console.error("Error in getLowStockAlerts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching low stock alerts"
    });
  }
};

exports.getExpiringSoonAlerts = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const batches = await inventoryService.getExpiringSoonAlerts(days);

    // ✅ Audit log
    await auditService.log(
      "INVENTORY_EXPIRING_SOON_ALERT",
      "Inventory",
      null,
      { days, batchCount: batches.length },
      req.user
    );

    res.json({
      success: true,
      batches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching expiring soon alerts"
    });
  }
};

exports.getBatchById = async (req, res) => {
  try {
    const batch = await inventoryService.getBatchById(req.params.id);

    // ✅ Audit log
    await auditService.log(
      "INVENTORY_VIEW",
      "Inventory",
      batch.id,
      { batchNumber: batch.batchNumber },
      req.user
    );

    res.json({
      success: true,
      batch
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};
