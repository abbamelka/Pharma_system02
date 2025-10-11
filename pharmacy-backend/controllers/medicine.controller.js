// controllers/medicine.controller.js
const medicineService = require("../services/medicine.service");
const { Medicine, Inventory } = require("../models");
const auditService = require("../services/audit.service");

exports.createMedicine = async (req, res) => {
  try {
    const medicine = await medicineService.createMedicine(req.body);

    await auditService.log(
      "MEDICINE_CREATE",
      "Medicine",
      medicine.id,
      { 
        name: medicine.name, 
        category: medicine.category, 
        price: medicine.price,
        requiresPrescription: !!medicine.requiresPrescription 
      },
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Medicine created successfully",
      medicine: medicine.get({ plain: true }) // ✅ Ensure full object with all fields
    });
  } catch (error) {
    console.error("Create medicine error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await medicineService.getAllMedicines();

    return res.json({
      success: true,
      medicines: medicines.map(med => med.get({ plain: true })) // ✅ Include all fields
    });
  } catch (error) {
    console.error("Get all medicines error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicines"
    });
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findByPk(req.params.id, {
      include: [
        {
          model: Inventory,
          as: "Inventory",
          attributes: ["id", "batchNumber", "quantity", "expiryDate", "purchasePrice", "supplierId"]
        }
      ]
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    await auditService.log(
      "MEDICINE_VIEW",
      "Medicine",
      medicine.id,
      { name: medicine.name, requiresPrescription: !!medicine.requiresPrescription },
      req.user
    );

    return res.json({
      success: true,
      medicine: medicine.get({ plain: true })
    });
  } catch (error) {
    console.error("Error fetching medicine:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching medicine"
    });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await medicineService.updateMedicine(req.params.id, req.body);

    await auditService.log(
      "MEDICINE_UPDATE",
      "Medicine",
      medicine.id,
      {
        name: medicine.name,
        changes: req.body,
        updatedFields: Object.keys(req.body)
      },
      req.user
    );

    return res.json({
      success: true,
      message: "Medicine updated",
      medicine: medicine.get({ plain: true })
    });
  } catch (error) {
    console.error("Update medicine error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await medicineService.getMedicineById(req.params.id);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    await medicineService.deleteMedicine(req.params.id);

    await auditService.log(
      "MEDICINE_DELETE",
      "Medicine",
      medicine.id,
      { 
        name: medicine.name, 
        category: medicine.category, 
        requiresPrescription: !!medicine.requiresPrescription 
      },
      req.user
    );

    return res.json({
      success: true,
      message: "Medicine deleted"
    });
  } catch (error) {
    console.error("Delete medicine error:", error.message);
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.addInventory = async (req, res) => {
  try {
    const inventory = await medicineService.addInventory(req.params.medicineId, req.body);

    await auditService.log(
      "INVENTORY_ADD",
      "Inventory",
      inventory.id,
      {
        medicineId: req.params.medicineId,
        medicineName: inventory.Medicine?.name,
        batchNumber: req.body.batchNumber,
        quantity: req.body.quantity,
        expiryDate: req.body.expiryDate,
        purchasePrice: req.body.purchasePrice
      },
      req.user
    );

    return res.status(201).json({
      success: true,
      inventory: inventory.get({ plain: true })
    });
  } catch (error) {
    console.error("Add inventory error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const items = await medicineService.getLowStockMedicines(threshold);

    await auditService.log(
      "VIEW_LOW_STOCK",
      "Medicine",
      null,
      { threshold, itemCount: items.length },
      req.user
    );

    return res.json({
      success: true,
      items: Array.isArray(items) ? items : []
    });
  } catch (error) {
    console.error("Get low stock error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getExpiringSoon = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const items = await medicineService.getExpiringSoonMedicines(days);

    await auditService.log(
      "VIEW_EXPIRING_SOON",
      "Medicine",
      null,
      { days, itemCount: items.length },
      req.user
    );

    return res.json({
      success: true,
      items: Array.isArray(items) ? items : []
    });
  } catch (error) {
    console.error("Get expiring soon error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 🔍 Search Medicines
exports.searchMedicines = async (req, res) => {
  try {
    const { search, category, barcode, inStock, requiresPrescription } = req.query;

    const filters = {
      search: search || '',
      category: category || '',
      barcode: barcode || '',
      inStock,
      requiresPrescription,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await medicineService.searchMedicines(filters);

    await auditService.log(
      "MEDICINE_SEARCH",
      "Medicine",
      null,
      { query: search, results: result.rows.length, filters },
      req.user
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    return res.json({
      success: true,
      medicines: result.rows.map(med => med.get({ plain: true })),
      pagination: {
        currentPage: filters.page,
        totalPages: Math.ceil(result.count / filters.limit),
        totalItems: result.count
      }
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "Error searching medicines"
    });
  }
};