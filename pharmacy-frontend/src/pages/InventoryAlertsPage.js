// src/pages/InventoryAlertsPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
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
  Button,
  Tooltip,
  alpha,
  useTheme,
  Badge,
  IconButton,
  TablePagination, // ✅ Added import
} from "@mui/material";
import {
  Warning,
  Schedule,
  Dangerous,
  Inventory,
  Refresh,
  TrendingDown,
  TrendingUp,
  CalendarToday,
  Business,
  QrCode,
  CheckCircle,
  LocalHospital,
  NotificationImportant,
} from "@mui/icons-material";
import { getLowStockAlerts, getExpiringSoonAlerts } from "../services/api";
import { toast } from "react-toastify";

// ✅ Add translation hook
import { useTranslation } from 'react-i18next';

export default function InventoryAlertsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiringSoonAlerts, setExpiringSoonAlerts] = useState([]);
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const theme = useTheme();

  // ✅ Initialize translation
  const { t } = useTranslation();

  // ✅ Pagination state for each tab
  const [lowStockPage, setLowStockPage] = useState(0);
  const [expiringSoonPage, setExpiringSoonPage] = useState(0);
  const [expiredPage, setExpiredPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");

    try {
      const [lowStockRes, expiringRes] = await Promise.all([
        getLowStockAlerts(5),
        getExpiringSoonAlerts(30)
      ]);

      const lowStockData = lowStockRes.data?.batches || [];
      const expiringData = expiringRes.data?.batches || [];

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const mappedLowStock = lowStockData.map(item => ({
        medicineName: item.Medicine?.name || t('alerts.unknown'),
        batchNumber: item.batchNumber,
        currentStock: item.quantity,
        expiryDate: item.expiryDate,
        supplierName: item.Supplier?.name || t('common.na'),
        medicineId: item.Medicine?.id,
        category: item.Medicine?.category
      }));

      const mappedExpiring = [];
      const mappedExpired = [];

      expiringData.forEach(item => {
        const expiry = new Date(item.expiryDate);
        expiry.setHours(0, 0, 0, 0);

        if (expiry < now) {
          mappedExpired.push({
            medicineName: item.Medicine?.name || t('alerts.unknown'),
            batchNumber: item.batchNumber,
            currentStock: item.quantity,
            expiryDate: item.expiryDate,
            supplierName: item.Supplier?.name || t('common.na'),
            medicineId: item.Medicine?.id,
            category: item.Medicine?.category
          });
        } else {
          mappedExpiring.push({
            medicineName: item.Medicine?.name || t('alerts.unknown'),
            batchNumber: item.batchNumber,
            currentStock: item.quantity,
            expiryDate: item.expiryDate,
            supplierName: item.Supplier?.name || t('common.na'),
            medicineId: item.Medicine?.id,
            category: item.Medicine?.category
          });
        }
      });

      mappedExpiring.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      mappedExpired.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

      setLowStockAlerts(mappedLowStock);
      setExpiringSoonAlerts(mappedExpiring);
      setExpiredBatches(mappedExpired);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError(t('alerts.failedToLoadAlerts'));
      toast.error(`❌ ${t('alerts.failedToLoadAlerts')}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // ✅ Reset pagination when switching tabs
    setLowStockPage(0);
    setExpiringSoonPage(0);
    setExpiredPage(0);
  };

  // ✅ Pagination handlers
  const handleChangePage = (event, newPage, type) => {
    switch (type) {
      case 'lowStock':
        setLowStockPage(newPage);
        break;
      case 'expiringSoon':
        setExpiringSoonPage(newPage);
        break;
      case 'expired':
        setExpiredPage(newPage);
        break;
      default:
        break;
    }
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    // ✅ Reset all pagination to first page
    setLowStockPage(0);
    setExpiringSoonPage(0);
    setExpiredPage(0);
  };

  // ✅ Paginated data for each tab
  const paginatedLowStock = lowStockAlerts.slice(
    lowStockPage * rowsPerPage,
    lowStockPage * rowsPerPage + rowsPerPage
  );

  const paginatedExpiringSoon = expiringSoonAlerts.slice(
    expiringSoonPage * rowsPerPage,
    expiringSoonPage * rowsPerPage + rowsPerPage
  );

  const paginatedExpired = expiredBatches.slice(
    expiredPage * rowsPerPage,
    expiredPage * rowsPerPage + rowsPerPage
  );

  // Statistics
  const totalAlerts = lowStockAlerts.length + expiringSoonAlerts.length + expiredBatches.length;
  const criticalAlerts = lowStockAlerts.filter(item => item.currentStock < 3).length + 
                       expiredBatches.length;

  const getStockColor = (stock) => {
    if (stock < 3) return 'error';
    if (stock < 5) return 'warning';
    return 'info';
  };

  const getExpiryStatus = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { color: 'error', label: t('alerts.expired'), icon: <Dangerous /> };
    if (daysUntilExpiry <= 7) return { color: 'error', label: t('alerts.daysLeft', { days: daysUntilExpiry }), icon: <Dangerous /> };
    if (daysUntilExpiry <= 30) return { color: 'warning', label: t('alerts.daysLeft', { days: daysUntilExpiry }), icon: <Warning /> };
    return { color: 'info', label: t('alerts.daysLeft', { days: daysUntilExpiry }), icon: <Schedule /> };
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'prescription': return 'error';
      case 'OTC': return 'success';
      case 'supplement': return 'warning';
      default: return 'default';
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
          {t('alerts.loadingAlerts')}
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
            <Button color="inherit" onClick={fetchAlerts}>
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
          background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`,
          borderRadius: 4,
          py: 4,
          px: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <NotificationImportant sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {t('alerts.inventoryAlerts')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('alerts.criticalNotifications')}
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mb: 2, mx: 'auto' }}>
                <TrendingDown />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {totalAlerts}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('alerts.totalAlerts')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mb: 2, mx: 'auto' }}>
                <Warning />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {lowStockAlerts.length}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('alerts.lowStock')}
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
                {expiringSoonAlerts.length}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('alerts.expiringSoon')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mb: 2, mx: 'auto' }}>
                <Dangerous />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {expiredBatches.length}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {t('alerts.expired')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Bar */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory />
              {t('alerts.alertDashboard')}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAlerts}
              disabled={loading}
            >
              {t('alerts.refreshAlerts')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
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
              icon={<Badge badgeContent={lowStockAlerts.length} color="error">
                <Warning />
              </Badge>} 
              iconPosition="start"
              label={t('alerts.lowStockAlerts')} 
            />
            <Tab 
              icon={<Badge badgeContent={expiringSoonAlerts.length} color="warning">
                <Schedule />
              </Badge>} 
              iconPosition="start"
              label={t('alerts.expiringSoon')} 
            />
            <Tab 
              icon={<Badge badgeContent={expiredBatches.length} color="error">
                <Dangerous />
              </Badge>} 
              iconPosition="start"
              label={t('alerts.expiredBatches')} 
            />
          </Tabs>

          {/* Low Stock Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="error" />
                  {t('alerts.lowStockMedicines')}
                </Typography>
                <Chip 
                  label={t('alerts.alertsCount', { count: lowStockAlerts.length })} 
                  color="error" 
                  variant="outlined" 
                />
              </Box>

              {lowStockAlerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <TrendingUp sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    {t('alerts.allStockHealthy')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('alerts.noLowStock')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha(theme.palette.error.main, 0.04) }}>
                          <TableCell><strong>{t('alerts.medicine')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.batch')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.category')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.currentStock')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.expiryDate')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.supplier')}</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedLowStock.map((item, idx) => (
                          <TableRow 
                            key={idx}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: alpha(theme.palette.error.main, 0.02) 
                              } 
                            }}
                          >
                            <TableCell>
                              <Box>
                                <Typography fontWeight="medium">
                                  {item.medicineName}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {t('alerts.idNumber', { id: item.medicineId })}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <QrCode sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {item.batchNumber}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.category?.toUpperCase() || t('common.na')}
                                color={getCategoryColor(item.category)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={t('alerts.units', { quantity: item.currentStock })}
                                color={getStockColor(item.currentStock)}
                                size="small"
                                variant="filled"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {new Date(item.expiryDate).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {item.supplierName}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* ✅ Low Stock Pagination */}
                  <TablePagination
                    component="div"
                    count={lowStockAlerts.length}
                    page={lowStockPage}
                    onPageChange={(event, newPage) => handleChangePage(event, newPage, 'lowStock')}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage={t('common.rowsPerPage')}
                    labelDisplayedRows={({ from, to, count }) =>
                      t('common.displayedRows', { from, to, count })
                    }
                  />
                </>
              )}
            </Box>
          )}

          {/* Expiring Soon Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="warning" />
                  {t('alerts.expiringNext30Days')}
                </Typography>
                <Chip 
                  label={t('alerts.batchesCount', { count: expiringSoonAlerts.length })} 
                  color="warning" 
                  variant="outlined" 
                />
              </Box>

              {expiringSoonAlerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CalendarToday sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    {t('alerts.noExpiringBatches')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('alerts.allBatchesSafe')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.04) }}>
                          <TableCell><strong>{t('alerts.medicine')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.batch')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.category')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.stock')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.expiryStatus')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.supplier')}</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedExpiringSoon.map((item, idx) => {
                          const expiryStatus = getExpiryStatus(item.expiryDate);
                          return (
                            <TableRow 
                              key={idx}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: alpha(theme.palette.warning.main, 0.02) 
                                } 
                              }}
                            >
                              <TableCell>
                                <Typography fontWeight="medium">
                                  {item.medicineName}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <QrCode sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    {item.batchNumber}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={item.category?.toUpperCase() || t('common.na')}
                                  color={getCategoryColor(item.category)}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={t('alerts.units', { quantity: item.currentStock })}
                                  color="default"
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                <Tooltip title={t('alerts.expiresOn', { date: new Date(item.expiryDate).toLocaleDateString() })}>
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
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* ✅ Expiring Soon Pagination */}
                  <TablePagination
                    component="div"
                    count={expiringSoonAlerts.length}
                    page={expiringSoonPage}
                    onPageChange={(event, newPage) => handleChangePage(event, newPage, 'expiringSoon')}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage={t('common.rowsPerPage')}
                    labelDisplayedRows={({ from, to, count }) =>
                      t('common.displayedRows', { from, to, count })
                    }
                  />
                </>
              )}
            </Box>
          )}

          {/* Expired Batches Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Dangerous color="error" />
                  {t('alerts.expiredMedicines')}
                </Typography>
                <Chip 
                  label={t('alerts.expiredCount', { count: expiredBatches.length })} 
                  color="error" 
                  variant="outlined" 
                />
              </Box>

              {expiredBatches.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    {t('alerts.noExpiredMedicines')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('alerts.allBatchesValid')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha(theme.palette.error.main, 0.04) }}>
                          <TableCell><strong>{t('alerts.medicine')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.batch')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.category')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.stock')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.expiryDate')}</strong></TableCell>
                          <TableCell><strong>{t('alerts.supplier')}</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedExpired.map((item, idx) => (
                          <TableRow 
                            key={idx}
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: alpha(theme.palette.error.main, 0.02) 
                              } 
                            }}
                          >
                            <TableCell>
                              <Typography fontWeight="medium" color="error.main">
                                {item.medicineName}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <QrCode sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {item.batchNumber}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={item.category?.toUpperCase() || t('common.na')}
                                color={getCategoryColor(item.category)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={t('alerts.units', { quantity: item.currentStock })}
                                color="error"
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 16, color: 'error.main' }} />
                                <Typography variant="body2" color="error.main" fontWeight="bold">
                                  {new Date(item.expiryDate).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Business sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2">
                                  {item.supplierName}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* ✅ Expired Batches Pagination */}
                  <TablePagination
                    component="div"
                    count={expiredBatches.length}
                    page={expiredPage}
                    onPageChange={(event, newPage) => handleChangePage(event, newPage, 'expired')}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage={t('common.rowsPerPage')}
                    labelDisplayedRows={({ from, to, count }) =>
                      t('common.displayedRows', { from, to, count })
                    }
                  />
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}