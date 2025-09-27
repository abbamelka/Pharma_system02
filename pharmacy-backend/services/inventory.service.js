// services/inventory.service.js
const { Op } = require("sequelize");
const inventoryRepo = require("../repositories/inventory.repository");
const { Medicine, Supplier } = require("../models");
class InventoryService {
  async addBatch(data) {
    const { medicineId, supplierId, batchNumber, quantity, expiryDate, purchasePrice } = data;

    // Validate medicine exists
    const medicine = await Medicine.findByPk(medicineId);
    if (!medicine) throw new Error("Medicine not found");

    // Validate supplier (if provided)
    if (supplierId) {
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) throw new Error("Supplier not found");
    }

    // Create inventory batch
    const batch = await inventoryRepo.create({
      medicineId,
      supplierId,
      batchNumber,
      quantity,
      expiryDate,
      purchasePrice
    });

    return batch;
  }

  async updateBatch(id, updateData) {
    const batch = await inventoryRepo.findById(id);
    if (!batch) throw new Error("Batch not found");

    return await inventoryRepo.update(id, updateData);
  }

  async getBatchesByMedicine(medicineId) {
    const batches = await inventoryRepo.findByMedicineId(medicineId);
    if (batches.length === 0) throw new Error("No batches found for this medicine");
    return batches;
  }

  async getLowStockAlerts(threshold = 5) {
    return await inventoryRepo.findLowStock(threshold);
  }

  async getExpiringSoonAlerts(days = 30) {
    return await inventoryRepo.findExpiringSoon(days);
  }

  async getBatchById(id) {
    const batch = await inventoryRepo.findById(id);
    if (!batch) throw new Error("Batch not found");
    return batch;
  }
}

module.exports = new InventoryService();