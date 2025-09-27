// services/report.service.js
const sequelize = require("../models").sequelize;
const { Order, OrderMedicine, Medicine, Inventory, Prescription } = require("../models");
const { Op } = require("sequelize");

class ReportService {
  async getDailySales() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.findAll({
      where: {
        status: "completed",
        createdAt: { [Op.between]: [startOfDay, endOfDay] }
      }
    });

    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalSales: parseFloat(totalSales.toFixed(2)),
      orderCount,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2))
    };
  }

async getTopMedicines(limit = 5) {
  const topItems = await OrderMedicine.findAll({
    include: [
      { model: Medicine, as: 'Medicine' },
      { model: Order, as: 'Order', where: { status: 'completed' } }
    ],
    attributes: [
      'medicineId',
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
      [sequelize.fn('SUM', sequelize.literal('quantity * unitPrice')), 'totalRevenue']
    ],
    group: ['medicineId', 'Medicine.id'],
    order: [[sequelize.literal('totalRevenue'), 'DESC']],
    limit,
    raw: true
  });

  return topItems.map(item => ({
    medicineId: item.medicineId,
    medicineName: item['Medicine.name'],
    totalQuantity: parseInt(item.totalQuantity, 10),
    totalRevenue: parseFloat(item.totalRevenue).toFixed(2) // ✅ Convert to float first
  }));
}

  async getLowStockAlerts(threshold = 5) {
    const batches = await Inventory.findAll({
      where: { quantity: { [Op.lt]: threshold } },
      include: [
        {
          model: Medicine,
          as: "Medicine",
          attributes: ["id", "name", "category"]
        }
      ],
      order: [["quantity", "ASC"]]
    });

    return batches.map(batch => ({
      batchId: batch.id,
      medicineName: batch.Medicine.name,
      category: batch.Medicine.category,
      batchNumber: batch.batchNumber,
      currentStock: batch.quantity,
      expiryDate: batch.expiryDate
    }));
  }

  async getExpiringSoonAlerts(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    const batches = await Inventory.findAll({
      where: { expiryDate: { [Op.lte]: cutoffDate } },
      include: [
        {
          model: Medicine,
          as: "Medicine",
          attributes: ["id", "name"]
        }
      ],
      order: [["expiryDate", "ASC"]]
    });

    return batches.map(batch => ({
      batchId: batch.id,
      medicineName: batch.Medicine.name,
      batchNumber: batch.batchNumber,
      currentStock: batch.quantity,
      expiryDate: batch.expiryDate
    }));
  }

  async getPrescriptionFulfillmentRate() {
    const total = await Prescription.count();
    const fulfilled = await Prescription.count({ where: { status: "fulfilled" } });
    const cancelled = await Prescription.count({ where: { status: "cancelled" } });
    const pending = await Prescription.count({ where: { status: "pending" } });

    const fulfillmentRate = total > 0 ? parseFloat(((fulfilled / total) * 100).toFixed(2)) : 0;

    return {
      totalPrescriptions: total,
      fulfilled,
      cancelled,
      pending,
      fulfillmentRate: `${fulfillmentRate}%`
    };
  }

  async getRevenueByCategory() {
    const result = await OrderMedicine.findAll({
      attributes: [
        [sequelize.col("Medicine.category"), "category"],
        [sequelize.fn("SUM", sequelize.literal("quantity * unitPrice")), "revenue"]
      ],
      include: [
        {
          model: Medicine,
          as: "Medicine",
          attributes: []
        },
        {
          model: Order,
          as: "Order",
          required: true,
          where: { status: "completed" }
        }
      ],
      group: ["Medicine.category"],
      order: [[sequelize.literal("revenue"), "DESC"]]
    });

    return result.map(item => ({
      category: item.get("category"),
      revenue: parseFloat(item.get("revenue").toFixed(2))
    }));
  }
}

module.exports = new ReportService();
