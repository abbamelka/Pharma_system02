// src/pages/SupplierManagementPage.js
import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { 
  getAllSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier,
  getSupplierById,
  searchSuppliers
} from "../services/api";
import { toast } from "react-toastify";

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contact: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSuppliers = async () => {
    try {
      const response = await getAllSuppliers();
      setSuppliers(response.data.suppliers || []); // <-- FIXED
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async () => {
    try {
      await createSupplier(formData);
      toast.success("Supplier created successfully!");
      fetchSuppliers();
      setOpenAddModal(false);
      resetForm();
    } catch (err) {
      console.error("Error creating supplier:", err);
      toast.error("Failed to create supplier");
    }
  };

  const handleUpdateSupplier = async () => {
    try {
      await updateSupplier(currentSupplier.id, formData);
      toast.success("Supplier updated successfully!");
      fetchSuppliers();
      setOpenEditModal(false);
      resetForm();
    } catch (err) {
      console.error("Error updating supplier:", err);
      toast.error("Failed to update supplier");
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;

    try {
      await deleteSupplier(id);
      toast.success("Supplier deleted successfully!");
      fetchSuppliers();
    } catch (err) {
      console.error("Error deleting supplier:", err);
      toast.error("Failed to delete supplier");
    }
  };

  const handleEditSupplier = async (supplierId) => {
    try {
      const response = await getSupplierById(supplierId);
      const supplier = response.data.supplier; // <-- FIXED for single supplier
      setCurrentSupplier(supplier);
      setFormData({
        name: supplier.name,
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        contact: supplier.contact || ""
      });
      setOpenEditModal(true);
    } catch (err) {
      console.error("Error fetching supplier:", err);
      toast.error("Failed to load supplier details");
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchSuppliers();
      return;
    }

    try {
      const response = await searchSuppliers(searchTerm);
      setSuppliers(response.data.suppliers || []); // <-- FIXED
    } catch (err) {
      console.error("Error searching suppliers:", err);
      setError("Failed to search suppliers");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contact: ""
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        👷‍♂️📦Supplier Management
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            sx={{ flexGrow: 1, minWidth: 300 }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{ height: 56 }}
          >
            Search
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddModal(true)}
            sx={{ height: 56 }}
          >
            Create Supplier
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.id}</TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.email || "N/A"}</TableCell>
                <TableCell>{supplier.phone || "N/A"}</TableCell>
                <TableCell>{supplier.contact || "N/A"}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditSupplier(supplier.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {suppliers.length === 0 && !loading && (
        <Typography align="center" color="textSecondary" sx={{ mt: 4 }}>
          No suppliers found. {searchTerm ? "Try a different search term." : "Create a new supplier to get started."}
        </Typography>
      )}

      {/* Create Supplier Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Supplier</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Supplier Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email (Optional)"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone (Optional)"
            type="text"
            fullWidth
            value={formData.phone}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.address}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="contact"
            label="Contact Person (Optional)"
            type="text"
            fullWidth
            value={formData.contact}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button onClick={handleCreateSupplier} variant="contained">
            Create Supplier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Supplier Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Supplier</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Supplier Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email (Optional)"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone (Optional)"
            type="text"
            fullWidth
            value={formData.phone}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address (Optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.address}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="contact"
            label="Contact Person (Optional)"
            type="text"
            fullWidth
            value={formData.contact}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateSupplier} variant="contained">
            Update Supplier
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
