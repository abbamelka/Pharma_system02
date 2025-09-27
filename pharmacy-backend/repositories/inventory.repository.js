// repositories/inventory.repository.js
const { Op } = require("sequelize"); 

const { Inventory, Medicine, Supplier } = require("../models");

class InventoryRepository {
  async create(inventoryData) {
    return await Inventory.create(inventoryData);
  }

  async update(id, updateData) {
    const inv = await Inventory.findByPk(id);
    if (!inv) return null;
    return await inv.update(updateData);
  }

  async findByMedicineId(medicineId) {
    return await Inventory.findAll({
      where: { medicineId },
      include: [{ model: Supplier, as: "Supplier" }],
      order: [["expiryDate", "ASC"]]
    });
  }

  async findLowStock(threshold = 5) {
    return await Inventory.findAll({
      where: { quantity: { [Op.lt]: threshold } },
      include: [
        { model: Medicine, as: "Medicine" },
        { model: Supplier, as: "Supplier" }
      ]
    });
  }

  async findExpiringSoon(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return await Inventory.findAll({
      where: { expiryDate: { [Op.lte]: cutoff } },
      include: [
        { model: Medicine, as: "Medicine" },
        { model: Supplier, as: "Supplier" }
      ],
      order: [["expiryDate", "ASC"]]
    });
  }

  async findById(id) {
    return await Inventory.findByPk(id, {
      include: [
        { model: Medicine, as: "Medicine" },
        { model: Supplier, as: "Supplier" }
      ]
    });
  }
}

module.exports = new InventoryRepository();