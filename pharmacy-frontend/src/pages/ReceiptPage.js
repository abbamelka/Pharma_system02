// src/pages/ReceiptPage.js
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
  Divider,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import { 
  Download, 
  Print, 
  Share, 
  Email, 
  ArrowBack,
  ReceiptLong,
  LocalPharmacy,
  Person,
  CalendarToday,
  Payment,
  Close,
  MedicalServices,
  Verified
} from "@mui/icons-material";
import { generateReceipt } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { generatePDFReceipt } from "../utils/pdfReceiptGenerator";

export default function ReceiptPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!orderId) {
        setError("Order ID missing");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching receipt for order ID: ${orderId}`);
        const response = await generateReceipt(orderId);
        console.log("📦 Receipt response:", response.data);

        const receiptData = response.data.receipt;

        if (!receiptData || !receiptData.orderId) {
          throw new Error("Invalid receipt structure");
        }

        setReceipt(receiptData);
      } catch (err) {
        console.error("Failed to load receipt:", err);

        if (err.response?.status === 404) {
          setError("Receipt not found. Order may not exist.");
        } else if (err.request) {
          setError("Network error: Unable to reach server");
        } else {
          setError(err.message || "Failed to load receipt");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [orderId]);

  const handleDownloadPDF = () => {
    if (!receipt) return;

    try {
      const pdf = generatePDFReceipt(receipt);
      pdf.save(`receipt-${receipt.receiptId}.pdf`);
      toast.success("📄 Receipt downloaded successfully!");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to generate PDF receipt");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receipt.receiptId}`,
          text: `Pharmacy receipt for order ${receipt.orderId}`,
          url: window.location.href,
        });
        toast.success("Receipt shared successfully!");
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      toast.info("Web Share API not supported in your browser");
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
          Generating your receipt...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={() => setError("")}>
              <Close />
            </IconButton>
          }
        >
          {error}
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => navigate("/orders/create")}
            startIcon={<ReceiptLong />}
          >
            Create New Order
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate("/dashboard")}
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  if (!receipt) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          No receipt data available
        </Alert>
        <Button 
          onClick={() => navigate("/orders/create")} 
          sx={{ mt: 2 }}
          startIcon={<ReceiptLong />}
        >
          Create New Order
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboard")}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Box 
          sx={{ 
            textAlign: "center", 
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
            borderRadius: 4,
            py: 4,
            px: 3,
            color: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            mb: 4
          }}
        >
          <Verified sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Order Complete!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Thank you for your purchase
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Receipt */}
        <Grid item xs={12} lg={8}>
          <Paper 
            sx={{ 
              p: 4, 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
            className="receipt-print"
          >
            {/* Pharmacy Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LocalPharmacy sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                {receipt.pharmacy.name}
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {receipt.pharmacy.address}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                📞 {receipt.pharmacy.phone}
              </Typography>
              {receipt.pharmacy.email && (
                <Typography variant="body2" color="textSecondary">
                  ✉️ {receipt.pharmacy.email}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Receipt Metadata */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ReceiptLong color="primary" />
                    <Typography variant="h6">Receipt Details</Typography>
                  </Box>
                  <Typography><strong>Receipt ID:</strong> {receipt.receiptId}</Typography>
                  <Typography><strong>Order ID:</strong> {receipt.orderId}</Typography>
                  <Typography>
                    <strong>Date:</strong> {new Date(receipt.date).toLocaleDateString()}
                  </Typography>
                  <Typography>
                    <strong>Time:</strong> {new Date(receipt.date).toLocaleTimeString()}
                  </Typography>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Person color="secondary" />
                    <Typography variant="h6">Customer Info</Typography>
                  </Box>
                  <Typography><strong>Name:</strong> {receipt.customer.name}</Typography>
                  <Typography><strong>ID:</strong> {receipt.customer.id}</Typography>
                  {receipt.customer.phone && (
                    <Typography><strong>Phone:</strong> {receipt.customer.phone}</Typography>
                  )}
                </Card>
              </Grid>
            </Grid>

            {/* Cashier Info */}
            <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Served by:</strong> {receipt.cashier.name}
              </Typography>
              <Chip 
                label={`Status: ${receipt.status}`} 
                color={receipt.status === 'completed' ? 'success' : 'warning'}
                size="small"
              />
            </Box>

            {/* Items Table */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicalServices />
              Order Items
            </Typography>
            
            <TableContainer 
              component={Paper} 
              variant="outlined"
              sx={{ borderRadius: 2, overflow: 'hidden' }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell><strong>Medicine</strong></TableCell>
                    <TableCell align="center"><strong>Qty</strong></TableCell>
                    <TableCell align="right"><strong>Unit Price</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipt.items.map((item, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                        } 
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight="medium">{item.name}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={item.quantity} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        ${parseFloat(item.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold" color="primary">
                          ${parseFloat(item.total).toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Totals */}
            <Box 
              sx={{ 
                mt: 3, 
                p: 3, 
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${parseFloat(receipt.subtotal).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax ({receipt.taxRate || 15}%):</Typography>
                <Typography>${parseFloat(receipt.tax).toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" fontWeight="bold">
                  TOTAL:
                </Typography>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  ${parseFloat(receipt.total).toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Prescription Section */}
            {receipt.prescription && (
              <Card 
                sx={{ 
                  mt: 3, 
                  p: 3, 
                  border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                  backgroundColor: alpha(theme.palette.warning.main, 0.05)
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Verified color="warning" />
                  <Typography variant="h6">Prescription Information</Typography>
                </Box>
                <Typography><strong>Prescription ID:</strong> {receipt.prescription.id}</Typography>
                <Typography><strong>Details:</strong> {receipt.prescription.details}</Typography>
                {receipt.prescription.doctor && (
                  <Typography><strong>Prescribing Doctor:</strong> {receipt.prescription.doctor}</Typography>
                )}
              </Card>
            )}

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: `1px dashed ${theme.palette.divider}` }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Thank you for choosing {receipt.pharmacy.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                For questions or concerns, please contact us at {receipt.pharmacy.phone}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Receipt generated on {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Action Sidebar */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ position: 'sticky', top: 100, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Download />
                Receipt Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Download />}
                  onClick={handleDownloadPDF}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Download PDF
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Print Receipt
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShare}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Share Receipt
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={() => toast.info("Email feature coming soon!")}
                >
                  Email Receipt
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLong />
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => navigate("/orders/create")}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Create New Order
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate("/dashboard")}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Back to Dashboard
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card sx={{ mt: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Items:</Typography>
                <Typography variant="body2">{receipt.items.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">${parseFloat(receipt.subtotal).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Tax:</Typography>
                <Typography variant="body2">${parseFloat(receipt.tax).toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="success.main">
                  ${parseFloat(receipt.total).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .MuiAppBar-root,
          .MuiDrawer-root,
          .receipt-actions {
            display: none !important;
          }
          .receipt-print {
            box-shadow: none !important;
            border: 1px solid #000 !important;
          }
        }
      `}</style>
    </Container>
  );
}