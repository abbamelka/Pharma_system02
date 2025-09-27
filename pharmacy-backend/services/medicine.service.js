// services/medicine.service.js
const medicineRepo = require("../repositories/medicine.repository");
const inventoryRepo = require("../repositories/inventory.repository");

class MedicineService {
  async createMedicine(data) {
    const { inventories, ...medicineData } = data;
    const medicine = await medicineRepo.create(medicineData);

    if (inventories && Array.isArray(inventories)) {
      for (let inv of inventories) {
        await inventoryRepo.create({
          ...inv,
          medicineId: medicine.id
        });
      }
    }

    return medicine;
  }

  async getAllMedicines() {
    return await medicineRepo.findAll();
  }

  async getMedicineById(id) {
    const med = await medicineRepo.findById(id);
    if (!med) throw new Error("Medicine not found");
    return med;
  }

  async updateMedicine(id, data) {
    const med = await this.getMedicineById(id);
    return await medicineRepo.update(id, data);
  }

  async deleteMedicine(id) {
    const med = await this.getMedicineById(id);
    await medicineRepo.delete(id);
    return med;
  }

  async addInventory(medicineId, inventoryData) {
    const med = await this.getMedicineById(medicineId);
    return await inventoryRepo.create({
      ...inventoryData,
      medicineId
    });
  }

  async getLowStockMedicines(threshold = 5) {
    return await inventoryRepo.findLowStock(threshold);
  }

  async getExpiringSoonMedicines(days = 30) {
    return await inventoryRepo.findExpiringSoon(days);
  }

  // 🔍 New: Search & Filter Medicines
  async searchMedicines(filters = {}) {
  const result = await medicineRepo.searchAndFilter(filters);
  return result;
  }

  async searchMedicinesByName(name) {
    return await medicineRepo.findByName(name);
  }
}

module.exports = new MedicineService();