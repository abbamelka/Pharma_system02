// repositories/supplier.repository.js
const { Supplier } = require("../models");
const { Op } = require("sequelize");
class SupplierRepository {
  async create(supplierData) {
    return await Supplier.create(supplierData);
  }

  async findAll() {
    return await Supplier.findAll();
  }

  async findById(id) {
    return await Supplier.findByPk(id);
  }

  async update(id, updateData) {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) return null;
    return await supplier.update(updateData);
  }

  async delete(id) {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) return null;
    await supplier.destroy();
    return supplier;
  }

  async searchByName(name) {
    return await Supplier.findAll({
      where: {
        name: { [Op.like]: `%${name}%` }
      }
    });
  }
}

module.exports = new SupplierRepository();