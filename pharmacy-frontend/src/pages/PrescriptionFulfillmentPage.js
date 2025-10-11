// src/pages/PrescriptionFulfillmentPage.js
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
  Card,
  CardContent,
  Grid,
  Avatar,
  InputAdornment,
  TextField,
  Tooltip,
  alpha,
  useTheme,
  Divider,
  IconButton,
} from "@mui/material";
import {
  LocalPharmacy,
  CheckCircle,
  Cancel,
  Search,
  Refresh,
  Visibility,
  Person,
  MedicalServices,
  CalendarToday,
  AccessTime,
  Warning,
  Assignment,
  ContactPhone,
} from "@mui/icons-material";
import {
  getPendingPrescriptions,
  fulfillPrescription,
  cancelPrescription,
} from "../services/api";
import { toast } from "react-toastify";

export default function PrescriptionFulfillmentPage() {
  const theme = useTheme();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPendingPrescriptions();
      console.log("📦 Pending prescriptions:", response.data);

      const data = response.data?.prescriptions;

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      // ✅ Ensure details are always a string like "Paracetamol x2"
      const enriched = data.map(prescription => {
        let detailsText = prescription.details || "";

        // If details is an array of objects → convert to readable string
        if (Array.isArray(detailsText)) {
          detailsText = detailsText
            .map(item => {
              const name = item.medicineName || `Medicine #${item.medicineId}`;
              return `${name} x${item.quantity}`;
            })
            .join(", ");
        }

        return {
          ...prescription,
          details: detailsText
        };
      });

      setPrescriptions(enriched);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      const message = err.response?.data?.message || "Failed to load prescriptions";
      setError(message);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleFulfill = async (id) => {
    try {
      await fulfillPrescription(id);
      toast.success("🎉 Prescription fulfilled and order created!");
      fetchPrescriptions();
    } catch (err) {
      console.error("Error fulfilling prescription:", err);
      const message = err.response?.data?.message || "Failed to fulfill prescription";
      toast.error(`❌ ${message}`);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this prescription?")) return;

    try {
      await cancelPrescription(id);
      toast.success("🗑️ Prescription cancelled");
      fetchPrescriptions();
    } catch (err) {
      console.error("Error cancelling prescription:", err);
      const message = err.response?.data?.message || "Failed to cancel prescription";
      toast.error(`❌ ${message}`);
    }
  };

  // Statistics
  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter(p => p.status === 'pending').length,
    fulfilled: prescriptions.filter(p => p.status === 'fulfilled').length,
    cancelled: prescriptions.filter(p => p.status === 'cancelled').length,
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      prescription.customerName?.toLowerCase().includes(term) ||
      prescription.doctor?.username?.toLowerCase().includes(term) ||
      prescription.details?.toLowerCase().includes(term) ||
      prescription.customerPhone?.includes(term);

    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
      case 'pending': return <Warning />;
      case 'fulfilled': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Assignment />;
    }
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
          Loading prescriptions...
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
            <Button color="inherit" onClick={fetchPrescriptions}>
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
          background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: 4,
          py: 4,
          px: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <LocalPharmacy sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Prescription Fulfillment
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Review and fulfill pending prescriptions with care
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 2, mx: 'auto' }}>
                <Assignment />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Total Prescriptions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mb: 2, mx: 'auto' }}>
                <Warning />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Pending Review
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
                Fulfilled
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
                Cancelled
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
                label="Search Prescriptions"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient, doctor, or details..."
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={fetchPrescriptions}
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
          Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
        </Typography>
        {searchTerm && (
          <Button
            color="secondary"
            onClick={() => setSearchTerm("")}
          >
            Clear Search
          </Button>
        )}
      </Box>

      {/* Prescriptions Table */}
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
              <TableCell><strong>Prescription Details</strong></TableCell>
              <TableCell><strong>Patient Information</strong></TableCell>
              <TableCell><strong>Medical Details</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrescriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <LocalPharmacy sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No prescriptions found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'All prescriptions have been fulfilled or there are no pending prescriptions.'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredPrescriptions.map((prescription) => (
                <TableRow
                  key={prescription.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography fontWeight="bold" gutterBottom>
                        Prescription #{prescription.id}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <MedicalServices sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="textSecondary">
                          Dr. {prescription.doctor?.username || "Unknown Doctor"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(prescription.issuedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(prescription.issuedAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography fontWeight="medium">
                          {prescription.customerName || "Walk-in Patient"}
                        </Typography>
                      </Box>
                      {prescription.customerPhone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ContactPhone sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="textSecondary">
                            {prescription.customerPhone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={prescription.details} arrow>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {prescription.details || "No medication details"}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(prescription.status)}
                      label={prescription.status.toUpperCase()}
                      color={getStatusColor(prescription.status)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                      {prescription.status === 'pending' && (
                        <>
                          <Tooltip title="Fulfill Prescription">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircle />}
                              onClick={() => handleFulfill(prescription.id)}
                              sx={{
                                borderRadius: 2,
                                px: 2,
                                '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.9) }
                              }}
                            >
                              Fulfill
                            </Button>
                          </Tooltip>
                          <Tooltip title="Cancel Prescription">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Cancel />}
                              onClick={() => handleCancel(prescription.id)}
                              sx={{ borderRadius: 2 }}
                            >
                              Cancel
                            </Button>
                          </Tooltip>
                        </>
                      )}
                      {prescription.status !== 'pending' && (
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
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}