// src/pages/ReceiptPage.js
import React, { useEffect, useState, useRef } from "react";
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

// ✅ Add translation hook
import { useTranslation } from 'react-i18next';

export default function ReceiptPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();
  const receiptRef = useRef(null);

  // ✅ Initialize translation
  const { t } = useTranslation();

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!orderId) {
        setError(t('receipt.orderIdMissing'));
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching receipt for order ID: ${orderId}`);
        const response = await generateReceipt(orderId);
        console.log("📦 Receipt response:", response.data);

        const receiptData = response.data.receipt;

        if (!receiptData || !receiptData.orderId) {
          throw new Error(t('receipt.invalidReceiptStructure'));
        }

        setReceipt(receiptData);
      } catch (err) {
        console.error("Failed to load receipt:", err);

        if (err.response?.status === 404) {
          setError(t('receipt.receiptNotFound'));
        } else if (err.request) {
          setError(t('receipt.networkError'));
        } else {
          setError(err.message || t('receipt.failedToLoad'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [orderId, t]);

  const handleDownloadPDF = () => {
    if (!receipt) return;

    try {
      const pdf = generatePDFReceipt(receipt);
      pdf.save(`receipt-${receipt.receiptId}.pdf`);
      toast.success(t('receipt.downloadSuccess'));
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error(t('receipt.pdfGenerationFailed'));
    }
  };

  const handlePrint = () => {
    if (!receiptRef.current) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    const printContent = receiptRef.current.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receipt.receiptId}</title>
          <meta charset="utf-8">
          <style>
            /* Reset and base styles */
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.4; 
              color: #000; 
              background: white; 
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            
            /* Receipt container */
            .receipt-container { 
              border: 2px solid #000; 
              padding: 25px; 
              background: white;
              box-shadow: none !important;
            }
            
            /* Header styles */
            .pharmacy-header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px dashed #000;
              padding-bottom: 15px;
            }
            .pharmacy-name { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 8px;
            }
            .pharmacy-details { 
              font-size: 14px; 
              margin-bottom: 4px;
            }
            
            /* Receipt details */
            .receipt-details { 
              margin: 20px 0; 
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 15px;
            }
            .detail-card { 
              flex: 1; 
              min-width: 200px;
              border: 1px solid #000;
              padding: 12px;
              background: #f9f9f9;
            }
            .detail-title { 
              font-weight: bold; 
              margin-bottom: 8px;
              font-size: 16px;
            }
            
            /* Items table */
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            .items-table th { 
              background: #f0f0f0; 
              border: 1px solid #000;
              padding: 10px;
              text-align: left;
              font-weight: bold;
            }
            .items-table td { 
              border: 1px solid #000; 
              padding: 8px 10px;
            }
            .items-table .quantity { 
              text-align: center; 
            }
            .items-table .price { 
              text-align: right; 
            }
            
            /* Totals section */
            .totals-section { 
              background: #f8fff8; 
              border: 1px solid #000;
              padding: 15px;
              margin: 20px 0;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px;
            }
            .final-total { 
              font-weight: bold; 
              font-size: 18px;
              border-top: 1px dashed #000;
              padding-top: 8px;
              margin-top: 8px;
            }
            
            /* Prescription section */
            .prescription-card { 
              border: 2px solid #ffa726; 
              background: #fffbf0;
              padding: 15px;
              margin: 15px 0;
            }
            
            /* Footer */
            .receipt-footer { 
              text-align: center; 
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px dashed #000;
              font-size: 12px;
            }
            
            /* Utility classes */
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .mb-2 { margin-bottom: 10px; }
            .mt-2 { margin-top: 10px; }
            
            /* Hide elements not needed for print */
            .no-print { display: none !important; }
            
            @media print {
              body { 
                padding: 0; 
                margin: 0;
              }
              .receipt-container { 
                border: none; 
                padding: 15px;
                box-shadow: none !important;
              }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('receipt.shareTitle', { receiptId: receipt.receiptId }),
          text: t('receipt.shareText', { orderId: receipt.orderId }),
          url: window.location.href,
        });
        toast.success(t('receipt.shareSuccess'));
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      toast.info(t('receipt.shareNotSupported'));
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
          {t('receipt.generatingReceipt')}
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
            {t('receipt.createNewOrder')}
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate("/dashboard")}
            startIcon={<ArrowBack />}
          >
            {t('receipt.backToDashboard')}
          </Button>
        </Box>
      </Container>
    );
  }

  if (!receipt) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          {t('receipt.noReceiptData')}
        </Alert>
        <Button 
          onClick={() => navigate("/orders/create")} 
          sx={{ mt: 2 }}
          startIcon={<ReceiptLong />}
        >
          {t('receipt.createNewOrder')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }} className="no-print">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/dashboard")}
          sx={{ mb: 2 }}
        >
          {t('receipt.backToDashboard')}
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
            {t('receipt.orderComplete')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {t('receipt.thankYouPurchase')}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Receipt - This is what gets printed */}
        <Grid item xs={12} lg={8}>
          <Paper 
            ref={receiptRef}
            sx={{ 
              p: 4, 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
            className="receipt-print"
          >
            {/* Pharmacy Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }} className="pharmacy-header">
              <LocalPharmacy sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom className="pharmacy-name">
                {receipt.pharmacy.name}
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom className="pharmacy-details">
                {receipt.pharmacy.address}
              </Typography>
              <Typography variant="body2" color="textSecondary" className="pharmacy-details">
                📞 {receipt.pharmacy.phone}
              </Typography>
              {receipt.pharmacy.email && (
                <Typography variant="body2" color="textSecondary" className="pharmacy-details">
                  ✉️ {receipt.pharmacy.email}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Receipt Metadata */}
            <Box className="receipt-details">
              <Box className="detail-card">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ReceiptLong color="primary" />
                  <Typography variant="h6" className="detail-title">{t('receipt.receiptDetails')}</Typography>
                </Box>
                <Typography><strong>{t('receipt.receiptId')}:</strong> {receipt.receiptId}</Typography>
                <Typography><strong>{t('receipt.orderId')}:</strong> {receipt.orderId}</Typography>
                <Typography>
                  <strong>{t('receipt.date')}:</strong> {new Date(receipt.date).toLocaleDateString()}
                </Typography>
                <Typography>
                  <strong>{t('receipt.time')}:</strong> {new Date(receipt.date).toLocaleTimeString()}
                </Typography>
              </Box>
              
              <Box className="detail-card">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Person color="secondary" />
                  <Typography variant="h6" className="detail-title">{t('receipt.customerInfo')}</Typography>
                </Box>
                <Typography><strong>{t('receipt.name')}:</strong> {receipt.customer.name}</Typography>
                <Typography><strong>{t('receipt.id')}:</strong> {receipt.customer.id}</Typography>
                {receipt.customer.phone && (
                  <Typography><strong>{t('receipt.phone')}:</strong> {receipt.customer.phone}</Typography>
                )}
              </Box>
            </Box>

            {/* Cashier Info */}
            <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>{t('receipt.servedBy')}:</strong> {receipt.cashier.name}
              </Typography>
              <Chip 
                label={t('receipt.status', { status: receipt.status })} 
                color={receipt.status === 'completed' ? 'success' : 'warning'}
                size="small"
              />
            </Box>

            {/* Items Table */}
            <Typography variant="h6" gutterBottom sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MedicalServices />
              {t('receipt.orderItems')}
            </Typography>
            
            <TableContainer 
              component={Paper} 
              variant="outlined"
              sx={{ borderRadius: 2, overflow: 'hidden' }}
              className="items-table-container"
            >
              <Table className="items-table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell><strong>{t('receipt.medicine')}</strong></TableCell>
                    <TableCell align="center"><strong>{t('receipt.quantity')}</strong></TableCell>
                    <TableCell align="right"><strong>{t('receipt.unitPrice')}</strong></TableCell>
                    <TableCell align="right"><strong>{t('receipt.total')}</strong></TableCell>
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
                      <TableCell align="center" className="quantity">
                        <Chip 
                          label={item.quantity} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" className="price">
                        ${parseFloat(item.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell align="right" className="price">
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
              className="totals-section"
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }} className="total-row">
                <Typography>{t('receipt.subtotal')}:</Typography>
                <Typography>${parseFloat(receipt.subtotal).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }} className="total-row">
                <Typography>{t('receipt.tax', { rate: receipt.taxRate || 15 })}:</Typography>
                <Typography>${parseFloat(receipt.tax).toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }} className="total-row final-total">
                <Typography variant="h5" fontWeight="bold">
                  {t('receipt.total')}:
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
                className="prescription-card"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Verified color="warning" />
                  <Typography variant="h6">{t('receipt.prescriptionInformation')}</Typography>
                </Box>
                <Typography><strong>{t('receipt.prescriptionId')}:</strong> {receipt.prescription.id}</Typography>
                <Typography><strong>{t('receipt.details')}:</strong> {receipt.prescription.details}</Typography>
                {receipt.prescription.doctor && (
                  <Typography><strong>{t('receipt.prescribingDoctor')}:</strong> {receipt.prescription.doctor}</Typography>
                )}
              </Card>
            )}

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: `1px dashed ${theme.palette.divider}` }} className="receipt-footer">
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {t('receipt.thankYouMessage', { pharmacyName: receipt.pharmacy.name })}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('receipt.contactMessage', { phone: receipt.pharmacy.phone })}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                {t('receipt.generatedOn', { date: new Date().toLocaleString() })}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Action Sidebar - Hidden during print */}
        <Grid item xs={12} lg={4} className="no-print">
          <Card sx={{ position: 'sticky', top: 100, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Download />
                {t('receipt.receiptActions')}
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
                  {t('receipt.downloadPDF')}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('receipt.printReceipt')}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={handleShare}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('receipt.shareReceipt')}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                  onClick={() => toast.info(t('receipt.emailComingSoon'))}
                >
                  {t('receipt.emailReceipt')}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLong />
                {t('receipt.quickActions')}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => navigate("/orders/create")}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('receipt.createNewOrder')}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate("/dashboard")}
                  size="large"
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('receipt.backToDashboard')}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card sx={{ mt: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('receipt.orderSummary')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{t('receipt.items')}:</Typography>
                <Typography variant="body2">{receipt.items.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{t('receipt.subtotal')}:</Typography>
                <Typography variant="body2">${parseFloat(receipt.subtotal).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{t('receipt.tax')}:</Typography>
                <Typography variant="body2">${parseFloat(receipt.tax).toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">{t('receipt.total')}:</Typography>
                <Typography variant="h6" color="success.main">
                  ${parseFloat(receipt.total).toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}