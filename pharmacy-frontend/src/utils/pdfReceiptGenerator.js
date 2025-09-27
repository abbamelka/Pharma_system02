// src/utils/pdfReceiptGenerator.js
import jsPDF from "jspdf";

export function generatePDFReceipt(receiptData) {
  const doc = new jsPDF();

  // Pharmacy Header
  doc.setFontSize(20);
  doc.text(receiptData.pharmacy.name, 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(receiptData.pharmacy.address, 105, 30, { align: "center" });
  doc.text(`Phone: ${receiptData.pharmacy.phone}`, 105, 37, { align: "center" });

  // Receipt Info
  doc.setFontSize(14);
  doc.text("RECEIPT", 105, 50, { align: "center" });
  doc.setFontSize(10);
  doc.text(`Receipt ID: ${receiptData.receiptId}`, 20, 60);
  doc.text(`Date: ${new Date(receiptData.date).toLocaleString()}`, 20, 65);
  doc.text(`Order ID: ${receiptData.orderId}`, 20, 70);
  doc.text(`Status: ${receiptData.status}`, 20, 75);

  // Customer & Cashier
  doc.setFontSize(12);
  doc.text("Customer:", 20, 85);
  doc.setFontSize(10);
  doc.text(`${receiptData.customer.name} (ID: ${receiptData.customer.id})`, 20, 90);

  doc.setFontSize(12);
  doc.text("Cashier:", 20, 98);
  doc.setFontSize(10);
  doc.text(receiptData.cashier.name, 20, 103);

  // Items Table Header
  doc.setFontSize(12);
  doc.text("Items:", 20, 113);
  doc.setFontSize(10);
  doc.text("Medicine", 20, 120);
  doc.text("Qty", 90, 120);
  doc.text("Price", 110, 120);
  doc.text("Total", 150, 120);
  doc.line(20, 122, 190, 122);

  // Items
  let y = 130;
  receiptData.items.forEach((item) => {
    doc.text(item.name, 20, y);
    doc.text(item.quantity.toString(), 90, y);
    doc.text(`$${item.unitPrice}`, 110, y);
    doc.text(`$${item.total}`, 150, y);
    y += 8;
  });

  // Totals
  y += 10;
  doc.line(20, y, 190, y);
  y += 8;
  doc.text(`Subtotal: $${receiptData.subtotal}`, 140, y);
  y += 6;
  doc.text(`Tax (5%): $${receiptData.tax}`, 140, y);
  y += 6;
  doc.setFontSize(12);
  doc.text(`TOTAL: $${receiptData.total}`, 140, y);

  // Prescription (if exists)
  if (receiptData.prescription) {
    y += 15;
    doc.setFontSize(12);
    doc.text("Prescription:", 20, y);
    doc.setFontSize(10);
    y += 6;
    doc.text(`ID: ${receiptData.prescription.id}`, 20, y);
    y += 6;
    doc.text(`Details: ${receiptData.prescription.details}`, 20, y);
  }

  // Footer
  y += 20;
  doc.setFontSize(8);
  doc.text("Thank you for your business!", 105, y, { align: "center" });

  return doc;
}