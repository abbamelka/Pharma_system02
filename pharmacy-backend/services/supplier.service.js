// services/supplier.service.js
const supplierRepo = require("../repositories/supplier.repository");
const { Op } = require("sequelize");
class SupplierService {
  async createSupplier(data) {
    const { name, email, phone, address, contact } = data;

    // Basic validation
    if (!name) throw new Error("Supplier name is required");

    return await supplierRepo.create({
      name,
      email,
      phone,
      address,
      contact
    });
  }

  async getAllSuppliers() {
    return await supplierRepo.findAll();
  }

  async getSupplierById(id) {
    const supplier = await supplierRepo.findById(id);
    if (!supplier) throw new Error("Supplier not found");
    return supplier;
  }

  async updateSupplier(id, updateData) {
    const existing = await this.getSupplierById(id);
    return await supplierRepo.update(id, updateData);
  }

  async deleteSupplier(id) {
    const supplier = await this.getSupplierById(id);
    await supplierRepo.delete(id);
    return supplier;
  }

  async searchSuppliers(name) {
    return await supplierRepo.searchByName(name);
  }
}

module.exports = new SupplierService();