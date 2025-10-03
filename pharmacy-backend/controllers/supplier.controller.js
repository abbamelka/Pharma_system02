const supplierService = require("../services/supplier.service");
const auditService = require("../services/audit.service");

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await supplierService.createSupplier(req.body);

    // ✅ Audit log
    await auditService.log(
      "SUPPLIER_CREATE",
      "Supplier",
      supplier.id,
      { name: supplier.name },
      req.user
    );

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

    // ✅ Audit log
    await auditService.log(
      "SUPPLIER_LIST",
      "Supplier",
      null,
      { count: suppliers.length },
      req.user
    );

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

    // ✅ Audit log
    await auditService.log(
      "SUPPLIER_VIEW",
      "Supplier",
      supplier.id,
      { name: supplier.name },
      req.user
    );

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

    // ✅ Audit log
    await auditService.log(
      "SUPPLIER_UPDATE",
      "Supplier",
      supplier.id,
      { updatedFields: req.body },
      req.user
    );

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

    // ✅ Audit log
    await auditService.log(
      "SUPPLIER_DELETE",
      "Supplier",
      req.params.id,
      {},
      req.user
    );

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

    // ✅ Audit log
    await auditService.log(
      "SUPPLIER_SEARCH",
      "Supplier",
      null,
      { query: name, results: suppliers.length },
      req.user
    );

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
