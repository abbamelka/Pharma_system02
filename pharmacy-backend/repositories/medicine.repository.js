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

  // ✅ MySQL-compatible search & filter
  async searchAndFilter(filters = {}) {
    const { search, category, barcode, inStock, page = 1, limit = 10 } = filters;

    const where = {};
    const include = [];

    // 🔹 Allow search across multiple fields
    if (search) {
      const likePattern = `%${search}%`;

      // MySQL uses `LIKE`, not `ILIKE`
      where[Op.or] = [
        { name: { [Op.like]: likePattern } },
        { description: { [Op.like]: likePattern } },
        { barcode: { [Op.like]: likePattern } },
        { manufacturer: { [Op.like]: likePattern } },
        { batchNumber: { [Op.like]: likePattern } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (barcode) {
      where.barcode = barcode;
    }

    // 🔹 Include inventory filter
    if (inStock === "true" || inStock === true) {
      include.push({
        model: Inventory,
        as: "Inventories", // Ensure this matches your association
        where: { quantity: { [Op.gt]: 0 } },
        required: true,
      });
    }

    const offset = (page - 1) * limit;

    try {
      return await Medicine.findAndCountAll({
        where,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true,
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      console.error("Search error:", error);
      throw new Error("Failed to search and filter medicines");
    }
  }

  async findByName(name) {
    const searchTerm = (name || "").trim();
    if (!searchTerm) return [];

    try {
      return await Medicine.findAll({
        where: {
          name: {
            [Op.like]: `%${searchTerm}%`,
          },
        },
      });
    } catch (error) {
      console.error("Repository Error - findByName:", error.message);
      throw new Error("Failed to search medicines");
    }
  }
}

module.exports = new MedicineRepository();
