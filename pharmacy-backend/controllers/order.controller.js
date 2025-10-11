// controllers/order.controller.js
const orderService = require("../services/order.service");
const auditService = require("../services/audit.service");
const upload = require("../middleware/upload.middleware");
const path = require("path");

/**
 * @route POST /orders
 * @desc Create a new order with optional prescription photo
 */
exports.createOrder = [
  upload.single('prescriptionPhoto'),
  async (req, res) => {
    try {
      const cashierId = req.user.id;

      const { items, prescriptionId, status, customerName, customerPhone } = req.body;

      let parsedItems;
      try {
        parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid items format. Must be valid JSON."
        });
      }

      const finalCustomerName = (customerName || "").trim() || "Walk-in Customer";

      // ✅ Build relative path
      const prescriptionPhoto = req.file 
        ? `uploads/prescriptions/${req.file.filename}` 
        : null;

      console.log("📄 Prescription Photo Path:", prescriptionPhoto);

      const order = await orderService.createOrder({
        items: parsedItems,
        cashierId,
        prescriptionId: prescriptionId ? parseInt(prescriptionId) : null,
        status: status || "pending",
        customerName: finalCustomerName,
        customerPhone: customerPhone || null,
        prescriptionPhoto
      });

      // ✅ Audit log
      await auditService.log(
        "ORDER_CREATE",
        "Order",
        order.id,
        { 
          itemsCount: parsedItems.length, 
          status: order.status, 
          customerName: finalCustomerName,
          hasPrescription: !!prescriptionPhoto
        },
        req.user
      );

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        order
      });
    } catch (error) {
      console.error("🚨 FULL ORDER ERROR:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
];

/**
 * @route GET /orders/:id
 * @desc Get order by ID
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    await auditService.log(
      "ORDER_VIEW",
      "Order",
      order.id,
      { status: order.status, customerName: order.customerName },
      req.user
    );

    return res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Get order error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching order"
    });
  }
};

/**
 * @route GET /orders
 * @desc Get all orders
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();

    await auditService.log(
      "ORDER_LIST",
      "Order",
      null,
      { totalOrders: orders.length },
      req.user
    );

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Get all orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders"
    });
  }
};

/**
 * @route PATCH /orders/:id/status
 * @desc Update order status
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await orderService.updateOrderStatus(req.params.id, status);

    await auditService.log(
      "ORDER_UPDATE_STATUS",
      "Order",
      order.id,
      { newStatus: status },
      req.user
    );

    return res.json({
      success: true,
      message: "Order status updated",
      order
    });
  } catch (error) {
    console.error("Update order status error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};