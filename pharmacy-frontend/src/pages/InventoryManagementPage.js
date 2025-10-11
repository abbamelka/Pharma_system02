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
  Card,
  CardContent,
  Grid,
  Avatar,
  InputAdornment,
  alpha,
  useTheme,
  Badge,
  Divider,
} from "@mui/material";
import {
  Search,
  Add,
  Warning,
  Dangerous,
  Inventory,
  LocalHospital,
  CalendarToday,
  Business,
  PriceChange,
  Category,
  Refresh,
  TrendingDown,
  TrendingUp,
  Visibility,
  Edit,
  QrCode,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";

import {
  getBatchesByMedicine,
  getAllMedicines,
  addInventoryToMedicine,
  getAllSuppliers,
} from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function InventoryManagementPage() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [openAddModal, setOpenAddModal] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState(null);

  const theme = useTheme();

  const [formData, setFormData] = useState({
    batchNumber: "",
    quantity: "",
    expiryDate: "",
    purchasePrice: "",
    supplierId: "",
  });

  // Statistics
  const [stats, setStats] = useState({
    totalBatches: 0,
    lowStock: 0,
    expiringSoon: 0,
    expired: 0,
    totalValue: 0,
  });

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError("");

      const medicineRes = await getAllMedicines();
      const meds = Array.isArray(medicineRes.data?.medicines)
        ? medicineRes.data.medicines
        : [];

      setMedicines(meds);

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

      const inventoryList = [];
      let totalValue = 0;

      for (const med of meds) {
        try {
          const res = await getBatchesByMedicine(med.id);
          const batches = Array.isArray(res.data?.batches) ? res.data.batches : [];

          batches.forEach((batch) => {
            const supplier = fetchedSuppliers.find(s => s.id === batch.supplierId);
            const batchValue = (batch.purchasePrice || 0) * (batch.quantity || 0);
            totalValue += batchValue;

            inventoryList.push({
              ...batch,
              medicineName: med.name,
              category: med.category,
              salePrice: med.price,
              supplierName: supplier?.name || "Unknown Supplier",
              medicineId: med.id,
            });
          });
        } catch (err) {
          console.warn(`Failed to load batches for ${med.name}`, err);
        }
      }

      setInventory(inventoryList);

      // Calculate statistics
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const lowStock = inventoryList.filter(b => b.quantity < 10).length;
      const expiringSoon = inventoryList.filter(b => {
        const expiry = new Date(b.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        return expiry >= now && expiry < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }).length;
      const expired = inventoryList.filter(b => {
        const expiry = new Date(b.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        return expiry < now;
      }).length;

      setStats({
        totalBatches: inventoryList.length,
        lowStock,
        expiringSoon,
        expired,
        totalValue,
      });

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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const filteredInventory = inventory.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      item.medicineName.toLowerCase().includes(term) ||
      item.batchNumber.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      item.supplierName.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "low_stock" && item.quantity < 10) ||
      (statusFilter === "expiring_soon" && (() => {
        const expiry = new Date(item.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        return (
          expiry >= now &&
          expiry < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        );
      })())
      ||
      (statusFilter === "expired" && (()=>{
        const expiry = new Date(item.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        return expiry < now;
      })());

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

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
      toast.success(`🎉 Inventory added to ${currentMedicine.name}`);
      setOpenAddModal(false);
      fetchInventoryData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add inventory";
      toast.error(`❌ ${msg}`);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getStockStatus = (quantity) => {
    if (quantity < 5) return { color: 'error', label: 'Critical' };
    if (quantity < 10) return { color: 'warning', label: 'Low' };
    if (quantity < 50) return { color: 'info', label: 'Medium' };
    return { color: 'success', label: 'Good' };
  };

  const getExpiryStatus = (expiryDate) => {
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    if (expiry < now) return { color: 'error', label: 'Expired', icon: <Dangerous /> };
    
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7) return { color: 'error', label: '1 Week', icon: <Warning /> };
    if (daysUntilExpiry <= 30) return { color: 'warning', label: '1 Month', icon: <Warning /> };
    if (daysUntilExpiry <= 90) return { color: 'info', label: '3 Months', icon: <CalendarToday /> };
    
    return { color: 'success', label: 'Safe', icon: <CheckCircle /> };
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "60vh",
          flexDirection: "column",
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading inventory data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" onClick={fetchInventoryData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

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
        <Inventory sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Inventory Management
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Track and manage all medicine batches, stock levels, and expiry dates
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 2, mx: 'auto' }}>
                <LocalHospital />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.totalBatches}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Total Batches
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mb: 2, mx: 'auto' }}>
                <TrendingDown />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.lowStock}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Low Stock
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
                {stats.expiringSoon}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Expiring Soon
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mb: 2, mx: 'auto' }}>
                <Dangerous />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.expired}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Expired
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mb: 2, mx: 'auto' }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                ${(stats.totalValue / 1000).toFixed(1)}K
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Total Value
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
                label="Search Inventory"
                fullWidth
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by medicine, batch, category, or supplier..."
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="low_stock">Low Stock</MenuItem>
                  <MenuItem value="expiring_soon">Expiring Soon</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
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
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={fetchInventoryData}
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Showing {filteredInventory.length} of {inventory.length} batches
        </Typography>
        {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
          <Button
            color="secondary"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Inventory Table */}
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
              <TableCell><strong>Medicine</strong></TableCell>
              <TableCell><strong>Batch Number</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Stock Level</strong></TableCell>
              <TableCell align="right"><strong>Purchase Price</strong></TableCell>
              <TableCell align="right"><strong>Sale Price</strong></TableCell>
              <TableCell><strong>Expiry Status</strong></TableCell>
              <TableCell><strong>Supplier</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Inventory sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No inventory batches found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'No inventory batches available. Add some inventory to get started.'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item.quantity);
                const expiryStatus = getExpiryStatus(item.expiryDate);

                return (
                  <TableRow 
                    key={item.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                      } 
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography fontWeight="medium" gutterBottom>
                          {item.medicineName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: #{item.medicineId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <QrCode sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" fontWeight="medium">
                          {item.batchNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.category.toUpperCase()}
                        color={
                          item.category === "prescription" ? "error" :
                          item.category === "OTC" ? "success" : "warning"
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${item.quantity} units`}
                          color={stockStatus.color}
                          size="small"
                          variant="filled"
                        />
                        <Typography variant="caption" color="textSecondary">
                          {stockStatus.label}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        ${parseFloat(item.purchasePrice).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        ${parseFloat(item.salePrice).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Expires: ${new Date(item.expiryDate).toLocaleDateString()}`}>
                        <Chip
                          icon={expiryStatus.icon}
                          label={expiryStatus.label}
                          color={expiryStatus.color}
                          size="small"
                          variant="filled"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {item.supplierName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Add More Stock">
                          <IconButton
                            color="success"
                            size="small"
                            onClick={() => handleOpenAddModal({ 
                              id: item.medicineId, 
                              name: item.medicineName 
                            })}
                            sx={{
                              '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.1) }
                            }}
                          >
                            <Add />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton
                            color="info"
                            size="small"
                            sx={{
                              '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Add Inventory Modal */}
      <EnhancedAddInventoryModal
        open={openAddModal}
        medicine={currentMedicine}
        formData={formData}
        suppliers={suppliers}
        handleChange={handleChange}
        handleSubmit={handleAddInventory}
        handleClose={() => setOpenAddModal(false)}
      />
    </Container>
  );
}

// Enhanced Modal Component
function EnhancedAddInventoryModal({ open, medicine, formData, suppliers, handleChange, handleSubmit, handleClose }) {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
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
        <Add color="success" />
        <Typography variant="h6" fontWeight="bold">
          Add Inventory to {medicine?.name}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Medicine ID: #{medicine?.id}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="batchNumber"
              label="Batch Number"
              fullWidth
              value={formData.batchNumber}
              onChange={handleChange}
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCode color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              fullWidth
              value={formData.quantity}
              onChange={handleChange}
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
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="purchasePrice"
              label="Purchase Price"
              type="number"
              fullWidth
              value={formData.purchasePrice}
              onChange={handleChange}
              inputProps={{ step: "0.01" }}
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
            <FormControl fullWidth required>
              <InputLabel>Supplier</InputLabel>
              <Select
                name="supplierId"
                value={formData.supplierId}
                label="Supplier"
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <Business color="action" />
                  </InputAdornment>
                }
              >
                {suppliers.length === 0 ? (
                  <MenuItem disabled>No suppliers available</MenuItem>
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
          onClick={handleClose} 
          variant="outlined"
          startIcon={<ArrowBack />}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="success"
          startIcon={<CheckCircle />}
          sx={{ px: 4 }}
        >
          Add Inventory
        </Button>
      </DialogActions>
    </Dialog>
  );
}