// controllers/receipt.controller.js
const receiptService = require("../services/receipt.service");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * /receipts/{id}:
 *   get:
 *     summary: Generate receipt for an order
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Receipt generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 receipt:
 *                   $ref: '#/components/schemas/Receipt'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
exports.generateReceipt = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id); // ✅ Use 'id' from URL

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const receipt = await receiptService.generateReceipt(orderId);

    res.json({
      success: true,
      receipt
    });
  } catch (error) {
    console.error("Error generating receipt:", error.message);
    res.status(404).json({
      success: false,
      message: error.message || "Order not found"
    });
  }
};

/**
 * @swagger
 * /receipts/{id}/download:
 *   get:
 *     summary: Download receipt as plain text file
 *     tags: [Receipts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Text file downloaded
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Order not found
 */
exports.downloadReceipt = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const receipt = await receiptService.generateReceipt(orderId);

    // Format as plain text
    let text = `=== ${receipt.pharmacy.name} ===\n`;
    text += `${receipt.pharmacy.address}\n`;
    text += `Phone: ${receipt.pharmacy.phone}\n\n`;

    text += `Receipt ID: ${receipt.receiptId}\n`;
    text += `Date: ${new Date(receipt.date).toLocaleString()}\n`;
    text += `Order ID: ${receipt.orderId}\n`;
    text += `Status: ${receipt.status}\n\n`;

    // ✅ Customer: only name and phone (no ID)
    text += `Customer: ${receipt.customer.name}\n`;
    if (receipt.customer.phone) {
      text += `Phone: ${receipt.customer.phone}\n`;
    }
    text += `Cashier: ${receipt.cashier.name}\n\n`;

    text += `Items:\n`;
    receipt.items.forEach(item => {
      text += `- ${item.name} ×${item.quantity} @ $${item.unitPrice} = $${item.total}\n`;
    });

    text += `\nSubtotal: $${receipt.subtotal}\n`;
    text += `Tax (5%): $${receipt.tax}\n`;
    text += `TOTAL: $${receipt.total}\n\n`;

    if (receipt.prescription) {
      text += `Prescription ID: ${receipt.prescription.id}\n`;
      if (receipt.prescription.details) {
        text += `Details: ${receipt.prescription.details}\n`;
      }
    }

    text += `\nThank you for your business! ❤️`;

    // Set headers for download
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${receipt.receiptId}.txt`);
    res.send(text);
  } catch (error) {
    console.error("Download receipt error:", error.message);
    res.status(404).json({
      success: false,
      message: error.message || "Order not found"
    });
  }
};