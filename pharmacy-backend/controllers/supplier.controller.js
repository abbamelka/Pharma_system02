// controllers/supplier.controller.js
const supplierService = require("../services/supplier.service");

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
       supplier
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await supplierService.getAllSuppliers();
    res.json({
      success: true,
       suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching suppliers"
    });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await supplierService.getSupplierById(req.params.id);
    res.json({
      success: true,
       supplier
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    res.json({
      success: true,
      message: "Supplier updated successfully",
       supplier
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    await supplierService.deleteSupplier(req.params.id);
    res.json({
      success: true,
      message: "Supplier deleted successfully"
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

exports.searchSuppliers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Search term 'name' is required"
      });
    }
    const suppliers = await supplierService.searchSuppliers(name);
    res.json({
      success: true,
       suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching suppliers"
    });
  }
};