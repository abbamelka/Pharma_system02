// services/receipt.service.js
const { Order, User, OrderMedicine, Medicine, Prescription } = require("../models");

class ReceiptService {
  async generateReceipt(orderId) {
    // 1. Get order with items
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderMedicine,
          as: "OrderMedicines",
          include: [{ model: Medicine, as: "Medicine" }]
        },
        { model: User, as: "cashier", attributes: ["username", "role"] },
        { model: Prescription, attributes: ["id", "details", "issuedAt", "validUntil"] }
      ],
      attributes: ["id", "total", "status", "customerName", "customerPhone", "createdAt"]
    });

    if (!order) throw new Error("Order not found");

    // 2. Build customer info from order fields (walk-in customer)
    const customer = {
      name: order.customerName || "Walk-in Customer",
      phone: order.customerPhone || "N/A"
    };

    // 3. Cashier (staff who processed the order)
    const cashier = order.cashier ? { name: order.cashier.username } : { name: "Unknown Staff" };

    // 4. Format items
    const items = order.OrderMedicines.map(om => ({
      name: om.Medicine.name,
      quantity: om.quantity,
      unitPrice: parseFloat(om.unitPrice),
      total: parseFloat((om.quantity * om.unitPrice).toFixed(2))
    }));

    // 5. Subtotal, tax, total
    const subtotal = parseFloat(items.reduce((sum, item) => sum + item.total, 0).toFixed(2));
    const taxRate = 0.05; // 5%
    const tax = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    // 6. Prescription (if exists)
    let prescription = null;
    if (order.Prescription) {
      prescription = {
        id: order.Prescription.id,
        details: order.Prescription.details,
        issuedAt: order.Prescription.issuedAt,
        validUntil: order.Prescription.validUntil
      };
    }

    // 7. Return standardized receipt object
    return {
      pharmacy: {
        name: "City Care Pharmacy",
        address: "123 Main St, Addis Ababa",
        phone: "+251912345678"
      },
      receiptId: `RCPT-${order.id}`,
      orderId: order.id,
      date: order.createdAt,
      status: order.status,

      // 👤 Walk-in customer (not a User)
      customer: {
        name: customer.name,
        phone: customer.phone
      },

      // 💼 Cashier (real staff user)
      cashier: {
        name: cashier.name
      },

      // 🧾 Items
      items,

      // 💰 Financials
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),

      // 📄 Prescription (optional)
      prescription
    };
  }
}

module.exports = new ReceiptService();