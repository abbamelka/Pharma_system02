// src/pages/MedicineManagementPage.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import {
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineById,
  addInventoryToMedicine,
  searchMedicines,
} from "../services/api";
import { toast } from "react-toastify";
import TableSkeleton from "../components/skeletons/TableSkeleton";

export default function MedicineManagementPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openInventoryModal, setOpenInventoryModal] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "OTC",
    barcode: "",
    manufacturer: "",
    expiryDate: "",
  });

  const [inventoryData, setInventoryData] = useState({
    batchNumber: "",
    quantity: "",
    expiryDate: "",
    purchasePrice: "",
    supplierId: "",
  });

  // Fetch all medicines
  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await getAllMedicines();
      const meds = Array.isArray(response.data?.medicines)
        ? response.data.medicines
        : [];
      setMedicines(meds);
      setError("");
    } catch (err) {
      console.error("Error fetching medicines:", err.response?.data || err.message);
      setError("Failed to load medicines");
      toast.error("Could not fetch medicines");
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // 🔍 Search Medicines
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchMedicines(); // fallback to all
      return;
    }

    setLoading(true);
    try {
      const response = await searchMedicines({ search: searchTerm });
      console.log("🔍 Search Response:", response);

      const results = response?.data?.medicines;
      if (Array.isArray(results)) {
        setMedicines(results);
        setError(results.length === 0 ? "No medicines match your search." : "");
      } else {
        setMedicines([]);
        setError("No medicines found.");
      }
    } catch (err) {
      console.error("Search failed:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        setError("Failed to search medicines. Please try again.");
      }
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key in search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // CRUD Operations
  const handleCreateMedicine = async () => {
    if (!formData.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }

    try {
      await createMedicine(formData);
      toast.success("✅ Medicine created successfully!");
      fetchMedicines();
      setOpenAddModal(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create medicine";
      console.error("Error creating medicine:", msg);
      toast.error(msg);
    }
  };

  const handleUpdateMedicine = async () => {
    if (!formData.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }

    try {
      await updateMedicine(currentMedicine.id, formData);
      toast.success("✅ Medicine updated!");
      fetchMedicines();
      setOpenEditModal(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update medicine";
      console.error("Error updating medicine:", msg);
      toast.error(msg);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?")) return;

    try {
      await deleteMedicine(id);
      toast.success("🗑️ Medicine deleted!");
      fetchMedicines();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete medicine";
      console.error("Error deleting medicine:", msg);
      toast.error(msg);
    }
  };

  const handleEditMedicine = async (medicineId) => {
    try {
      const response = await getMedicineById(medicineId);
      const medicine = response.data.medicine || response.data;

      setCurrentMedicine(medicine);
      setFormData({
        name: medicine.name,
        description: medicine.description || "",
        price: medicine.price,
        category: medicine.category,
        barcode: medicine.barcode || "",
        manufacturer: medicine.manufacturer || "",
        expiryDate: medicine.expiryDate ? medicine.expiryDate.split("T")[0] : "",
      });
      setOpenEditModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load medicine details";
      console.error("Error fetching medicine:", msg);
      toast.error(msg);
    }
  };

  const handleAddInventoryToMedicine = (medicine) => {
    setCurrentMedicine(medicine);
    setInventoryData((prev) => ({
      ...prev,
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split("T")[0] : prev.expiryDate,
    }));
    setOpenInventoryModal(true);
  };

  const handleAddInventory = async () => {
    if (!inventoryData.batchNumber.trim()) {
      toast.error("Batch number is required");
      return;
    }
    if (!inventoryData.quantity || inventoryData.quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (!inventoryData.expiryDate) {
      toast.error("Expiry date is required");
      return;
    }

    try {
      await addInventoryToMedicine(currentMedicine.id, inventoryData);
      toast.success("📦 Inventory added successfully!");
      fetchMedicines();
      setOpenInventoryModal(false);
      resetInventoryForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add inventory";
      console.error("Error adding inventory:", msg);
      toast.error(msg);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "OTC",
      barcode: "",
      manufacturer: "",
      expiryDate: "",
    });
  };

  const resetInventoryForm = () => {
    setInventoryData({
      batchNumber: "",
      quantity: "",
      expiryDate: "",
      purchasePrice: "",
      supplierId: "",
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInventoryInputChange = (e) => {
    setInventoryData({ ...inventoryData, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        💊 Medicine Management
      </Typography>

      {/* 🔍 Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search by name, barcode, or ID"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., parctamol, vitamin, 123"
          helperText="Start typing to find medicine fast"
        />
        <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            Search
          </Button>
          {searchTerm && (
            <Button
              color="secondary"
              onClick={() => {
                setSearchTerm("");
                fetchMedicines();
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* 🩺 Create New Medicine */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddModal(true)}
        >
          Create New Medicine
        </Button>
      </Box>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      {/* 📚 Medicine Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Price</strong></TableCell>
              <TableCell><strong>Barcode</strong></TableCell>
              <TableCell><strong>Expiry</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : medicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  {searchTerm ? "No medicines match your search." : "No medicines available."}
                </TableCell>
              </TableRow>
            ) : (
              medicines.map((med) => (
                <TableRow key={med.id}>
                  <TableCell>#{med.id}</TableCell>
                  <TableCell>{med.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={med.category.toUpperCase()}
                      color={
                        med.category === "prescription"
                          ? "error"
                          : med.category === "OTC"
                          ? "primary"
                          : "success"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${parseFloat(med.price).toFixed(2)}</TableCell>
                  <TableCell>{med.barcode || "N/A"}</TableCell>
                  <TableCell>
                    {med.expiryDate
                      ? new Date(med.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditMedicine(med.id)}
                        size="small"
                        title="Edit"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteMedicine(med.id)}
                        size="small"
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleAddInventoryToMedicine(med)}
                      >
                        ➕ Add Inventory
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals */}
      {/* Add Medicine Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Medicine</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
            autoFocus
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            value={formData.price}
            onChange={handleInputChange}
            required
            inputProps={{ step: "0.01", min: "0" }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleInputChange}
            >
              <MenuItem value="prescription">Prescription</MenuItem>
              <MenuItem value="OTC">OTC</MenuItem>
              <MenuItem value="supplement">Supplement</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="barcode"
            label="Barcode"
            fullWidth
            value={formData.barcode}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="manufacturer"
            label="Manufacturer"
            fullWidth
            value={formData.manufacturer}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="expiryDate"
            label="Default Expiry Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.expiryDate}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button onClick={handleCreateMedicine} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Medicine Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Medicine</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
            autoFocus
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            value={formData.price}
            onChange={handleInputChange}
            required
            inputProps={{ step: "0.01", min: "0" }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="Category"
              onChange={handleInputChange}
            >
              <MenuItem value="prescription">Prescription</MenuItem>
              <MenuItem value="OTC">OTC</MenuItem>
              <MenuItem value="supplement">Supplement</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="barcode"
            label="Barcode"
            fullWidth
            value={formData.barcode}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="manufacturer"
            label="Manufacturer"
            fullWidth
            value={formData.manufacturer}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="expiryDate"
            label="Default Expiry Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.expiryDate}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateMedicine} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Inventory Modal */}
      <Dialog open={openInventoryModal} onClose={() => setOpenInventoryModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Inventory to {currentMedicine?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            ID: #{currentMedicine?.id} | Barcode: {currentMedicine?.barcode || "N/A"}
          </Typography>
          <TextField
            margin="dense"
            name="batchNumber"
            label="Batch Number"
            fullWidth
            value={inventoryData.batchNumber}
            onChange={handleInventoryInputChange}
            required
            autoFocus
          />
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            value={inventoryData.quantity}
            onChange={handleInventoryInputChange}
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
            value={inventoryData.expiryDate}
            onChange={handleInventoryInputChange}
            required
          />
          <TextField
            margin="dense"
            name="purchasePrice"
            label="Purchase Price"
            type="number"
            fullWidth
            value={inventoryData.purchasePrice}
            onChange={handleInventoryInputChange}
            inputProps={{ step: "0.01" }}
          />
          <TextField
            margin="dense"
            name="supplierId"
            label="Supplier ID"
            type="number"
            fullWidth
            value={inventoryData.supplierId}
            onChange={handleInventoryInputChange}
            placeholder="Optional"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInventoryModal(false)}>Cancel</Button>
          <Button onClick={handleAddInventory} variant="contained" color="success">
            Add Inventory
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}