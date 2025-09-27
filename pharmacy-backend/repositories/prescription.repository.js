// repositories/prescription.repository.js
const { Prescription, User } = require("../models");

class PrescriptionRepository {
  async create(prescriptionData) {
    return await Prescription.create(prescriptionData);
  }

  async findById(id) {
    return await Prescription.findByPk(id, {
      include: [
        {
          model: User,
          as: "doctor",
          attributes: ["id", "username", "email"]
        }
      ]
    });
  }

  async findAllPending() {
    return await Prescription.findAll({
      where: { status: "pending" },
      include: [
        {
          model: User,
          as: "doctor",
          attributes: ["id", "username"]
        }
      ],
      order: [["issuedAt", "DESC"]]
    });
  }

  async updateStatus(id, status) {
    const prescription = await Prescription.findByPk(id);
    if (!prescription) return null;
    return await prescription.update({ status });
  }

  // ✅ Search by name/phone (for walk-ins)
  async findByCustomerInfo(name, phone) {
    const where = {};
    if (name) where.customerName = name;
    if (phone) where.customerPhone = phone;

    return await Prescription.findAll({
      where,
      include: [
        {
          model: User,
          as: "doctor",
          attributes: ["id", "username"]
        }
      ],
      order: [["issuedAt", "DESC"]]
    });
  }

 
}

module.exports = new PrescriptionRepository();