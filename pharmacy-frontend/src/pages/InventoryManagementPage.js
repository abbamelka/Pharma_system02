// src/pages/InventoryManagementPage.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import WarningIcon from "@mui/icons-material/Warning";
import DangerousIcon from "@mui/icons-material/Dangerous";

import {
  getBatchesByMedicine,
  getAllMedicines,
  addInventoryToMedicine,
  getAllSuppliers, // ← New API call
} from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function InventoryManagementPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // Store suppliers
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState(null);

  // Form data for adding inventory
  const [formData, setFormData] = useState({
    batchNumber: "",
    quantity: "",
    expiryDate: "",
    purchasePrice: "",
    supplierId: "", // Still stores ID
  });

  // Fetch medicines, suppliers, and full inventory
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all medicines
      const medicineRes = await getAllMedicines();
      const meds = Array.isArray(medicineRes.data?.medicines)
        ? medicineRes.data.medicines
        : [];

      setMedicines(meds);

      // Fetch all suppliers
      let fetchedSuppliers = [];
      try {
        const supplierRes = await getAllSuppliers();
        fetchedSuppliers = Array.isArray(supplierRes.data?.suppliers)
          ? supplierRes.data.suppliers
          : [];
      } catch (err) {
        console.warn("Failed to load suppliers:", err.message);
        toast.warning("Could not load supplier list.");
      }
      setSuppliers(fetchedSuppliers);

      // Fetch inventory batches
      const inventoryList = [];
      for (const med of meds) {
        try {
          const res = await getBatchesByMedicine(med.id);
          const batches = Array.isArray(res.data?.batches) ? res.data.batches : [];

          batches.forEach((batch) => {
            // Find supplier by ID
            const supplier = fetchedSuppliers.find(s => s.id === batch.supplierId);
            inventoryList.push({
              ...batch,
              medicineName: med.name,
              category: med.category,
              salePrice: med.price,
              supplierName: supplier?.name || "Unknown Supplier"
            });
          });
        } catch (err) {
          console.warn(`Failed to load batches for ${med.name}`, err);
        }
      }

      setInventory(inventoryList);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const filteredInventory = inventory.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.medicineName.toLowerCase().includes(term) ||
      item.batchNumber.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.supplierName.toLowerCase().includes(term)
    );
  });

  // Count alerts
  const lowStockCount = filteredInventory.filter(b => b.quantity < 5).length;
  const expiringSoonCount = filteredInventory.filter(b => {
    const expiry = new Date(b.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return expiry >= now && expiry < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }).length;

  const expiredCount = filteredInventory.filter(b => {
    const expiry = new Date(b.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    return expiry < now;
  }).length;

  // Open Add Inventory Modal
  const handleOpenAddModal = (medicine) => {
    setCurrentMedicine(medicine);
    setFormData({
      batchNumber: "",
      quantity: "",
      expiryDate: "",
      purchasePrice: "",
      supplierId: "",
    });
    setOpenAddModal(true);
  };

  const handleAddInventory = async () => {
    if (!formData.batchNumber.trim()) {
      toast.error("Batch number is required");
      return;
    }
    if (!formData.quantity || formData.quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (!formData.expiryDate) {
      toast.error("Expiry date is required");
      return;
    }

    try {
      await addInventoryToMedicine(currentMedicine.id, formData);
      toast.success(`✅ Added to ${currentMedicine.name}`);
      setOpenAddModal(false);
      fetchInventoryData(); // Refresh list
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add inventory";
      toast.error(msg);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        � Inventory Management
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Track all medicine batches, expiry dates, stock levels, and suppliers
      </Typography>

      {/* � Search Bar */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="Search by Medicine, Batch, Category, or Supplier"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            placeholder="e.g., paracetamol, 013, OTC, PharmaCorp"
          />
        </Box>
      </Paper>

      {/* ⚠️ Low Stock & Expiring Soon Summary */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Chip
          icon={<WarningIcon />}
          label={`${lowStockCount} Low Stock`}
          color="warning"
          size="small"
        />
        <Chip
          icon={<DangerousIcon />}
          label={`${expiringSoonCount} Expiring Soon`}
          color="warning"
          size="small"
        />
        <Chip
          icon={<DangerousIcon />}
          label={`${expiredCount} Expired`}
          color="error"
          size="small"
        />
      </Box>

      {/* Inventory Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Medicine</strong></TableCell>
              <TableCell><strong>Batch</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Stock</strong></TableCell>
              <TableCell><strong>Purchase Price</strong></TableCell>
              <TableCell><strong>Sale Price</strong></TableCell>
              <TableCell><strong>Expiry</strong></TableCell>
              <TableCell><strong>Supplier</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ color: 'text.secondary' }}>
                  No inventory matches your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => {
                const expiryDate = new Date(item.expiryDate);
                expiryDate.setHours(0, 0, 0, 0);

                const isLowStock = item.quantity < 5;
                const isExpiringSoon = expiryDate >= now && expiryDate < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                const isExpired = expiryDate < now;

                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.medicineName}</TableCell>
                    <TableCell>{item.batchNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.category.toUpperCase()}
                        size="small"
                        color={
                          item.category === "prescription"
                            ? "error"
                            : item.category === "OTC"
                            ? "primary"
                            : "success"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.quantity}
                        color={isLowStock ? "error" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${parseFloat(item.purchasePrice).toFixed(2)}</TableCell>
                    <TableCell>${parseFloat(item.salePrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Tooltip title={new Date(item.expiryDate).toLocaleDateString()}>
                        <Chip
                          label={
                            isExpired 
                              ? "� Expired" 
                              : isExpiringSoon 
                                ? "⚠️ Soon" 
                                : "✅ OK"
                          }
                          color={isExpired ? "error" : isExpiringSoon ? "warning" : "success"}
                          size="small"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>{item.supplierName}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenAddModal({ id: item.medicineId, name: item.medicineName })}
                      >
                        ➕ Add More
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Inventory Modal */}
      {openAddModal && (
        <AddInventoryModal
          medicine={currentMedicine}
          formData={formData}
          suppliers={suppliers}
          handleChange={handleChange}
          handleSubmit={handleAddInventory}
          handleClose={() => setOpenAddModal(false)}
        />
      )}
    </Container>
  );
}

// ✅ Enhanced Modal with Supplier Dropdown
function AddInventoryModal({ medicine, formData, suppliers, handleChange, handleSubmit, handleClose }) {
  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Inventory: {medicine?.name}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 2 }}>
          <TextField
            margin="dense"
            name="batchNumber"
            label="Batch Number"
            fullWidth
            value={formData.batchNumber}
            onChange={handleChange}
            autoFocus
            required
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            value={formData.quantity}
            onChange={handleChange}
            required
            inputProps={{ min: 1 }}
          />
          <TextField
            margin="dense"
            name="expiryDate"
            label="Expiry Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="purchasePrice"
            label="Purchase Price"
            type="number"
            fullWidth
            value={formData.purchasePrice}
            onChange={handleChange}
            inputProps={{ step: "0.01" }}
          />

          {/* Supplier Dropdown */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Supplier</InputLabel>
            <Select
              name="supplierId"
              value={formData.supplierId}
              label="Supplier"
              onChange={handleChange}
            >
              {suppliers.length === 0 ? (
                <MenuItem disabled>No suppliers found</MenuItem>
              ) : (
                suppliers.map((sup) => (
                  <MenuItem key={sup.id} value={sup.id}>
                    {sup.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}