// repositories/medicine.repository.js
const { Medicine, Inventory } = require("../models");
const { Op } = require("sequelize");

class MedicineRepository {
  async create(medicineData) {
    return await Medicine.create(medicineData);
  }

  async findAll() {
    return await Medicine.findAll();
  }

  async findById(id) {
    return await Medicine.findByPk(id);
  }

  async update(id, updateData) {
    const medicine = await Medicine.findByPk(id);
    if (!medicine) return null;
    return await medicine.update(updateData);
  }

  async delete(id) {
    const medicine = await Medicine.findByPk(id);
    if (!medicine) return null;
    await medicine.destroy();
    return medicine;
  }

  async findByBarcode(barcode) {
    return await Medicine.findOne({ where: { barcode } });
  }

  // Search & filter method for your new search feature
 async  searchAndFilter(filters = {}) {
  const { search, category, barcode, inStock, page = 1, limit = 10 } = filters;

  const where = {};
  const include = [];

  // 🔹 Allow search across multiple fields
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } },
        { manufacturer: { [Op.iLike]: `%${search}%` } },
        { batchNumber: { [Op.iLike]: `%${search}%` } }, // 🔹 added
      ];
    }


  if (category) {
    where.category = category;
  }

  if (barcode) {
    where.barcode = barcode;
  }

  if (inStock === "true" || inStock === true) {
    include.push({
      model: Inventory,
      as: "Inventories", // must match your association alias
      where: { quantity: { [Op.gt]: 0 } },
      required: true,
    });
  }

  const offset = (page - 1) * limit;

  return await Medicine.findAndCountAll({
    where,
    include,
    limit: parseInt(limit),
    offset: parseInt(offset),
    distinct: true,
    order: [["createdAt", "DESC"]],
  });
}

  async findByName(name) {
    
    // Trim and sanitize input
    const searchTerm = (name || '').trim();
    if (!searchTerm) return [];

    try {
      return await Medicine.findAll({
        where: {
          name: {
            [Op.like]: `%${searchTerm}%` // ✅ Works on MySQL (case-insensitive enough for most cases)
          }
        }
      });
    } catch (error) {
      console.error('Repository Error - findByName:', error.message);
      throw new Error('Failed to search medicines');
    }
  }
}

module.exports = new MedicineRepository();