// controllers/report.controller.js
const reportService = require("../services/report.service");

exports.getDailySales = async (req, res) => {
  try {
    const report = await reportService.getDailySales();
    res.json({ success: true, report });
  } catch (error) {
    console.error("Error in getDailySales:", error); // ✅ log the error
    res.status(500).json({
      success: false,
      message: "Error generating daily sales report",
      error: error.message, // optional: expose for debugging
    });
  }
};

exports.getTopMedicines = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const report = await reportService.getTopMedicines(limit);
    res.json({ success: true, report });
  } catch (error) {
    console.error("Error in getTopMedicines:", error); // ✅ log
    res.status(500).json({
      success: false,
      message: "Error generating top medicines report",
      error: error.message,
    });
  }
};

exports.getLowStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold, 10) || 5;
    const report = await reportService.getLowStockAlerts(threshold);
    res.json({ success: true, report });
  } catch (error) {
    console.error("Error in getLowStockAlerts:", error);
    res.status(500).json({
      success: false,
      message: "Error generating low stock report",
      error: error.message,
    });
  }
};

exports.getExpiringSoonAlerts = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const report = await reportService.getExpiringSoonAlerts(days);
    res.json({ success: true, report });
  } catch (error) {
    console.error("Error in getExpiringSoonAlerts:", error);
    res.status(500).json({
      success: false,
      message: "Error generating expiring soon report",
      error: error.message,
    });
  }
};

exports.getPrescriptionFulfillmentRate = async (req, res) => {
  try {
    const report = await reportService.getPrescriptionFulfillmentRate();
    res.json({ success: true, report });
  } catch (error) {
    console.error("Error in getPrescriptionFulfillmentRate:", error);
    res.status(500).json({
      success: false,
      message: "Error generating prescription report",
      error: error.message,
    });
  }
};

exports.getRevenueByCategory = async (req, res) => {
  try {
    const report = await reportService.getRevenueByCategory();
    res.json({ success: true, report });
  } catch (error) {
    console.error("Error in getRevenueByCategory:", error);
    res.status(500).json({
      success: false,
      message: "Error generating revenue by category report",
      error: error.message,
    });
  }
};
