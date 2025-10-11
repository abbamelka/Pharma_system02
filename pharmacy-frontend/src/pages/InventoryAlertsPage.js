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

export default function InventoryAlertsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiringSoonAlerts, setExpiringSoonAlerts] = useState([]);
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const theme = useTheme();

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
        medicineName: item.Medicine?.name || "Unknown",
        batchNumber: item.batchNumber,
        currentStock: item.quantity,
        expiryDate: item.expiryDate,
        supplierName: item.Supplier?.name || "N/A",
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
            medicineName: item.Medicine?.name || "Unknown",
            batchNumber: item.batchNumber,
            currentStock: item.quantity,
            expiryDate: item.expiryDate,
            supplierName: item.Supplier?.name || "N/A",
            medicineId: item.Medicine?.id,
            category: item.Medicine?.category
          });
        } else {
          mappedExpiring.push({
            medicineName: item.Medicine?.name || "Unknown",
            batchNumber: item.batchNumber,
            currentStock: item.quantity,
            expiryDate: item.expiryDate,
            supplierName: item.Supplier?.name || "N/A",
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
      setError("Failed to load inventory alerts");
      toast.error("❌ Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
    
    if (daysUntilExpiry < 0) return { color: 'error', label: 'Expired', icon: <Dangerous /> };
    if (daysUntilExpiry <= 7) return { color: 'error', label: `${daysUntilExpiry}d`, icon: <Dangerous /> };
    if (daysUntilExpiry <= 30) return { color: 'warning', label: `${daysUntilExpiry}d`, icon: <Warning /> };
    return { color: 'info', label: `${daysUntilExpiry}d`, icon: <Schedule /> };
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
          Loading inventory alerts...
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
          Inventory Alerts
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Critical notifications for stock levels and expiry dates
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
                Total Alerts
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
                Low Stock
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
                Expiring Soon
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
                Expired
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
              Alert Dashboard
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchAlerts}
              disabled={loading}
            >
              Refresh Alerts
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
              label="Low Stock Alerts" 
            />
            <Tab 
              icon={<Badge badgeContent={expiringSoonAlerts.length} color="warning">
                <Schedule />
              </Badge>} 
              iconPosition="start"
              label="Expiring Soon" 
            />
            <Tab 
              icon={<Badge badgeContent={expiredBatches.length} color="error">
                <Dangerous />
              </Badge>} 
              iconPosition="start"
              label="Expired Batches" 
            />
          </Tabs>

          {/* Low Stock Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="error" />
                  Low Stock Medicines (Below 5 units)
                </Typography>
                <Chip 
                  label={`${lowStockAlerts.length} alerts`} 
                  color="error" 
                  variant="outlined" 
                />
              </Box>

              {lowStockAlerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <TrendingUp sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    ✅ All Stock Levels Are Healthy
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    No medicines are currently below the minimum stock threshold
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.error.main, 0.04) }}>
                        <TableCell><strong>Medicine</strong></TableCell>
                        <TableCell><strong>Batch</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Current Stock</strong></TableCell>
                        <TableCell><strong>Expiry Date</strong></TableCell>
                        <TableCell><strong>Supplier</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStockAlerts.map((item, idx) => (
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
                                ID: #{item.medicineId}
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
                              label={item.category?.toUpperCase() || 'N/A'}
                              color={getCategoryColor(item.category)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${item.currentStock} units`}
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
              )}
            </Box>
          )}

          {/* Expiring Soon Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule color="warning" />
                  Batches Expiring in Next 30 Days
                </Typography>
                <Chip 
                  label={`${expiringSoonAlerts.length} batches`} 
                  color="warning" 
                  variant="outlined" 
                />
              </Box>

              {expiringSoonAlerts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CalendarToday sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    ✅ No Expiring Batches
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    All batches are within safe expiry dates
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.04) }}>
                        <TableCell><strong>Medicine</strong></TableCell>
                        <TableCell><strong>Batch</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Stock</strong></TableCell>
                        <TableCell><strong>Expiry Status</strong></TableCell>
                        <TableCell><strong>Supplier</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expiringSoonAlerts.map((item, idx) => {
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
                                label={item.category?.toUpperCase() || 'N/A'}
                                color={getCategoryColor(item.category)}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${item.currentStock} units`}
                                color="default"
                                size="small"
                                variant="outlined"
                              />
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
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Expired Batches Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Dangerous color="error" />
                  Expired Medicines
                </Typography>
                <Chip 
                  label={`${expiredBatches.length} expired`} 
                  color="error" 
                  variant="outlined" 
                />
              </Box>

              {expiredBatches.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    ✅ No Expired Medicines
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    All batches are within their validity period
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.error.main, 0.04) }}>
                        <TableCell><strong>Medicine</strong></TableCell>
                        <TableCell><strong>Batch</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Stock</strong></TableCell>
                        <TableCell><strong>Expiry Date</strong></TableCell>
                        <TableCell><strong>Supplier</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expiredBatches.map((item, idx) => (
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
                              label={item.category?.toUpperCase() || 'N/A'}
                              color={getCategoryColor(item.category)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${item.currentStock} units`}
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
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}