// controllers/inventory.controller.js
const inventoryService = require("../services/inventory.service");

exports.addBatch = async (req, res) => {
  try {
    const batch = await inventoryService.addBatch(req.body);
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
    res.json({
      success: true,
       batches
    });
  } catch (error) {
    console.error("Error in getLowStockAlerts:", error); // 👈 Add this
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