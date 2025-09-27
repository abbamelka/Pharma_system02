// repositories/order.repository.js
const { Order, OrderMedicine, Medicine, Inventory } = require("../models");

class OrderRepository {
  async create(orderData) {
    return await Order.create(orderData);
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
        { model: OrderMedicine, as: "OrderMedicines" }
      ]
    });
  }
}

module.exports = new OrderRepository();