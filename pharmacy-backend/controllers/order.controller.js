const orderService = require("../services/order.service");
const auditService = require("../services/audit.service");

exports.createOrder = async (req, res) => {
  try {
    const cashierId = req.user.id; // from JWT middleware
    const { items, prescriptionId, status, customerName, customerPhone } = req.body;

    const finalCustomerName = customerName?.trim() || "Walk-in Customer";

    const order = await orderService.createOrder({
      items,
      cashierId,
      prescriptionId,
      status,
      customerName: finalCustomerName,
      customerPhone: customerPhone || null
    });

    // ✅ Audit log
    await auditService.log(
      "ORDER_CREATE",
      "Order",
      order.id,
      { itemsCount: items.length, status, customerName: finalCustomerName },
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order
    });
  } catch (error) {
    console.error("Create order error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // ✅ Audit log
    await auditService.log(
      "ORDER_VIEW",
      "Order",
      order.id,
      { status: order.status, customerName: order.customerName },
      req.user
    );

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order"
    });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();

    // ✅ Audit log
    await auditService.log(
      "ORDER_LIST",
      "Order",
      null,
      { totalOrders: orders.length },
      req.user
    );

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders"
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);

    // ✅ Audit log
    await auditService.log(
      "ORDER_UPDATE_STATUS",
      "Order",
      order.id,
      { newStatus: status },
      req.user
    );

    res.json({
      success: true,
      message: "Order status updated",
      order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
