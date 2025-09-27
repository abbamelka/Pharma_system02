// src/pages/ReceiptPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { generateReceipt } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { generatePDFReceipt } from "../utils/pdfReceiptGenerator"; // � Import PDF generator

export default function ReceiptPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

// src/pages/ReceiptPage.js
useEffect(() => {
  const fetchReceipt = async () => {
    if (!orderId) {
      setError("Order ID missing");
      setLoading(false);
      return;
    }

    try {
      console.log(`Fetching receipt for order ID: ${orderId}`);
      const response = await generateReceipt(orderId);
      console.log("📦 Receipt response:", response.data);

      // ✅ Fix: Use .receipt, not .data
      const receiptData = response.data.receipt;

      if (!receiptData || !receiptData.orderId) {
        throw new Error("Invalid receipt structure");
      }

      setReceipt(receiptData);
    } catch (err) {
      console.error("Failed to load receipt:", err);

      if (err.response?.status === 404) {
        setError("Receipt not found. Order may not exist.");
      } else if (err.request) {
        setError("Network error: Unable to reach server");
      } else {
        setError(err.message || "Failed to load receipt");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchReceipt();
}, [orderId]);

  const handleDownloadPDF = () => {
    if (!receipt) return;

    try {
      const pdf = generatePDFReceipt(receipt);
      pdf.save(`receipt-${receipt.receiptId}.pdf`);
      toast.success("Receipt downloaded successfully!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to generate PDF receipt");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate("/orders/create")} sx={{ mt: 2 }}>
          Create New Order
        </Button>
      </Container>
    );
  }

  if (!receipt) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">No receipt data available</Alert>
        <Button onClick={() => navigate("/orders/create")} sx={{ mt: 2 }}>
          Create New Order
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {receipt.pharmacy.name}
        </Typography>
        <Typography align="center" color="textSecondary" gutterBottom>
          {receipt.pharmacy.address}
        </Typography>
        <Typography align="center" color="textSecondary" gutterBottom>
          Phone: {receipt.pharmacy.phone}
        </Typography>

        <Box sx={{ my: 3, p: 2, border: "1px dashed #ccc", borderRadius: 1 }}>
          <Typography variant="h6">Receipt ID: {receipt.receiptId}</Typography>
          <Typography>Date: {new Date(receipt.date).toLocaleString()}</Typography>
          <Typography>Order ID: {receipt.orderId}</Typography>
          <Typography>Status: {receipt.status}</Typography>
        </Box>

        <Typography variant="h6" gutterBottom>
          Customer: {receipt.customer.name}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          ID: {receipt.customer.id}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Cashier: {receipt.cashier.name}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Items
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Medicine</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipt.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.unitPrice}</TableCell>
                  <TableCell>${item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, p: 2, backgroundColor: "#f5f5f5" }}>
          <Typography variant="h6">Subtotal: ${receipt.subtotal}</Typography>
          <Typography>Tax (5%): ${receipt.tax}</Typography>
          <Typography variant="h5">TOTAL: ${receipt.total}</Typography>
        </Box>

        {receipt.prescription && (
          <Box sx={{ mt: 3, p: 2, border: "1px solid #eee", borderRadius: 1 }}>
            <Typography variant="h6">Prescription</Typography>
            <Typography>ID: {receipt.prescription.id}</Typography>
            <Typography>Details: {receipt.prescription.details}</Typography>
          </Box>
        )}

        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadPDF} // � Download PDF
          >
            Download Receipt (PDF)
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/orders/create")}
          >
            Create New Order
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}