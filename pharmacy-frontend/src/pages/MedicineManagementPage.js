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
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Grid,
  Avatar,
  InputAdornment,
  Tooltip,
  alpha,
  useTheme,
  Divider,
  Badge,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  LocalHospital,
  Inventory,
  QrCode, // Changed from Barcode to QrCode
  Business,
  CalendarToday,
  PriceChange,
  Category,
  Description,
  Refresh,
  Warning,
  Visibility,
  MedicalServices,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";

import {
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getMedicineById,
  addInventoryToMedicine,
  searchMedicines,
  getAllSuppliers
} from "../services/api";
import { toast } from "react-toastify";

export default function MedicineManagementPage() {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openInventoryModal, setOpenInventoryModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState(null);

  const theme = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "OTC",
    barcode: "",
    manufacturer: "",
    expiryDate: "",
    requiresPrescription: false,
  });

  const [inventoryData, setInventoryData] = useState({
    batchNumber: "",
    quantity: "",
    expiryDate: "",
    purchasePrice: "",
    supplierId: "",
  });

  // Statistics
  const [stats, setStats] = useState({ 
    total: 0, 
    prescription: 0, 
    otc: 0, 
    supplement: 0,
    lowStock: 0 
  });

  // Calculate statistics
  useEffect(() => {
    const total = medicines.length;
    const prescription = medicines.filter(m => m.category === "prescription").length;
    const otc = medicines.filter(m => m.category === "OTC").length;
    const supplement = medicines.filter(m => m.category === "supplement").length;
    const lowStock = medicines.filter(m => (m.totalStock || 0) < 10).length;
    
    setStats({ total, prescription, otc, supplement, lowStock });
  }, [medicines]);

  const isValidExpiryDate = (dateString) => {
    if (!dateString) return true;
    const inputDate = new Date(dateString);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 6);
    minDate.setHours(0, 0, 0, 0);
    inputDate.setHours(0, 0, 0, 0);
    return inputDate >= minDate;
  };

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

  const fetchSuppliers = async () => {
    try {
      const response = await getAllSuppliers();
      const data = response.data?.suppliers || [];
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      toast.warn("Could not load supplier list.");
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchSuppliers();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchMedicines();
      return;
    }

    setLoading(true);
    try {
      const response = await searchMedicines({ search: searchTerm });
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Filter medicines
  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = searchTerm ? 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.id.toString().includes(searchTerm)
      : true;

    const matchesCategory = categoryFilter === "all" || medicine.category === categoryFilter;
    const matchesType = typeFilter === "all" || 
      (typeFilter === "prescription" && medicine.requiresPrescription) ||
      (typeFilter === "otc" && !medicine.requiresPrescription);

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleCreateMedicine = async () => {
    if (!formData.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!isValidExpiryDate(formData.expiryDate)) {
      toast.error("Expiry date must be at least 6 days from today");
      return;
    }

    try {
      await createMedicine(formData);
      toast.success("🎉 Medicine created successfully!");
      fetchMedicines();
      setOpenAddModal(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create medicine";
      console.error("Error creating medicine:", msg);
      toast.error(`❌ ${msg}`);
    }
  };

  const handleUpdateMedicine = async () => {
    if (!formData.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    if (!isValidExpiryDate(formData.expiryDate)) {
      toast.error("Expiry date must be at least 6 days from today");
      return;
    }

    try {
      await updateMedicine(currentMedicine.id, formData);
      toast.success("✅ Medicine updated successfully!");
      fetchMedicines();
      setOpenEditModal(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update medicine";
      console.error("Error updating medicine:", msg);
      toast.error(`❌ ${msg}`);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine? This action cannot be undone.")) return;

    try {
      await deleteMedicine(id);
      toast.success("🗑️ Medicine deleted!");
      fetchMedicines();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete medicine";
      console.error("Error deleting medicine:", msg);
      toast.error(`❌ ${msg}`);
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
        requiresPrescription: !!medicine.requiresPrescription,
      });
      setOpenEditModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load medicine details";
      console.error("Error fetching medicine:", msg);
      toast.error(`❌ ${msg}`);
    }
  };

  const handleViewMedicine = async (medicineId) => {
    try {
      const response = await getMedicineById(medicineId);
      const medicine = response.data.medicine || response.data;
      setCurrentMedicine(medicine);
      setOpenViewModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load medicine details";
      toast.error(`❌ ${msg}`);
    }
  };

  const handleAddInventoryToMedicine = (medicine) => {
    setCurrentMedicine(medicine);
    setInventoryData((prev) => ({
      ...prev,
      expiryDate: medicine.expiryDate ? medicine.expiryDate.split("T")[0] : prev.expiryDate,
      supplierId: ""
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
    if (!inventoryData.supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (!isValidExpiryDate(inventoryData.expiryDate)) {
      toast.error("Expiry date must be at least 6 days from today");
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
      toast.error(`❌ ${msg}`);
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
      requiresPrescription: false,
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
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleInventoryInputChange = (e) => {
    const { name, value } = e.target;
    setInventoryData({ ...inventoryData, [name]: value });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'prescription': return 'error';
      case 'OTC': return 'success';
      case 'supplement': return 'warning';
      default: return 'default';
    }
  };

  const getStockColor = (stock) => {
    if (!stock) return 'default';
    if (stock < 10) return 'error';
    if (stock < 50) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          textAlign: "center", 
          mb: 6,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: 4,
          py: 4,
          px: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <LocalHospital sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Medicine Management
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Manage your pharmacy inventory and medicines
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 2, mx: 'auto' }}>
                <MedicalServices />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Total Medicines
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mb: 2, mx: 'auto' }}>
                <Warning />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.prescription}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Prescription
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mb: 2, mx: 'auto' }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.otc}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                OTC
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mb: 2, mx: 'auto' }}>
                <Category />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.supplement}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Supplements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mb: 2, mx: 'auto' }}>
                <Inventory />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.lowStock}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Low Stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="Search Medicines"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by name, barcode, or ID..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="prescription">Prescription</MenuItem>
                  <MenuItem value="OTC">OTC</MenuItem>
                  <MenuItem value="supplement">Supplement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="prescription">Rx Only</MenuItem>
                  <MenuItem value="otc">OTC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearch}
                  sx={{ flex: 1 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchMedicines}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={() => setOpenAddModal(true)}
                >
                  New Medicine
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={() => setError("")}>
              <Delete />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Results Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Showing {filteredMedicines.length} of {medicines.length} medicines
        </Typography>
        {(searchTerm || categoryFilter !== 'all' || typeFilter !== 'all') && (
          <Button
            color="secondary"
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setTypeFilter("all");
              fetchMedicines();
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Medicines Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell><strong>Medicine ID</strong></TableCell>
              <TableCell><strong>Name & Details</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell align="right"><strong>Price</strong></TableCell>
              <TableCell><strong>Stock</strong></TableCell>
              <TableCell><strong>Barcode</strong></TableCell>
              <TableCell><strong>Expiry</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
                    Loading medicines...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredMedicines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <MedicalServices sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No medicines found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'No medicines available. Click "New Medicine" to add one.'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredMedicines.map((medicine) => (
                <TableRow 
                  key={medicine.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                    } 
                  }}
                >
                  <TableCell>
                    <Typography fontWeight="bold" color="primary">
                      #{medicine.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography fontWeight="medium" gutterBottom>
                        {medicine.name}
                      </Typography>
                      {medicine.manufacturer && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Business sx={{ fontSize: 14 }} />
                          {medicine.manufacturer}
                        </Typography>
                      )}
                      {medicine.description && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                          {medicine.description.length > 50 
                            ? `${medicine.description.substring(0, 50)}...` 
                            : medicine.description
                          }
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {medicine.requiresPrescription ? (
                      <Chip 
                        icon={<Warning />} 
                        label="Rx Only" 
                        color="error" 
                        size="small" 
                        variant="filled"
                      />
                    ) : (
                      <Chip 
                        label="OTC" 
                        color="success" 
                        size="small" 
                        variant="filled"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={medicine.category.toUpperCase()}
                      color={getCategoryColor(medicine.category)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ${parseFloat(medicine.price).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={medicine.totalStock || 0}
                      color={getStockColor(medicine.totalStock)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    {medicine.barcode ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <QrCode color="action" /> {/* Changed from Barcode to QrCode */}
                        <Typography variant="body2">
                          {medicine.barcode}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {medicine.expiryDate ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {new Date(medicine.expiryDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleViewMedicine(medicine.id)}
                          sx={{
                            '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Medicine">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditMedicine(medicine.id)}
                          sx={{
                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Add Inventory">
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleAddInventoryToMedicine(medicine)}
                          sx={{
                            '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.1) }
                          }}
                        >
                          <Inventory />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Medicine">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          sx={{
                            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Create Medicine Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={() => setOpenAddModal(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.04)
        }}>
          <Add color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Create New Medicine
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Medicine Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalServices color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={handleInputChange}
                required
                inputProps={{ step: "0.01", min: "0" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PriceChange color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="barcode"
                label="Barcode"
                fullWidth
                value={formData.barcode}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCode color="action" /> {/* Changed from Barcode to QrCode */}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="manufacturer"
                label="Manufacturer"
                fullWidth
                value={formData.manufacturer}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="expiryDate"
                label="Default Expiry Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.expiryDate}
                onChange={handleInputChange}
                error={!isValidExpiryDate(formData.expiryDate) && formData.expiryDate !== ""}
                helperText={
                  !isValidExpiryDate(formData.expiryDate) && formData.expiryDate !== ""
                    ? "Expiry date must be at least 6 days from today"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="requiresPrescription"
                    checked={formData.requiresPrescription}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="⚠️ This medicine requires a prescription (Rx Only)"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setOpenAddModal(false)} 
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateMedicine} 
            variant="contained" 
            color="primary"
            startIcon={<CheckCircle />}
            sx={{ px: 4 }}
          >
            Create Medicine
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Edit Medicine Modal */}
      <Dialog 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.04)
        }}>
          <Edit color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Edit Medicine
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Medicine Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalServices color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="price"
                label="Price"
                type="number"
                fullWidth
                value={formData.price}
                onChange={handleInputChange}
                required
                inputProps={{ step: "0.01", min: "0" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PriceChange color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="barcode"
                label="Barcode"
                fullWidth
                value={formData.barcode}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCode color="action" /> {/* Changed from Barcode to QrCode */}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="manufacturer"
                label="Manufacturer"
                fullWidth
                value={formData.manufacturer}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="expiryDate"
                label="Default Expiry Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.expiryDate}
                onChange={handleInputChange}
                error={!isValidExpiryDate(formData.expiryDate) && formData.expiryDate !== ""}
                helperText={
                  !isValidExpiryDate(formData.expiryDate) && formData.expiryDate !== ""
                    ? "Expiry date must be at least 6 days from today"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="requiresPrescription"
                    checked={formData.requiresPrescription}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="⚠️ This medicine requires a prescription (Rx Only)"
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setOpenEditModal(false)} 
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateMedicine} 
            variant="contained" 
            color="primary"
            startIcon={<CheckCircle />}
            sx={{ px: 4 }}
          >
            Update Medicine
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Add Inventory Modal */}
      <Dialog 
        open={openInventoryModal} 
        onClose={() => setOpenInventoryModal(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: alpha(theme.palette.success.main, 0.04)
        }}>
          <Inventory color="success" />
          <Typography variant="h6" fontWeight="bold">
            Add Inventory to {currentMedicine?.name}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Medicine ID: #{currentMedicine?.id} | Barcode: {currentMedicine?.barcode || "N/A"}
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="batchNumber"
                label="Batch Number"
                fullWidth
                value={inventoryData.batchNumber}
                onChange={handleInventoryInputChange}
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                value={inventoryData.quantity}
                onChange={handleInventoryInputChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="expiryDate"
                label="Expiry Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={inventoryData.expiryDate}
                onChange={handleInventoryInputChange}
                required
                error={!isValidExpiryDate(inventoryData.expiryDate) && inventoryData.expiryDate !== ""}
                helperText={
                  !isValidExpiryDate(inventoryData.expiryDate) && inventoryData.expiryDate !== ""
                    ? "Expiry date must be at least 6 days from today"
                    : ""
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="purchasePrice"
                label="Purchase Price"
                type="number"
                fullWidth
                value={inventoryData.purchasePrice}
                onChange={handleInventoryInputChange}
                inputProps={{ step: "0.01" }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Supplier</InputLabel>
                <Select
                  name="supplierId"
                  value={inventoryData.supplierId}
                  label="Supplier"
                  onChange={handleInventoryInputChange}
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
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setOpenInventoryModal(false)} 
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddInventory} 
            variant="contained" 
            color="success"
            startIcon={<Inventory />}
            sx={{ px: 4 }}
          >
            Add Inventory
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Medicine Modal */}
      <Dialog 
        open={openViewModal} 
        onClose={() => setOpenViewModal(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: alpha(theme.palette.info.main, 0.04)
        }}>
          <Visibility color="info" />
          <Typography variant="h6" fontWeight="bold">
            Medicine Details
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {currentMedicine && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom color="primary">
                  {currentMedicine.name}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                <Chip
                  label={currentMedicine.category.toUpperCase()}
                  color={getCategoryColor(currentMedicine.category)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Type</Typography>
                {currentMedicine.requiresPrescription ? (
                  <Chip icon={<Warning />} label="Rx Only" color="error" size="small" />
                ) : (
                  <Chip label="OTC" color="success" size="small" />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${parseFloat(currentMedicine.price).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">Stock</Typography>
                <Chip
                  label={currentMedicine.totalStock || 0}
                  color={getStockColor(currentMedicine.totalStock)}
                  size="small"
                />
              </Grid>
              {currentMedicine.barcode && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Barcode</Typography>
                  <Typography variant="body1">{currentMedicine.barcode}</Typography>
                </Grid>
              )}
              {currentMedicine.manufacturer && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Manufacturer</Typography>
                  <Typography variant="body1">{currentMedicine.manufacturer}</Typography>
                </Grid>
              )}
              {currentMedicine.expiryDate && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Default Expiry Date</Typography>
                  <Typography variant="body1">
                    {new Date(currentMedicine.expiryDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              )}
              {currentMedicine.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                  <Typography variant="body1">{currentMedicine.description}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenViewModal(false)} 
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}