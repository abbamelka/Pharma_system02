// controllers/medicine.controller.js
const medicineService = require("../services/medicine.service");
const { Medicine,Inventory } = require("../models"); 
exports.createMedicine = async (req, res) => {
  try {
    const medicine = await medicineService.createMedicine(req.body);
    // ✅ Log creation
    await auditService.log(
      "MEDICINE_CREATE",
      "Medicine",
      medicine.id,
      { name: medicine.name, category: medicine.category },
      req.user
    );
    res.status(201).json({
      success: true,
      message: "Medicine created successfully",
       medicine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await medicineService.getAllMedicines();
    res.json({
      success: true,
       medicines
    });
  } catch (error) {
    res.status(500).json({
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
          as: 'Inventory',
          attributes: ['id', 'batchNumber', 'quantity', 'expiryDate', 'purchasePrice', 'supplierId']
        }
      ]
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    res.json({
      success: true,
      medicine
    });
  } catch (error) {
    console.error("Error fetching medicine:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching medicine"
    });
  }

};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await medicineService.updateMedicine(req.params.id, req.body);
    res.json({
      success: true,
      message: "Medicine updated",
       medicine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    await medicineService.deleteMedicine(req.params.id);
    res.json({
      success: true,
      message: "Medicine deleted"
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.addInventory = async (req, res) => {
  try {
    const inventory = await medicineService.addInventory(req.params.medicineId, req.body);
    res.status(201).json({
      success: true,
       inventory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const items = await medicineService.getLowStockMedicines(threshold);
    res.json({
      success: true,
       items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getExpiringSoon = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const items = await medicineService.getExpiringSoonMedicines(days);
    res.json({
      success: true,
       items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

  // 🔍 New: Search Medicines
 exports.searchMedicines = async (req, res) => {
  try {
    const name = req.query.search || "";

    const medicines = await medicineService.searchMedicinesByName(name);

    if (!medicines || medicines.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.json({
      success: true,
      medicines,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching medicines",
    });
  }
};
