// services/prescription.service.js
const prescriptionRepo = require("../repositories/prescription.repository");
const orderService = require("./order.service"); // ← instance, not class
const { User } = require("../models");

class PrescriptionService {
  async createPrescription(data) {
    const { doctorId, customerName, customerPhone, details, dosage, frequency, duration, validUntil } = data;

    // Validate doctor exists and is actually a doctor
    const doctor = await User.findByPk(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      throw new Error("Doctor not found or invalid role");
    }

    // Validate required fields
    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      throw new Error("Patient name is required");
    }

    if (!details || typeof details !== 'string') {
      throw new Error("Prescription details are required and must be a string");
    }

    const trimmedDetails = details.trim();
    if (trimmedDetails === "") {
      throw new Error("Prescription details cannot be empty");
    }

    // Validate format early
    try {
      this.parseMedicinesFromDetails(trimmedDetails);
    } catch (err) {
      throw new Error(`Invalid prescription format: ${err.message}`);
    }

    return await prescriptionRepo.create({
      doctorId,
      customerName: customerName.trim(),
      customerPhone: customerPhone?.trim() || null,
      details: trimmedDetails,
      dosage: dosage?.trim() || "As directed",
      frequency: frequency?.trim() || "Once daily",
      duration: duration?.trim() || "7 days",
      validUntil: validUntil ? new Date(validUntil) : null,
      status: "pending"
    });
  }

  async fulfillPrescription(prescriptionId, cashierId) {
    const prescription = await prescriptionRepo.findById(prescriptionId);
    if (!prescription) throw new Error("Prescription not found");

    console.log("📄 Fulfilling Prescription:", {
      id: prescription.id,
      status: prescription.status,
      validUntil: prescription.validUntil,
      details: prescription.details,
      customerName: prescription.customerName
    });

    if (prescription.status !== "pending") {
      throw new Error("Prescription already processed");
    }

    if (prescription.validUntil && new Date() > new Date(prescription.validUntil)) {
      throw new Error("Prescription has expired");
    }

    const items = this.parseMedicinesFromDetails(prescription.details);

    const order = await orderService.createOrder({
      items,
      customerName: prescription.customerName,
      customerPhone: prescription.customerPhone,
      cashierId,
      prescriptionId: prescription.id,
      status: "completed"
    });

    await prescriptionRepo.updateStatus(prescriptionId, "fulfilled");

    return { prescription, order };
  }

  parseMedicinesFromDetails(details) {
    try {
      if (!details || typeof details !== 'string') {
        throw new Error("Prescription details must be a non-empty string");
      }

      const trimmed = details.trim();
      if (trimmed === "") {
        throw new Error("Prescription details are empty");
      }

      return trimmed.split(",").map(itemStr => {
        const item = itemStr.trim();
        if (!item) return null;

        const parts = item.split(":").map(p => p.trim());
        if (parts.length !== 2) {
          throw new Error(`Invalid pair format: '${item}' — expected 'medicineId:quantity'`);
        }

        const [idStr, qtyStr] = parts;
        const medicineId = parseInt(idStr, 10);
        const quantity = parseInt(qtyStr, 10);

        if (isNaN(medicineId) || medicineId <= 0) {
          throw new Error(`Invalid medicine ID: '${idStr}'`);
        }
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity: '${qtyStr}'`);
        }

        return { medicineId, quantity };
      }).filter(Boolean);
    } catch (error) {
      console.error("❌ Prescription parsing failed:", error.message);
      throw new Error(`Invalid prescription format: ${error.message}`);
    }
  }

  async getPendingPrescriptions() {
    return await prescriptionRepo.findAllPending();
  }

  async getPrescriptionById(id) {
    const prescription = await prescriptionRepo.findById(id);
    if (!prescription) throw new Error("Prescription not found");
    return prescription;
  }

  async cancelPrescription(id) {
    const prescription = await prescriptionRepo.findById(id);
    if (!prescription) throw new Error("Prescription not found");
    if (prescription.status !== "pending") {
      throw new Error("Only pending prescriptions can be cancelled");
    }
    return await prescriptionRepo.updateStatus(id, "cancelled");
  }

  async searchPrescriptions({ customerName, customerPhone }) {
    if (!customerName && !customerPhone) {
      return [];
    }
    return await prescriptionRepo.findByCustomerInfo(customerName, customerPhone);
  }

}

module.exports = new PrescriptionService();