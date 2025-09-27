// services/order.service.js
const { Op } = require("sequelize");
const orderRepository = require("../repositories/order.repository");
const { Inventory, Medicine, OrderMedicine, User } = require("../models");

class OrderService {
  async validateStock(items) {
    for (const item of items) {
      const totalAvailable = await this.getTotalStockForMedicine(item.medicineId);
      if (totalAvailable < item.quantity) {
        const med = await Medicine.findByPk(item.medicineId);
        const name = med?.name || `Unknown Medicine (ID: ${item.medicineId})`;
        throw new Error(`Insufficient stock for "${name}". Available: ${totalAvailable}, Requested: ${item.quantity}`);
      }
    }
  }

  async getTotalStockForMedicine(medicineId) {
    const inventories = await Inventory.findAll({
      where: { medicineId, quantity: { [Op.gt]: 0 } }
    });
    return inventories.reduce((sum, inv) => sum + inv.quantity, 0);
  }

  async deductStock(items) {
    for (const item of items) {
      let remainingQty = item.quantity;
      const batches = await Inventory.findAll({
        where: { medicineId: item.medicineId, quantity: { [Op.gt]: 0 } },
        order: [["expiryDate", "ASC"]] // FIFO
      });

      for (const batch of batches) {
        if (remainingQty <= 0) break;

        if (batch.quantity >= remainingQty) {
          await batch.decrement("quantity", { by: remainingQty });
          remainingQty = 0;
        } else {
          remainingQty -= batch.quantity;
          await batch.update({ quantity: 0 });
        }
      }
    }
  }

  async createOrder(orderData) {
    const {
      items,
      cashierId,
      prescriptionId,
      status = "pending",
      customerName,
      customerPhone
    } = orderData;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("At least one item is required");
    }

    // Validate cashier exists
    const cashier = await User.findByPk(cashierId);
    if (!cashier) {
      throw new Error("Cashier not found");
    }

    // Validate and enrich items
    const validatedItems = [];
    let total = 0;

    for (const item of items) {
      if (!item.medicineId || !item.quantity || item.quantity < 1) {
        throw new Error(`Invalid item: medicineId=${item.medicineId}, quantity=${item.quantity}`);
      }

      const med = await Medicine.findByPk(item.medicineId);
      if (!med) {
        throw new Error(`Medicine with ID ${item.medicineId} not found`);
      }

      const unitPrice = parseFloat(med.price);
      const lineTotal = unitPrice * item.quantity;

      validatedItems.push({
        medicineId: med.id,
        quantity: item.quantity,
        unitPrice
      });

      total += lineTotal;
    }

    // Create order
    const order = await orderRepository.create({
      total: parseFloat(total.toFixed(2)),
      status,
      cashierId,
      prescriptionId,
      customerName: customerName || "Walk-in Customer",
      customerPhone: customerPhone || null
    });

    // Link medicines
    await Promise.all(
      validatedItems.map(item =>
        OrderMedicine.create({
          orderId: order.id,
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })
      )
    );

    // Deduct stock if completed
    if (status === "completed") {
      await this.validateStock(validatedItems);
      await this.deductStock(validatedItems);
    }

    // Return full order with associations
    return await orderRepository.findById(order.id, true);
  }

  async updateOrderStatus(orderId, newStatus) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (newStatus === "completed" && order.status !== "completed") {
      const items = await OrderMedicine.findAll({
        where: { orderId },
        include: [{ model: Medicine, as: "Medicine" }]
      });

      const enrichedItems = items.map(io => ({
        medicineId: io.medicineId,
        quantity: io.quantity
      }));

      await this.validateStock(enrichedItems);
      await this.deductStock(enrichedItems);
    }

    return await orderRepository.update(orderId, { status: newStatus });
  }

  async getOrderById(id) {
    return await orderRepository.findById(id, true);
  }

  async getAllOrders() {
    return await orderRepository.getAllOrders();
  }
}

module.exports = new OrderService();