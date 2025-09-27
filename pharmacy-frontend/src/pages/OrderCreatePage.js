// src/pages/OrderCreatePage.js
import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import MedicineSearchModal from "../components/MedicineSearchModal";
import { createOrder } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReceiptIcon from '@mui/icons-material/Receipt';

export default function OrderCreatePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 👤 Capture walk-in customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

        const handleAddMedicine = (medicine) => {
      // ✅ Validate incoming medicine object
      if (!medicine || !medicine.id || typeof medicine.name !== 'string') {
        console.error("Invalid medicine selected:", medicine);
        toast.error("Invalid medicine data");
        return;
      }

      const price = parseFloat(medicine.price);
      if (isNaN(price)) {
        toast.error(`Invalid price for ${medicine.name}`);
        return;
      }

      // ✅ Add with default quantity = 1
      setItems((prev) => [
        ...prev,
        {
          medicineId: medicine.id,
          name: medicine.name,
          price: price,
          quantity: 1,
        },
      ]);

      toast.success(`Added: ${medicine.name}`);
    };

  const handleRemoveMedicine = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };
const handleSubmit = async () => {
  if (items.length === 0) {
    setError("Please add at least one medicine");
    return;
  }

  const orderData = {
    customerName: customerName.trim() || "Walk-in Customer",
    customerPhone: customerPhone.trim() || null,
    status: "completed",
    paymentMode: "cash",
    items: items.map(item => ({
      medicineId: item.medicineId,
      quantity: item.quantity
    }))
  };

  console.log("📦 Submitting order:", orderData);
  setLoading(true);
  setError("");

  try {
    const response = await createOrder(orderData);
    console.log("✅ Order created:", response.data);

    // ✅ Fix: Extract orderId from response.data.order.id
    const order = response.data.order;
    if (!order || !order.id) {
      throw new Error("No order ID returned from server");
    }

    const orderId = order.id;

    toast.success("✅ Order created successfully!");
    navigate(`/receipt/${orderId}`);
  } catch (err) {
    console.error("❌ Create order failed:", err);

    if (err.response) {
      console.error("Response ", err.response.data);
      setError(`API Error: ${err.response.data.message || "Unknown error"}`);
    } else if (err.request) {
      setError("Network error: Check connection or server");
    } else {
      setError(err.message);
    }

    toast.error("❌ Failed to create order");
  } finally {
    setLoading(false);
  }
};

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
     
      <Typography variant="h4" gutterBottom >
         <ReceiptIcon color="primary" fontSize="large" />
        Create New Order
      </Typography>

      {/* 👤 Walk-in Customer Info */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Customer Details (Optional)
        </Typography>
        <TextField
          label="Customer Name"
          fullWidth
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g., John Doe"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Customer Phone"
          fullWidth
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="e.g., +251912345678"
        />
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
          disabled={loading}
        >
          Add Medicine
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 🧾 Order Items Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Medicine</strong></TableCell>
              <TableCell><strong>Price</strong></TableCell>
              <TableCell><strong>Quantity</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    color="error"
                    size="small"
                    onClick={() => handleRemoveMedicine(index)}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No medicines added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 💵 Total & Submit */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h6">
          Total: <strong>${calculateTotal().toFixed(2)}</strong>
        </Typography>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={handleSubmit}
          disabled={loading || items.length === 0}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Processing..." : "Complete Order"}
        </Button>
      </Box>

      {/* 🔍 Medicine Search Modal */}
      <MedicineSearchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAddMedicine={handleAddMedicine}
      />
    </Container>
  );
}