// src/services/prescription.service.js
const prescriptionRepo = require("../repositories/prescription.repository");
const orderService = require("./order.service");
const { User, Medicine } = require("../models");

class PrescriptionService {
  async createPrescription(data) {
    const {
      doctorId,
      customerName,
      customerPhone,
      medicines, // ← structured array from frontend
      dosage,
      frequency,
      duration,
      validUntil
    } = data;

    // Validate doctor
    const doctor = await User.findByPk(doctorId);
    if (!doctor || doctor.role !== "doctor") throw new Error("Doctor not found or invalid role");

    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      throw new Error("Patient name is required");
    }

    if (!Array.isArray(medicines) || medicines.length === 0) {
      throw new Error("At least one medicine must be selected");
    }

    // Validate each medicine exists
    const medicineIds = medicines.map(m => m.medicineId);
    const foundMedicines = await Medicine.findAll({
      where: { id: medicineIds },
      attributes: ['id', 'name', 'price']
    });

    const medicineMap = {};
    foundMedicines.forEach(med => {
      medicineMap[med.id] = med;
    });

    // Build human-readable string: "Paracetamol x2, Amoxicillin x1"
    const detailsText = medicines
      .map(item => {
        const med = medicineMap[item.medicineId];
        if (!med) throw new Error(`Medicine with ID ${item.medicineId} not found`);
        if (!item.quantity || item.quantity <= 0) throw new Error("Quantity must be positive");
        return `${med.name} x${item.quantity}`;
      })
      .join(", ");

    // Save structured + readable
    return await prescriptionRepo.create({
      doctorId,
      customerName: customerName.trim(),
      customerPhone: customerPhone?.trim() || null,
      details: detailsText, // Human-readable
      medicines,           // Structured JSON (optional)
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

    if (prescription.status !== "pending") {
      throw new Error("Only pending prescriptions can be fulfilled");
    }

    if (prescription.validUntil && new Date() > new Date(prescription.validUntil)) {
      throw new Error("Prescription has expired");
    }

    const items = this.parseMedicinesFromDetails(prescription.details);

    if (items.length === 0) {
      throw new Error("No valid medicines found in prescription");
    }

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
    // Case 1: Already an array [{ medicineId, quantity }]
    if (Array.isArray(details)) {
      return details.map(item => ({
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: item.unitPrice || 0
      }));
    }

    // Case 2: String like "Paracetamol x2, Amoxicillin x1"
    if (typeof details === 'string') {
      const regex = /([^,]+?)\s*x(\d+)/g;
      const items = [];
      let match;

      while ((match = regex.exec(details)) !== null) {
        const namePart = match[1].trim();
        const quantity = parseInt(match[2]);

        // Extract ID if embedded: "Paracetamol (ID:3)"
        const idMatch = namePart.match(/\(ID:(\d+)\)/);
        const medicineId = idMatch ? parseInt(idMatch[1]) : null;

        if (medicineId && quantity > 0) {
          items.push({ medicineId, quantity });
        }
      }

      if (items.length > 0) return items;
    }

    // Case 3: Try parsing JSON string
    try {
      const parsed = JSON.parse(details);
      if (Array.isArray(parsed)) {
        return parsed.map(m => ({
          medicineId: m.medicineId,
          quantity: m.quantity
        }));
      }
    } catch (e) {
      console.warn("Failed to parse details as JSON:", e);
    }

    throw new Error("Prescription details are empty or invalid");
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
    if (!customerName && !customerPhone) return [];
    return await prescriptionRepo.findByCustomerInfo(customerName, customerPhone);
  }
}

module.exports = new PrescriptionService();