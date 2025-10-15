// src/pages/PrescriptionManagementPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
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
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Avatar,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  alpha,
  useTheme,
  Autocomplete,
} from "@mui/material";
import {
  Add,
  CheckCircle,
  Cancel,
  Search,
  LocalHospital,
  Person,
  Phone,
  CalendarToday,
  MedicalServices,
  ReceiptLong,
  Visibility,
  Delete,
  Refresh,
  VerifiedUser,
  Schedule,
  Warning,
  ArrowBack,
} from "@mui/icons-material";

import {
  getPendingPrescriptions,
  createPrescription,
  fulfillPrescription,
  cancelPrescription,
  getCustomerPrescriptions,
  searchMedicines
} from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import TableSkeleton from "../components/skeletons/TableSkeleton";

// ✅ Add translation hook
import { useTranslation } from 'react-i18next';

export default function PrescriptionManagementPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchPhone, setSearchPhone] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, pending: 0, fulfilled: 0, cancelled: 0 });

  const theme = useTheme();

  // ✅ Initialize translation
  const { t } = useTranslation();

  // ✅ State for medicines in prescription
  const [medicines, setMedicines] = useState([{ id: "", medicineId: "", quantity: 1 }]);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    dosage: "1 tablet",
    frequency: "once daily",
    duration: "7 days",
    validUntil: "",
    instructions: "",
  });

  // Fetch all medicines for doctor to choose from
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const delayDebounce = setTimeout(() => {
      searchMedicines({ search: searchTerm })
        .then(res => {
          const meds = res.data?.medicines || [];
          setMedicineOptions(meds);
        })
        .catch(err => {
          console.error("Search failed:", err);
          setMedicineOptions([]);
        });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Calculate statistics
  useEffect(() => {
    const total = prescriptions.length;
    const pending = prescriptions.filter(p => p.status === "pending").length;
    const fulfilled = prescriptions.filter(p => p.status === "fulfilled").length;
    const cancelled = prescriptions.filter(p => p.status === "cancelled").length;
    
    setStats({ total, pending, fulfilled, cancelled });
  }, [prescriptions]);

  // Fetch prescriptions based on active tab and phone search
  const fetchPrescriptions = useCallback(async () => {
    if (activeTab === 1 && !searchPhone.trim()) {
      setPrescriptions([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let data = [];

      if (activeTab === 0) {
        if (user?.role === "doctor") {
          const res = await getCustomerPrescriptions({});
          data = Array.isArray(res.data?.prescriptions)
            ? res.data.prescriptions.filter(p => p.doctorId === user.id)
            : [];
        } else {
          try {
            const res = await getPendingPrescriptions();
            data = res.data?.prescriptions || [];
          } catch (err) {
            if (err.response?.status === 403) {
              setError(t('prescriptionManagement.noPermissionPending'));
            } else {
              throw err;
            }
            data = [];
          }
        }
      } else if (activeTab === 1) {
        if (!/^[+]?[0-9\s\-()]{8,15}$/.test(searchPhone.trim())) {
          setError(t('prescriptionManagement.validPhoneRequired'));
          data = [];
        } else {
          try {
            const res = await getCustomerPrescriptions({ phone: searchPhone.trim() });
            data = res.data?.prescriptions || [];
            if (data.length === 0) {
              setError(t('prescriptionManagement.noPrescriptionsForPhone'));
            }
          } catch (err) {
            if (err.response?.status === 400) {
              setError(t('prescriptionManagement.invalidPhoneFormat'));
            } else {
              setError(t('prescriptionManagement.failedToLoadPrescriptions'));
            }
            data = [];
          }
        }
      }

      // Apply status filter
      if (statusFilter !== "all") {
        data = data.filter(p => p.status === statusFilter);
      }

      setPrescriptions(data);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError(t('prescriptionManagement.failedToLoadPrescriptions'));
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchPhone, user, statusFilter, t]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrescriptions();
    }, 600);

    return () => clearTimeout(timer);
  }, [fetchPrescriptions]);

  // ✅ Add new medicine row with unique ID
  const addMedicineRow = () => {
    const newId = Date.now() + Math.random(); // Unique ID
    setMedicines([...medicines, { id: newId, medicineId: "", quantity: 1 }]);
  };

  // ✅ Remove medicine row by unique ID
  const removeMedicineRow = (id) => {
    if (medicines.length <= 1) return;
    setMedicines(medicines.filter(med => med.id !== id));
  };

  // ✅ Update medicine field by unique ID
  const updateMedicine = (id, field, value) => {
    setMedicines(prev => prev.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  // ✅ Format selected medicines into string for backend
  const formatMedicinesForBackend = () => {
    return medicines
      .filter(m => m.medicineId)
      .map(m => {
        const med = medicineOptions.find(opt => opt.id === m.medicineId);
        return t('prescriptionManagement.medicineQuantity', { name: med?.name || t('common.unknown'), quantity: m.quantity });
      })
      .join(', ');
  };

const handleCreatePrescription = async () => {
  if (!formData.customerName.trim()) {
    toast.error(t('prescriptionManagement.patientNameRequired'));
    return;
  }

  const formattedDetails = formatMedicinesForBackend();
  if (!formattedDetails.trim()) {
    toast.error(t('prescriptionManagement.atLeastOneMedicine'));
    return;
  }

  try {
    await createPrescription({
      ...formData,
      details: formattedDetails,
      medicines: medicines
        .filter(m => m.medicineId)
        .map(m => ({
          medicineId: m.medicineId,
          quantity: m.quantity
        })),
      validUntil: formData.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
    });

    toast.success(t('prescriptionManagement.createdSuccessfully'));
    fetchPrescriptions();
    setOpenCreateModal(false);
    resetForm();
    setMedicines([{ id: Date.now(), medicineId: "", quantity: 1 }]);
    setSearchTerm("");
  } catch (err) {
    const msg = err.response?.data?.message || t('prescriptionManagement.failedToCreate');
    toast.error(`❌ ${msg}`);
  }
};

  const handleFulfillPrescription = async (id) => {
    try {
      await fulfillPrescription(id);
      toast.success(t('prescriptionManagement.fulfilledSuccess'));
      fetchPrescriptions();
    } catch (err) {
      const msg = err.response?.data?.message || t('prescriptionManagement.failedToFulfill');
      toast.error(`❌ ${msg}`);
    }
  };

  const handleCancelPrescription = async (id) => {
    if (!window.confirm(t('prescriptionManagement.confirmCancel'))) return;

    try {
      await cancelPrescription(id);
      toast.success(t('prescriptionManagement.cancelledSuccess'));
      fetchPrescriptions();
    } catch (err) {
      const msg = err.response?.data?.message || t('prescriptionManagement.failedToCancel');
      toast.error(`❌ ${msg}`);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      dosage: "1 tablet",
      frequency: "once daily",
      duration: "7 days",
      validUntil: "",
      instructions: "",
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchPhone("");
    setPrescriptions([]);
    setError("");
    setStatusFilter("all");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'fulfilled': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Schedule />;
      case 'fulfilled': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <MedicalServices />;
    }
  };

  const isPrescriptionExpired = (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  // Doctor-specific actions
  const canCreatePrescription = user?.role === "doctor";
  const canFulfillPrescription = user?.role !== "doctor"; // Pharmacists and admins can fulfill
  const canCancelPrescription = true; // Both doctors and pharmacists can cancel

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
          {t('prescriptionManagement.prescriptionManagement')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {user?.role === "doctor" 
            ? t('prescriptionManagement.managePatientPrescriptions') 
            : t('prescriptionManagement.processAndFulfill')
          }
        </Typography>
        {user?.role === "doctor" && (
          <Typography variant="body1" sx={{ opacity: 0.8, mt: 1 }}>
            {t('prescriptionManagement.createAndManage')}
          </Typography>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 2, mx: 'auto' }}>
                <ReceiptLong />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('prescriptionManagement.totalPrescriptions')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mb: 2, mx: 'auto' }}>
                <Schedule />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('prescriptionManagement.pending')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mb: 2, mx: 'auto' }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.fulfilled}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('prescriptionManagement.fulfilled')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mb: 2, mx: 'auto' }}>
                <Cancel />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.cancelled}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('prescriptionManagement.cancelled')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar - Show Create Button for Doctors */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* CREATE PRESCRIPTION BUTTON - DOCTORS ONLY */}
                {canCreatePrescription && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      setOpenCreateModal(true);
                      setMedicines([{ id: Date.now(), medicineId: "", quantity: 1 }]);
                      setSearchTerm("");
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('prescriptionManagement.createNewPrescription')}
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchPrescriptions}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  {t('common.refresh')}
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>{t('prescriptionManagement.status')}</InputLabel>
                  <Select
                    value={statusFilter}
                    label={t('prescriptionManagement.status')}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">{t('prescriptionManagement.allStatus')}</MenuItem>
                    <MenuItem value="pending">{t('prescriptionManagement.pending')}</MenuItem>
                    <MenuItem value="fulfilled">{t('prescriptionManagement.fulfilled')}</MenuItem>
                    <MenuItem value="cancelled">{t('prescriptionManagement.cancelled')}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': { 
                fontWeight: 'bold',
                minHeight: 60
              }
            }}
          >
            <Tab 
              icon={<ReceiptLong />} 
              iconPosition="start"
              label={user?.role === "doctor" 
                ? t('prescriptionManagement.myPrescriptions') 
                : t('prescriptionManagement.pendingPrescriptions')
              } 
            />
            <Tab 
              icon={<Search />} 
              iconPosition="start"
              label={t('prescriptionManagement.searchByPhone')} 
            />
          </Tabs>

          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone />
                {t('prescriptionManagement.searchPatientByPhone')}
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    label={t('prescriptionManagement.phoneNumber')}
                    fullWidth
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder={t('prescriptionManagement.examplePhone')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="textSecondary">
                        {t('prescriptionManagement.searching')}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {t('prescriptionManagement.resultsUpdateAutomatically')}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={() => setError("")}>
              <Cancel />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Prescriptions Table */}
      {loading && activeTab === 0 ? (
        <TableSkeleton rows={5} columns={8} />
      ) : (
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
                <TableCell><strong>{t('prescriptionManagement.prescriptionId')}</strong></TableCell>
                <TableCell><strong>{t('prescriptionManagement.doctor')}</strong></TableCell>
                <TableCell><strong>{t('prescriptionManagement.patient')}</strong></TableCell>
                <TableCell><strong>{t('prescriptionManagement.medicationDetails')}</strong></TableCell>
                <TableCell><strong>{t('prescriptionManagement.issuedDate')}</strong></TableCell>
                <TableCell><strong>{t('prescriptionManagement.validUntil')}</strong></TableCell>
                <TableCell><strong>{t('prescriptionManagement.status')}</strong></TableCell>
                <TableCell align="center"><strong>{t('prescriptionManagement.actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <MedicalServices sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {t('prescriptionManagement.noPrescriptionsFound')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {activeTab === 0
                        ? user?.role === "doctor"
                          ? t('prescriptionManagement.noPrescriptionsCreated')
                          : t('prescriptionManagement.noPendingPrescriptions')
                        : searchPhone
                          ? t('prescriptionManagement.noPrescriptionsForPhone')
                          : t('prescriptionManagement.enterPhoneToSearch')
                      }
                    </Typography>
                    {user?.role === "doctor" && activeTab === 0 && (
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                          setOpenCreateModal(true);
                          setMedicines([{ id: Date.now(), medicineId: "", quantity: 1 }]);
                        }}
                        sx={{ mt: 2 }}
                      >
                        {t('prescriptionManagement.createFirstPrescription')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                prescriptions.map((prescription) => (
                  <TableRow 
                    key={prescription.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                      } 
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        {t('prescriptionManagement.prescriptionNumber', { id: prescription.id })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedUser color="action" />
                        <Typography>
                          {prescription.doctor?.username || t('prescriptionManagement.unknownDoctor')}
                        </Typography>
                        {prescription.doctorId === user?.id && (
                          <Chip label={t('prescriptionManagement.you')} color="primary" size="small" />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="action" />
                        <Box>
                          <Typography fontWeight="medium">
                            {prescription.customerName || t('prescriptionManagement.walkInPatient')}
                          </Typography>
                          {prescription.customerPhone && (
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Phone sx={{ fontSize: 14 }} />
                              {prescription.customerPhone}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {/* ✅ Display human-readable details */}
                        <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'medium' }}>
                          {prescription.details || t('prescriptionManagement.noMedicationDetails')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={prescription.dosage} size="small" variant="outlined" />
                          <Chip label={prescription.frequency} size="small" variant="outlined" />
                          <Chip label={prescription.duration} size="small" variant="outlined" />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {new Date(prescription.issuedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2">
                            {prescription.validUntil ? new Date(prescription.validUntil).toLocaleDateString() : t('common.na')}
                          </Typography>
                          {isPrescriptionExpired(prescription.validUntil) && (
                            <Chip 
                              icon={<Warning />} 
                              label={t('prescriptionManagement.expired')} 
                              color="error" 
                              size="small" 
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(prescription.status)}
                        label={prescription.status.toUpperCase()}
                        color={getStatusColor(prescription.status)}
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                        {/* FULFILL BUTTON - Pharmacists/Admins only for pending prescriptions */}
                        {prescription.status === "pending" && canFulfillPrescription && (
                          <Tooltip title={t('prescriptionManagement.fulfillPrescription')}>
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => handleFulfillPrescription(prescription.id)}
                              sx={{
                                '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.1) }
                              }}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* CANCEL BUTTON - Available for both doctors and pharmacists */}
                        {prescription.status === "pending" && canCancelPrescription && (
                          <Tooltip title={t('prescriptionManagement.cancelPrescription')}>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleCancelPrescription(prescription.id)}
                              sx={{
                                '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                              }}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* VIEW BUTTON - Available for all users */}
                        <Tooltip title={t('prescriptionManagement.viewDetails')}>
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* CREATE PRESCRIPTION MODAL - DOCTORS ONLY */}
      {canCreatePrescription && (
        <Dialog 
          open={openCreateModal} 
          onClose={() => setOpenCreateModal(false)} 
          maxWidth="md" 
          fullWidth
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
              {t('prescriptionManagement.createNewPrescription')}
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="customerName"
                  label={t('prescriptionManagement.patientName')}
                  fullWidth
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="customerPhone"
                  label={t('prescriptionManagement.phoneNumber')}
                  fullWidth
                  value={formData.customerPhone}
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

              {/* Medicine Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {t('prescriptionManagement.medicationList')}
                </Typography>
                {medicines.map((med) => (
                  <Grid container spacing={2} key={med.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
                    <Grid item xs={12} md={7}>
                      <Autocomplete
                        options={medicineOptions}
                        getOptionLabel={(option) => option.name || ""}
                        value={medicineOptions.find(m => m.id === med.medicineId) || null}
                        onChange={(e, newValue) => updateMedicine(med.id, 'medicineId', newValue?.id || "")}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t('prescriptionManagement.selectMedicine')}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('prescriptionManagement.startTyping')}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <TextField
                        label={t('prescriptionManagement.quantity')}
                        type="number"
                        fullWidth
                        inputProps={{ min: 1 }}
                        value={med.quantity}
                        onChange={(e) => updateMedicine(med.id, 'quantity', parseInt(e.target.value))}
                      />
                    </Grid>
                    <Grid item xs={6} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        onClick={() => removeMedicineRow(med.id)}
                        disabled={medicines.length <= 1}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  startIcon={<Add />}
                  onClick={addMedicineRow}
                  variant="outlined"
                  size="small"
                >
                  {t('prescriptionManagement.addAnotherMedicine')}
                </Button>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="dosage"
                  label={t('prescriptionManagement.dosage')}
                  fullWidth
                  value={formData.dosage}
                  onChange={handleInputChange}
                  placeholder={t('prescriptionManagement.dosagePlaceholder')}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="frequency"
                  label={t('prescriptionManagement.frequency')}
                  fullWidth
                  value={formData.frequency}
                  onChange={handleInputChange}
                  placeholder={t('prescriptionManagement.frequencyPlaceholder')}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  name="duration"
                  label={t('prescriptionManagement.duration')}
                  fullWidth
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder={t('prescriptionManagement.durationPlaceholder')}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="validUntil"
                  label={t('prescriptionManagement.validUntil')}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.validUntil}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  name="instructions"
                  label={t('prescriptionManagement.specialInstructions')}
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.instructions}
                  onChange={handleInputChange}
                  placeholder={t('prescriptionManagement.instructionsPlaceholder')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setOpenCreateModal(false)} 
              variant="outlined"
              startIcon={<ArrowBack />}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleCreatePrescription} 
              variant="contained" 
              color="primary"
              startIcon={<CheckCircle />}
              sx={{ px: 4 }}
            >
              {t('prescriptionManagement.createPrescription')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
}