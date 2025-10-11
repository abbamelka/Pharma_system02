// repositories/order.repository.js
const { Order, OrderMedicine, Medicine, Inventory } = require("../models");

class OrderRepository {
  async create(orderData) {
    console.log("📦 OrderRepository.create() input:", orderData); // DEBUG
    try {
      const order = await Order.create(orderData);
      console.log("✅ Order created:", order.toJSON());
      return order;
    } catch (error) {
      console.error("❌ Order creation failed:", error.name, error.message);
      throw error;
    }
  }

  async findById(id, includeDetails = false) {
    const options = { where: { id } };
    if (includeDetails) {
      options.include = [
        {
          model: OrderMedicine,
          as: "OrderMedicines",
          include: [{ model: Medicine, as: "Medicine" }]
        }
      ];
    }
    return await Order.findByPk(id, options);
  }

  async update(id, updateData) {
    const order = await Order.findByPk(id);
    if (!order) return null;
    return await order.update(updateData);
  }

  async delete(id) {
    const order = await Order.findByPk(id);
    if (!order) return null;
    await order.destroy();
    return order;
  }

  async getAllOrders() {
    return await Order.findAll({
      include: [
        { 
          model: OrderMedicine, 
          as: "OrderMedicines",
          include: [{ model: Medicine, as: "Medicine" }] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new OrderRepository();