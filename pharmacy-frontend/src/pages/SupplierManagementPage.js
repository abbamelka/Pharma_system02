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
  Card,
  CardContent,
  Grid,
  Avatar,
  InputAdornment,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  useTheme,
  Divider,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Business,
  Email,
  Phone,
  LocationOn,
  Person,
  Refresh,
  ArrowBack,
  CheckCircle,
  TrendingUp,
  Group,
  LocalShipping,
  ContactPhone,
} from "@mui/icons-material";
import { 
  getAllSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier,
  getSupplierById,
  searchSuppliers
} from "../services/api";
import { toast } from "react-toastify";

// ✅ Add translation hook
import { useTranslation } from 'react-i18next';

export default function SupplierManagementPage() {
  const theme = useTheme();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Initialize translation
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contact: ""
  });

  // Statistics
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
    hasContact: 0,
    hasAddress: 0,
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllSuppliers();
      const suppliersData = response.data.suppliers || [];
      setSuppliers(suppliersData);

      // Calculate statistics
      const hasContact = suppliersData.filter(s => s.contact && s.contact.trim() !== "").length;
      const hasAddress = suppliersData.filter(s => s.address && s.address.trim() !== "").length;
      
      setStats({
        totalSuppliers: suppliersData.length,
        activeSuppliers: suppliersData.length, // Assuming all are active for now
        hasContact,
        hasAddress,
      });

    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setError(t('supplier.failedToLoadSuppliers'));
      toast.error(`❌ ${t('supplier.failedToLoadSuppliers')}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async () => {
    if (!formData.name.trim()) {
      toast.error(t('supplier.nameRequired'));
      return;
    }

    try {
      await createSupplier(formData);
      toast.success(t('supplier.createdSuccessfully'));
      fetchSuppliers();
      setOpenAddModal(false);
      resetForm();
    } catch (err) {
      console.error("Error creating supplier:", err);
      const msg = err.response?.data?.message || t('supplier.failedToCreateSupplier');
      toast.error(`❌ ${msg}`);
    }
  };

  const handleUpdateSupplier = async () => {
    if (!formData.name.trim()) {
      toast.error(t('supplier.nameRequired'));
      return;
    }

    try {
      await updateSupplier(currentSupplier.id, formData);
      toast.success(t('supplier.updatedSuccessfully'));
      fetchSuppliers();
      setOpenEditModal(false);
      resetForm();
    } catch (err) {
      console.error("Error updating supplier:", err);
      const msg = err.response?.data?.message || t('supplier.failedToUpdateSupplier');
      toast.error(`❌ ${msg}`);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm(t('supplier.confirmDelete'))) return;

    try {
      await deleteSupplier(id);
      toast.success(t('supplier.deletedSuccessfully'));
      fetchSuppliers();
    } catch (err) {
      console.error("Error deleting supplier:", err);
      const msg = err.response?.data?.message || t('supplier.failedToDeleteSupplier');
      toast.error(`❌ ${msg}`);
    }
  };

  const handleEditSupplier = async (supplierId) => {
    try {
      const response = await getSupplierById(supplierId);
      const supplier = response.data.supplier;
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
      toast.error(`❌ ${t('supplier.failedToLoadDetails')}`);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchSuppliers();
      return;
    }

    try {
      const response = await searchSuppliers(searchTerm);
      setSuppliers(response.data.suppliers || []);
    } catch (err) {
      console.error("Error searching suppliers:", err);
      setError(t('supplier.failedToSearchSuppliers'));
      toast.error(`❌ ${t('supplier.failedToSearchSuppliers')}`);
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

  const getSupplierStatus = (supplier) => {
    // Simple status based on data completeness
    const completeness = [
      supplier.email,
      supplier.phone,
      supplier.address,
      supplier.contact
    ].filter(Boolean).length;

    if (completeness >= 3) return { color: 'success', label: t('supplier.complete') };
    if (completeness >= 2) return { color: 'warning', label: t('supplier.partial') };
    return { color: 'error', label: t('supplier.incomplete') };
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
          {t('supplier.loadingData')}
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
            <Button color="inherit" onClick={fetchSuppliers}>
              {t('common.retry')}
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
          background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: 4,
          py: 4,
          px: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <LocalShipping sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {t('supplier.supplierManagement')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('supplier.manageSupplierNetwork')}
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 2, mx: 'auto' }}>
                <Business />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.totalSuppliers}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('supplier.totalSuppliers')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mb: 2, mx: 'auto' }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.activeSuppliers}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('supplier.activeSuppliers')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mb: 2, mx: 'auto' }}>
                <Person />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.hasContact}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('supplier.withContactPerson')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', mb: 2, mx: 'auto' }}>
                <LocationOn />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.hasAddress}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('supplier.withAddress')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label={t('supplier.searchSuppliers')}
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t('supplier.searchPlaceholder')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('supplier.status')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('supplier.status')}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('supplier.allSuppliers')}</MenuItem>
                  <MenuItem value="complete">{t('supplier.completeInfo')}</MenuItem>
                  <MenuItem value="partial">{t('supplier.partialInfo')}</MenuItem>
                  <MenuItem value="incomplete">{t('supplier.incompleteInfo')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearch}
                  sx={{ flex: 1 }}
                >
                  {t('common.search')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchSuppliers}
                  disabled={loading}
                >
                  {t('common.refresh')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenAddModal(true)}
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1.5
          }}
        >
          {t('supplier.createNewSupplier')}
        </Button>
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {t('supplier.showingSuppliers', { count: suppliers.length })}
        </Typography>
        {searchTerm && (
          <Button
            color="secondary"
            onClick={() => {
              setSearchTerm("");
              fetchSuppliers();
            }}
          >
            {t('supplier.clearSearch')}
          </Button>
        )}
      </Box>

      {/* Suppliers Table */}
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
              <TableCell><strong>{t('supplier.supplierDetails')}</strong></TableCell>
              <TableCell><strong>{t('supplier.contactInformation')}</strong></TableCell>
              <TableCell><strong>{t('supplier.contactPerson')}</strong></TableCell>
              <TableCell><strong>{t('supplier.status')}</strong></TableCell>
              <TableCell align="center"><strong>{t('supplier.actions')}</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {t('supplier.noSuppliersFound')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm 
                      ? t('supplier.tryAdjustingSearch') 
                      : t('supplier.createFirstSupplier')
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => {
                const status = getSupplierStatus(supplier);

                return (
                  <TableRow 
                    key={supplier.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                      } 
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography fontWeight="bold" gutterBottom>
                          {supplier.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {t('supplier.idNumber', { id: supplier.id })}
                        </Typography>
                        {supplier.address && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="textSecondary">
                              {supplier.address}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {supplier.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {supplier.email}
                            </Typography>
                          </Box>
                        )}
                        {supplier.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {supplier.phone}
                            </Typography>
                          </Box>
                        )}
                        {!supplier.email && !supplier.phone && (
                          <Typography variant="body2" color="textSecondary" fontStyle="italic">
                            {t('supplier.noContactInfo')}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {supplier.contact ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" fontWeight="medium">
                            {supplier.contact}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary" fontStyle="italic">
                          {t('supplier.notSpecified')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                        <Tooltip title={t('supplier.editSupplier')}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEditSupplier(supplier.id)}
                            sx={{
                              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('supplier.deleteSupplier')}>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteSupplier(supplier.id)}
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
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Modals */}
      <EnhancedSupplierModal
        open={openAddModal}
        title={t('supplier.createNewSupplier')}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleCreateSupplier}
        handleClose={() => setOpenAddModal(false)}
        submitText={t('supplier.createSupplier')}
        submitIcon={<CheckCircle />}
        t={t}
      />

      <EnhancedSupplierModal
        open={openEditModal}
        title={t('supplier.editSupplier')}
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleUpdateSupplier}
        handleClose={() => setOpenEditModal(false)}
        submitText={t('supplier.updateSupplier')}
        submitIcon={<CheckCircle />}
        t={t}
      />
    </Container>
  );
}

// Enhanced Modal Component
function EnhancedSupplierModal({ 
  open, 
  title, 
  formData, 
  handleInputChange, 
  handleSubmit, 
  handleClose, 
  submitText,
  submitIcon,
  t 
}) {
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
        backgroundColor: alpha(theme.palette.primary.main, 0.04)
      }}>
        <Business color="primary" />
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label={t('supplier.supplierName')}
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              required
              autoFocus
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
              name="email"
              label={t('supplier.emailAddress')}
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="phone"
              label={t('supplier.phoneNumber')}
              type="tel"
              fullWidth
              value={formData.phone}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="contact"
              label={t('supplier.contactPerson')}
              fullWidth
              value={formData.contact}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="address"
              label={t('supplier.address')}
              fullWidth
              multiline
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
          startIcon={<ArrowBack />}
        >
          {t('common.cancel')}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          startIcon={submitIcon}
          sx={{ px: 4 }}
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}