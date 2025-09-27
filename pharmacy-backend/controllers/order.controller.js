// controllers/order.controller.js
const orderService = require("../services/order.service");

exports.createOrder = async (req, res) => {
  try {
    const cashierId = req.user.id; // from JWT middleware
    const { items, prescriptionId, status, customerName, customerPhone } = req.body;

    // Optional: set default name
    const finalCustomerName = customerName?.trim() || "Walk-in Customer";

    const order = await orderService.createOrder({
      items,
      cashierId,
      prescriptionId,
      status,
      customerName: finalCustomerName,
      customerPhone: customerPhone || null
    });

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