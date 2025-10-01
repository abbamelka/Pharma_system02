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

  // 👤 Walk-in customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  // ✅ Add medicine with default quantity = 1
const handleAddMedicine = (medicine) => {
  if (!medicine || !medicine.id || typeof medicine.name !== 'string') {
    toast.error("Invalid medicine data");
    return;
  }

  const price = parseFloat(medicine.price);
  if (isNaN(price)) {
    toast.error(`Invalid price for ${medicine.name}`);
    return;
  }

  setItems((prev) => [
    ...prev,
    {
      medicineId: medicine.id,
      name: medicine.name,
      price,
      quantity: 1,
    },
  ]);

  toast.success(`Added: ${medicine.name}`);
};
  // ✅ Remove medicine by index
  const handleRemoveMedicine = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Update quantity for specific item
  const handleQuantityChange = (index, newQty) => {
    if (newQty === '' || isNaN(newQty)) {
      // Allow empty input temporarily
      const updated = [...items];
      updated[index].quantity = '';
      setItems(updated);
      return;
    }

    const qty = parseInt(newQty, 10);
    if (qty < 1) return; // Prevent zero/negative

    const updated = [...items];
    updated[index].quantity = qty;
    setItems(updated);
  };

  // ✅ Calculate total
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const qty = typeof item.quantity === 'number' ? item.quantity : 0;
      return sum + item.price * qty;
    }, 0);
  };

  // ✅ Submit order
const handleSubmit = async () => {
  if (items.length === 0) {
    setError("Please add at least one medicine");
    return;
  }

  // ✅ Validate all items before submit
  for (let item of items) {
    if (!item.medicineId || !item.quantity || item.quantity < 1) {
      toast.error("All items must have valid medicine and quantity ≥ 1");
      return;
    }
  }

 const orderData = {
  customerName: customerName.trim() || "Walk-in Customer",
  customerPhone: customerPhone.trim() || null,
  status: "completed",
  paymentMode: "cash",
  items: items.map(item => {
    // ✅ Double-check during submit
    if (!item.medicineId) {
      console.error("❌ Invalid item during submit:", item);
      throw new Error(`Invalid medicine in order: missing ID for ${item.name}`);
    }
    return {
      id: item.medicineId,        // Backend expects 'id'
      quantity: Number(item.quantity)
    };
  })
};

  console.log("📦 Submitting order:", orderData); // Debug
  setLoading(true);
  setError("");

  try {
    const response = await createOrder(orderData);

    const orderId = response.data?.order?.id;
    if (!orderId) throw new Error("No order ID returned");

    toast.success("✅ Order created successfully!");
    navigate(`/receipt/${orderId}`);
  } catch (err) {
    console.error("❌ Full error:", err.response?.data);

    const message = err.response?.data?.message || err.message;

    // Show meaningful error
    if (message.includes("items is required")) {
      setError("Items are missing or invalid");
    } else if (message.includes("must be a positive integer")) {
      setError("Quantity must be a positive number");
    } else if (message.includes("Medicine not found")) {
      setError("One or more medicines are invalid or no longer available");
    } else {
      setError(message);
    }

    toast.error(`❌ ${message}`);
  } finally {
    setLoading(false);
  }
};
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <ReceiptIcon color="primary" fontSize="large" />
        <Typography variant="h4">Create New Order</Typography>
      </Box>

      {/* Customer Info */}
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

      {/* Order Items Table */}
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
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, e.target.value)}
                    inputProps={{ min: 1 }}
                    sx={{ width: 80 }}
                  />
                </TableCell>
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

      {/* Total & Submit */}
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
        >
          {loading ? "Processing..." : "Complete Order"}
        </Button>
      </Box>

      {/* Medicine Search Modal */}
      <MedicineSearchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAddMedicine={handleAddMedicine}
      />
    </Container>
  );
}