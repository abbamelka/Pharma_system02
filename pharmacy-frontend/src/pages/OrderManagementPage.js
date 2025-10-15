// src/pages/OrderManagementPage.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  alpha,
  useTheme,
  Badge,
} from "@mui/material";
import { 
  PictureAsPdf, 
  Visibility, 
  Search as SearchIcon, 
  Download, 
  Print, 
  Refresh,
  FilterList,
  Receipt,
  Person,
  CalendarToday,
  Payment,
  LocalHospital,
  MoreVert,
  ZoomIn,
  ZoomOut,
  Close
} from '@mui/icons-material';
import { getAllOrders } from "../services/api";
import { useAuth } from "../context/AuthContext";

// ✅ Add translation hook
import { useTranslation } from 'react-i18next';

// ✅ Define API base dynamically
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // For viewing prescription
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [imageZoom, setImageZoom] = useState(1);

  const { user } = useAuth(); // Get current user role
  const theme = useTheme();

  // ✅ Initialize translation
  const { t } = useTranslation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getAllOrders();
      const data = response.data?.orders || [];

      // Sort by newest first
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
      setError("");
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(t('order.couldNotLoadOrders'));
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term and filters
  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      order.id.toString().includes(term) ||
      (order.customerName && order.customerName.toLowerCase().includes(term)) ||
      (order.cashier?.name && order.cashier.name.toLowerCase().includes(term))
    );

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    const matchesDate = dateFilter === "all" || isWithinDateRange(order.createdAt, dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Date filter helper
  const isWithinDateRange = (dateString, range) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        return date >= today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return date >= monthAgo;
      default:
        return true;
    }
  };

  // Handle prescription photo view
  const handleViewPrescription = (order) => {
    if (!order.prescriptionPhoto) return;

    const imagePath = `${API_BASE_URL}/${order.prescriptionPhoto}`;
    setSelectedImage(imagePath);
    setOpenImageDialog(true);
    setImageZoom(1);

    console.log("🖼 Viewing prescription:", imagePath);
  };

  // Handle download with CORS-safe fallback
  const handleDownload = () => {
    const filename = selectedImage.split('/').pop() || 'prescription.jpg';

    fetch(selectedImage, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(err => {
        console.warn("Fetch failed, falling back to direct download:", err);
        const link = document.createElement('a');
        link.href = selectedImage;
        link.setAttribute('download', filename);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - Order Management</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; max-height: 100vh; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${selectedImage}" onload="window.print(); window.onfocus = function() { setTimeout(window.close, 500); }" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Image zoom controls
  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setImageZoom(1);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'processing': return 'info';
      default: return 'default';
    }
  };

  // Statistics
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

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
        <Receipt sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {t('order.orderManagement')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('order.manageTrackOrders')}
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 2, mx: 'auto' }}>
                <Receipt />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {totalOrders}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('order.totalOrders')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mb: 2, mx: 'auto' }}>
                <Payment />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {completedOrders}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('order.completedOrders')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', mb: 2, mx: 'auto' }}>
                <LocalHospital />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                ${totalRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('order.totalRevenue')}
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
                label={t('order.searchOrders')}
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('order.searchPlaceholder')}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('order.statusFilter')}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t('order.statusFilter')}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="all">{t('order.allStatus')}</MenuItem>
                  <MenuItem value="completed">{t('order.completed')}</MenuItem>
                  <MenuItem value="pending">{t('order.pending')}</MenuItem>
                  <MenuItem value="processing">{t('order.processing')}</MenuItem>
                  <MenuItem value="cancelled">{t('order.cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('order.dateFilter')}</InputLabel>
                <Select
                  value={dateFilter}
                  label={t('order.dateFilter')}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <MenuItem value="all">{t('order.allTime')}</MenuItem>
                  <MenuItem value="today">{t('order.today')}</MenuItem>
                  <MenuItem value="week">{t('order.last7Days')}</MenuItem>
                  <MenuItem value="month">{t('order.last30Days')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={fetchOrders}
                disabled={loading}
                fullWidth
                sx={{ height: '56px' }}
              >
                {t('order.refresh')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
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
      )}

      {/* Results Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {t('order.showingOrders', { count: filteredOrders.length, total: orders.length })}
        </Typography>
        {searchTerm && (
          <Chip 
            label={t('order.searchFor', { term: searchTerm })}
            onDelete={() => setSearchTerm("")}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" my={8} flexDirection="column" gap={2}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="textSecondary">
            {t('order.loadingOrders')}
          </Typography>
        </Box>
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
                <TableCell><strong>{t('order.orderId')}</strong></TableCell>
                <TableCell><strong>{t('order.customer')}</strong></TableCell>
                <TableCell><strong>{t('order.cashier')}</strong></TableCell>
                <TableCell align="right"><strong>{t('order.total')}</strong></TableCell>
                <TableCell><strong>{t('order.status')}</strong></TableCell>
                <TableCell><strong>{t('order.dateTime')}</strong></TableCell>
                <TableCell><strong>{t('order.prescription')}</strong></TableCell>
                <TableCell align="center"><strong>{t('order.actions')}</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <LocalHospital sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      {t('order.noOrdersFound')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                        ? t('order.tryAdjustingSearch') 
                        : t('order.noOrdersCreated')
                      }
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                      } 
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        #{order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person color="action" />
                        <Typography>
                          {order.customerName || t('order.walkInCustomer')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.cashier?.name || t('order.userId', { id: order.cashierId })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        ${parseFloat(order.total).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status.toUpperCase()}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{ fontWeight: 'bold', minWidth: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {order.prescriptionPhoto ? (
                        <Badge color="primary" badgeContent="✓">
                          <Chip 
                            icon={<PictureAsPdf />} 
                            label={t('order.uploaded')}
                            color="primary" 
                            size="small"
                            variant="outlined"
                          />
                        </Badge>
                      ) : (
                        <Chip 
                          label={t('order.notRequired')}
                          size="small" 
                          variant="outlined"
                          color="default"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {order.prescriptionPhoto && (
                        <Tooltip title={t('order.viewPrescription')}>
                          <IconButton
                            color="primary"
                            onClick={() => handleViewPrescription(order)}
                            disabled={!['pharmacist', 'admin'].includes(user?.role)}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Enhanced Prescription Viewer Modal */}
      <Dialog 
        open={openImageDialog} 
        onClose={() => setOpenImageDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: alpha(theme.palette.primary.main, 0.04)
        }}>
          <Typography variant="h6" fontWeight="bold">
            {t('order.prescriptionDocument')}
          </Typography>
          <IconButton onClick={() => setOpenImageDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedImage ? (
            <Box textAlign="center" my={2}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Tooltip title={t('order.zoomOut')}>
                  <IconButton onClick={handleZoomOut} disabled={imageZoom <= 0.5}>
                    <ZoomOut />
                  </IconButton>
                </Tooltip>
                <Chip 
                  label={`${Math.round(imageZoom * 100)}%`} 
                  onClick={handleZoomReset}
                  clickable
                  variant="outlined"
                />
                <Tooltip title={t('order.zoomIn')}>
                  <IconButton onClick={handleZoomIn} disabled={imageZoom >= 3}>
                    <ZoomIn />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ 
                overflow: 'auto', 
                maxHeight: '60vh', 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 2,
                backgroundColor: 'background.default'
              }}>
                <img
                  src={selectedImage}
                  alt="Prescription"
                  style={{
                    maxWidth: '100%',
                    transform: `scale(${imageZoom})`,
                    transition: 'transform 0.3s ease',
                    transformOrigin: 'center center'
                  }}
                  onError={(e) => {
                    console.error("❌ Failed to load image:", selectedImage);
                    e.target.style.display = 'none';
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Typography color="textSecondary" textAlign="center" py={4}>
              {t('order.noImageAvailable')}
            </Typography>
          )}
        </DialogContent>

        {selectedImage && ['pharmacist', 'admin'].includes(user?.role) && (
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Download />}
              onClick={handleDownload}
            >
              {t('order.download')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Print />}
              onClick={handlePrint}
            >
              {t('order.print')}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Container>
  );
}