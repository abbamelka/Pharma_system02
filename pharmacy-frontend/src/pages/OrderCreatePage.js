// src/pages/OrderCreatePage.js
import React, { useState, useRef } from "react";
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
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { 
  PhotoCamera, 
  Upload, 
  Close, 
  Add, 
  Delete,
  Person,
  Phone,
  LocalHospital,
  Receipt,
  ShoppingCartCheckout,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import MedicineSearchModal from "../components/MedicineSearchModal";
import { createOrder } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const steps = ['Customer Info', 'Add Medicines', 'Review & Complete'];

export default function OrderCreatePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  // 👤 Walk-in customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // 📸 Prescription Photo
  const [prescriptionPhoto, setPrescriptionPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // Refs for file inputs
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // ✅ Check if any selected medicine requires prescription
  const requiresPrescription = items.some(item => item.requiresPrescription);

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

    // Check if medicine already exists
    const existingIndex = items.findIndex(item => item.medicineId === medicine.id);
    if (existingIndex >= 0) {
      // Update quantity if exists
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += 1;
      setItems(updatedItems);
      toast.success(`Increased quantity for ${medicine.name}`);
    } else {
      // Add new medicine
      setItems((prev) => [
        ...prev,
        {
          medicineId: medicine.id,
          name: medicine.name,
          price,
          quantity: 1,
          requiresPrescription: !!medicine.requiresPrescription
        },
      ]);
      toast.success(`Added: ${medicine.name}`);
    }
  };

  // ✅ Remove medicine by index
  const handleRemoveMedicine = (index) => {
    const medicineName = items[index].name;
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.info(`Removed: ${medicineName}`);
  };

  // ✅ Update quantity
  const handleQuantityChange = (index, newQty) => {
    if (newQty === '' || isNaN(newQty)) {
      const updated = [...items];
      updated[index].quantity = '';
      setItems(updated);
      return;
    }

    const qty = parseInt(newQty, 10);
    if (qty < 1) return;

    const updated = [...items];
    updated[index].quantity = qty;
    setItems(updated);
  };

  // ✅ Calculate total
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * (item.quantity || 0), 0);
  };

  // ✅ Calculate subtotal
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * (item.quantity || 0), 0);
  };

  // ✅ Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Only image files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      return;
    }

    setPrescriptionPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    toast.success("✅ Prescription photo uploaded!");
  };

  // ✅ Open camera or gallery
  const openCamera = () => cameraInputRef.current?.click();
  const openGallery = () => galleryInputRef.current?.click();

  // ✅ Clear photo
  const clearPhoto = () => {
    setPrescriptionPhoto(null);
    setPhotoPreview("");
    toast.info("Prescription photo removed.");
  };

  // ✅ Navigation between steps
  const handleNext = () => {
    if (activeStep === 0 && (!customerName.trim() && !customerPhone.trim())) {
      toast.info("Customer details are optional. You can proceed with walk-in customer.");
    }
    
    if (activeStep === 1 && items.length === 0) {
      toast.error("Please add at least one medicine before proceeding.");
      return;
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // ✅ Submit order
  const handleSubmit = async () => {
    if (items.length === 0) {
      setError("Please add at least one medicine");
      return;
    }

    // Validate items
    for (let item of items) {
      if (!item.medicineId || !item.quantity || item.quantity < 1) {
        toast.error("All items must have valid medicine and quantity ≥ 1");
        return;
      }
    }

    // Enforce prescription photo
    if (requiresPrescription && !prescriptionPhoto) {
      setError("This order contains prescription-only medicines. Please upload a photo of the prescription.");
      toast.warn("📸 Prescription required!");
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append("items", JSON.stringify(
      items.map(item => ({
        id: item.medicineId,
        quantity: Number(item.quantity)
      }))
    ));
    formData.append("customerName", customerName.trim() || "Walk-in Customer");
    formData.append("customerPhone", customerPhone.trim() || "");
    formData.append("status", "completed");

    if (prescriptionPhoto) {
      formData.append("prescriptionPhoto", prescriptionPhoto);
    }

    setLoading(true);
    setError("");

    try {
      const response = await createOrder(formData);
      const orderId = response.data?.order?.id;
      if (!orderId) throw new Error("No order ID returned");

      toast.success("🎉 Order created successfully!");
      setTimeout(() => {
        navigate(`/receipt/${orderId}`);
      }, 1500);
    } catch (err) {
      console.error("❌ Full error:", err.response?.data || err.message);
      const message = err.response?.data?.message || err.message;
      setError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Person color="primary" />
                <Typography variant="h6">Customer Information</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Name"
                    fullWidth
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., John Doe"
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Phone"
                    fullWidth
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g., +251912345678"
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                Customer details are optional. If not provided, order will be saved as "Walk-in Customer".
              </Alert>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LocalHospital color="primary" />
                  <Typography variant="h6">Medicines</Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => setOpenModal(true)}
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  Add Medicine
                </Button>

                {items.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                          <TableCell><strong>Medicine</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Price</strong></TableCell>
                          <TableCell><strong>Quantity</strong></TableCell>
                          <TableCell><strong>Total</strong></TableCell>
                          <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item, index) => (
                          <TableRow 
                            key={index}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                              } 
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight="medium">
                                {item.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.requiresPrescription ? '℞ Only' : 'OTC'}
                                color={item.requiresPrescription ? 'error' : 'success'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
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
                            <TableCell>
                              <Typography fontWeight="bold" color="primary">
                                ${(item.price * item.quantity).toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleRemoveMedicine(index)}
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                    <LocalHospital sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No Medicines Added
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Click "Add Medicine" to start building your order
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>

            {/* Prescription Photo Section */}
            {requiresPrescription && (
              <Card sx={{ border: `2px solid ${theme.palette.warning.main}`, bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Warning color="warning" />
                    <Typography variant="h6" color="warning.dark">
                      Prescription Required
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    This order contains prescription-only medicines. You must upload a clear photo of the prescription.
                  </Typography>

                  {!photoPreview ? (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={cameraInputRef}
                        type="file"
                        capture="environment"
                        onChange={handleFileChange}
                      />
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        ref={galleryInputRef}
                        type="file"
                        onChange={handleFileChange}
                      />

                      <Button
                        variant="contained"
                        startIcon={<PhotoCamera />}
                        onClick={openCamera}
                        color="warning"
                      >
                        Take Photo
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={openGallery}
                      >
                        Choose from Gallery
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>Prescription Photo:</Typography>
                      <Box
                        component="img"
                        src={photoPreview}
                        alt="Prescription"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: 2,
                          border: `2px solid ${theme.palette.success.main}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Box sx={{ mt: 1 }}>
                        <Button
                          startIcon={<Close />}
                          onClick={clearPhoto}
                          color="error"
                          size="small"
                        >
                          Remove Photo
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        );

      case 2:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={3}>
                <Receipt color="primary" />
                <Typography variant="h6">Order Summary</Typography>
              </Box>

              {/* Customer Info Summary */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="subtitle1" gutterBottom>
                  Customer Details
                </Typography>
                <Typography><strong>Name:</strong> {customerName || "Walk-in Customer"}</Typography>
                <Typography><strong>Phone:</strong> {customerPhone || "Not provided"}</Typography>
              </Paper>

              {/* Order Items Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Order Items ({items.length})
                </Typography>
                {items.map((item, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography fontWeight="medium">{item.name}</Typography>
                      <Chip
                        label={item.requiresPrescription ? '℞ Only' : 'OTC'}
                        color={item.requiresPrescription ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="body2">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </Typography>
                      <Typography fontWeight="bold" color="primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Total Section */}
              <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    Total Amount:
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    ${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Paper>

              {requiresPrescription && prescriptionPhoto && (
                <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircle />}>
                  Prescription photo uploaded successfully
                </Alert>
              )}
            </CardContent>
          </Card>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
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
        <ShoppingCartCheckout sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Create New Order
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Step-by-step order creation process
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <IconButton size="small" onClick={() => setError("")}>
            <Close />
          </IconButton>
        }>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      {getStepContent(activeStep)}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          variant="outlined"
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
              sx={{
                px: 4,
                borderRadius: 3,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Processing...' : 'Complete Order'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === 1 && items.length === 0}
              endIcon={<CheckCircle />}
            >
              {activeStep === steps.length - 2 ? 'Review Order' : 'Next'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Medicine Search Modal */}
      <MedicineSearchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAddMedicine={handleAddMedicine}
      />

      {/* Hidden file inputs */}
      <input
        accept="image/*"
        style={{ display: 'none' }}
        ref={cameraInputRef}
        type="file"
        capture="environment"
        onChange={handleFileChange}
      />
      <input
        accept="image/*"
        style={{ display: 'none' }}
        ref={galleryInputRef}
        type="file"
        onChange={handleFileChange}
      />
    </Container>
  );
}