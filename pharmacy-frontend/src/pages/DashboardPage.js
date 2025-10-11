// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Card,
  CardContent,
  ListItemIcon,
  alpha,
  useTheme,
} from "@mui/material";
import {
  getDailySales,
  getLowStockAlerts,
  getExpiringSoonAlerts,
  getTopMedicines,
} from "../services/api";
import { useNavigate } from "react-router-dom";

// ✅ Import meaningful icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import StorefrontIcon from '@mui/icons-material/Storefront';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReportIcon from '@mui/icons-material/Report';     // For expired
import WarningAmberIcon from '@mui/icons-material/WarningAmber'; // For near expiry
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AverageIcon from '@mui/icons-material/Calculate';

import SalesChart from "../components/charts/SalesChart";
import TopMedicinesChart from "../components/charts/TopMedicinesChart";
import InventoryStatusChart from "../components/charts/InventoryStatusChart";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";

export default function DashboardPage() {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    orderCount: 0,
    avgOrderValue: 0,
    dailySales: [],
  });
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiringSoonAlerts, setExpiringSoonAlerts] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled([
        getDailySales().catch(err => ({ err })),
        getLowStockAlerts(5).catch(err => ({ err })),
        getExpiringSoonAlerts(30).catch(err => ({ err })),
        getTopMedicines(5).catch(err => ({ err }))
      ]);

      console.log("📊 API Results:", results); // Debug all API responses

      let hasAnySuccess = false;

      // Handle Daily Sales - Improved data handling
      if (results[0].status === 'fulfilled' && results[0].value?.data) {
        const data = results[0].value.data.report || results[0].value.data;
        console.log("💰 Daily Sales Raw Data:", data);
        
        const total = parseFloat(data.total || data.totalSales || data.amount || data.revenue || 0);
        const count = parseInt(data.count || data.orderCount || data.orders || data.transactions || 0);
        
        // Handle daily sales array with multiple possible structures
        const dailySalesArray = Array.isArray(data.dailySales) ? data.dailySales : 
                               Array.isArray(data.sales) ? data.sales : 
                               Array.isArray(data.data) ? data.data : 
                               Array.isArray(data.chartData) ? data.chartData : [];

        console.log("📈 Processed Daily Sales:", {
          totalSales: total,
          orderCount: count,
          avgOrderValue: count > 0 ? total / count : 0,
          dailySalesCount: dailySalesArray.length
        });

        setSalesData({
          totalSales: total,
          orderCount: count,
          avgOrderValue: count > 0 ? total / count : 0,
          dailySales: dailySalesArray
        });
        hasAnySuccess = true;
      } else {
        console.error("❌ Failed to load daily sales:", results[0].reason);
      }

      // Handle Low Stock Alerts
      if (results[1].status === 'fulfilled' && results[1].value?.data) {
        const rawData = results[1].value.data.batches || results[1].value.data || [];
        console.log("📦 Low Stock Raw Data:", rawData);
        
        const mapped = rawData.map(item => ({
          medicineName: item.Medicine?.name || item.medicineName || item.name || "Unknown Medicine",
          batchNumber: item.batchNumber || item.batch || "N/A",
          quantity: item.quantity || item.stock || item.remaining || 0,
          expiryDate: item.expiryDate || item.expiry || "Unknown"
        }));
        setLowStockAlerts(mapped);
        hasAnySuccess = true;
      } else {
        console.warn("❌ Failed to load low stock alerts:", results[1].reason);
      }

      // Handle Expiring Soon Alerts
      if (results[2].status === 'fulfilled' && results[2].value?.data) {
        const rawData = results[2].value.data.batches || results[2].value.data || [];
        console.log("⏰ Expiring Soon Raw Data:", rawData);
        
        const mapped = rawData.map(item => ({
          medicineName: item.Medicine?.name || item.medicineName || item.name || "Unknown Medicine",
          batchNumber: item.batchNumber || item.batch || "N/A",
          quantity: item.quantity || item.stock || 0,
          expiryDate: item.expiryDate || item.expiry || "Unknown"
        }));
        setExpiringSoonAlerts(mapped);
        hasAnySuccess = true;
      } else {
        console.warn("❌ Failed to load expiring soon alerts:", results[2].reason);
      }

      // Handle Top Medicines - Improved data mapping
      if (results[3].status === 'fulfilled' && results[3].value?.data) {
        const rawData = results[3].value.data.items || results[3].value.data || [];
        console.log("🏆 Top Medicines Raw Data:", rawData);

        const validData = Array.isArray(rawData) ? rawData : [];
        
        const mapped = validData
          .filter(item => item && (item.name || item.medicineName || item.medicine || item.productName))
          .map(item => {
            const name = item.name || item.medicineName || item.medicine?.name || item.productName || "Unknown Medicine";
            const quantity = parseInt(
              item.quantity || 
              item.totalQuantity || 
              item.salesCount || 
              item.count ||
              item.sold ||
              item.unitsSold ||
              item.popularity ||
              0
            );
            
            return { name, quantity };
          })
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        console.log("🏆 Processed Top Medicines:", mapped);
        setTopMedicines(mapped);
        hasAnySuccess = true;
      } else {
        console.warn("❌ Failed to load top medicines:", results[3].reason);
      }

      // If no API calls succeeded, use fallback data for demonstration
      if (!hasAnySuccess) {
        console.warn("⚠️ Using fallback data for demonstration");
        setError("Using demo data - API endpoints may need configuration");
        
        // Fallback demo data
        setSalesData({
          totalSales: 2875.50,
          orderCount: 23,
          avgOrderValue: 125.02,
          dailySales: [
            { date: '2024-01-01', sales: 1200, amount: 1200 },
            { date: '2024-01-02', sales: 800, amount: 800 },
            { date: '2024-01-03', sales: 1500, amount: 1500 },
            { date: '2024-01-04', sales: 2100, amount: 2100 },
            { date: '2024-01-05', sales: 1800, amount: 1800 },
          ]
        });
        
        setTopMedicines([
          { name: 'Paracetamol 500mg', quantity: 156 },
          { name: 'Amoxicillin 250mg', quantity: 89 },
          { name: 'Vitamin C 1000mg', quantity: 67 },
          { name: 'Ibuprofen 400mg', quantity: 54 },
          { name: 'Aspirin 75mg', quantity: 42 }
        ]);
        
        setLowStockAlerts([
          {
            medicineName: 'Omeprazole 20mg',
            batchNumber: 'BATCH202401',
            quantity: 8,
            expiryDate: '2024-12-31'
          },
          {
            medicineName: 'Metformin 500mg',
            batchNumber: 'BATCH202402',
            quantity: 12,
            expiryDate: '2024-11-15'
          }
        ]);
        
        setExpiringSoonAlerts([
          {
            medicineName: 'Loratadine 10mg',
            batchNumber: 'BATCH202312',
            quantity: 25,
            expiryDate: '2024-02-15'
          }
        ]);
      }

    } catch (err) {
      console.error("💥 Unexpected dashboard error:", err);
      setError("An unexpected error occurred while loading the dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <DashboardSkeleton />
      </Container>
    );
  }

  if (error && !salesData.totalSales && !lowStockAlerts.length && !topMedicines.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Container>
    );
  }

  // Prepare inventory chart data
  const inventoryChartData = [
    { 
      name: "In Stock", 
      value: Math.max(1, topMedicines.reduce((sum, m) => sum + (m.quantity || 0), 0)) 
    },
    { 
      name: "Low Stock", 
      value: lowStockAlerts.length 
    },
    { 
      name: "Expiring Soon", 
      value: expiringSoonAlerts.length 
    },
  ].filter(item => item.value > 0);

  // Check if any batch is already expired
  const hasExpired = expiringSoonAlerts.some(
    item => new Date(item.expiryDate) < new Date()
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6, px: 3 }}>
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
        <StorefrontIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Pharmacy Dashboard
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Real-time overview of your pharmacy operations
        </Typography>
        {error && (
          <Alert severity="info" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Sales Metrics - Full Width Cards */}
      <Grid container spacing={3} sx={{ mb: 6 }} alignItems="stretch">
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.2)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <AttachMoneyIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" color="textSecondary" fontWeight="medium">
                Total Sales Today
              </Typography>
            </Box>
            <Typography variant="h3" color="primary" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
              ${salesData.totalSales.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.2)} 100%)`,
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <ReceiptIcon color="secondary" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" color="textSecondary" fontWeight="medium">
                Orders Processed
              </Typography>
            </Box>
            <Typography variant="h3" color="secondary" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
              {salesData.orderCount}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.light, 0.2)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              borderRadius: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <AverageIcon color="success" sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" color="textSecondary" fontWeight="medium">
                Avg Order Value
              </Typography>
            </Box>
            <Typography variant="h3" color="success.main" fontWeight="bold" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
              ${salesData.avgOrderValue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section - Equal Width Columns */}
      <Grid container spacing={4} sx={{ mb: 6 }} alignItems="stretch">
        {/* Sales Chart - 33% width */}
        <Grid item xs={12} lg={4}>
          <Card 
            sx={{ 
              height: "100%", 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <TrendingUpIcon color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">Sales Trends</Typography>
              </Box>
              <Box sx={{ height: 280, flex: 1 }}>
                <SalesChart data={salesData.dailySales || []} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Medicines Chart - 33% width */}
        <Grid item xs={12} lg={4}>
          <Card 
            sx={{ 
              height: "100%", 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <LocalHospitalIcon color="secondary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">Top Medicines</Typography>
              </Box>
              <Box sx={{ height: 280, flex: 1 }}>
                <TopMedicinesChart data={topMedicines || []} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Chart - 33% width */}
        <Grid item xs={12} lg={4}>
          <Card 
            sx={{ 
              height: "100%", 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                <InventoryIcon color="warning" sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">Inventory Status</Typography>
              </Box>
              <Box sx={{ height: 280, flex: 1 }}>
                <InventoryStatusChart data={inventoryChartData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts Section - Equal Width Columns */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {/* Low Stock Alerts - 50% width */}
        <Grid item xs={12} lg={6}>
          <Paper 
            sx={{ 
              p: 4, 
              height: "100%", 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: lowStockAlerts.length > 0 ? `2px solid ${theme.palette.error.light}` : 'none',
              background: lowStockAlerts.length > 0 ? 
                `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.light, 0.1)} 100%)` : 
                'background.paper'
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningIcon color={lowStockAlerts.length > 0 ? "error" : "disabled"} sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">Low Stock Alerts</Typography>
              </Box>
              <Chip
                label={`${lowStockAlerts.length} items`}
                color={lowStockAlerts.length > 0 ? "error" : "default"}
                size="medium"
                sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
              />
            </Box>
            <Divider sx={{ mb: 3 }} />
            {lowStockAlerts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary" variant="h6" gutterBottom>
                  🎉 All Stock Levels Are Healthy
                </Typography>
                <Typography color="textSecondary">
                  No low stock items detected
                </Typography>
              </Box>
            ) : (
              <List dense sx={{ maxHeight: 320, overflow: 'auto' }}>
                {lowStockAlerts.map((item, idx) => (
                  <ListItem 
                    key={idx}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.error.main, 0.04),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.08),
                      }
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography fontWeight="medium" color="error.dark">
                          {item.medicineName}
                        </Typography>
                      }
                      secondary={`Batch: ${item.batchNumber} | Remaining: ${item.quantity} units`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Expiring Soon Alerts - 50% width */}
        <Grid item xs={12} lg={6}>
          <Paper 
            sx={{ 
              p: 4, 
              height: "100%", 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: expiringSoonAlerts.length > 0 ? `2px solid ${hasExpired ? theme.palette.error.light : theme.palette.warning.light}` : 'none',
              background: expiringSoonAlerts.length > 0 ? 
                `linear-gradient(135deg, ${alpha(hasExpired ? theme.palette.error.main : theme.palette.warning.main, 0.05)} 0%, ${alpha(hasExpired ? theme.palette.error.light : theme.palette.warning.light, 0.1)} 100%)` : 
                'background.paper'
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeIcon color={hasExpired ? "error" : expiringSoonAlerts.length > 0 ? "warning" : "disabled"} sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight="bold">Expiring Soon</Typography>
              </Box>
              <Chip
                label={`${expiringSoonAlerts.length} batches`}
                color={hasExpired ? "error" : expiringSoonAlerts.length > 0 ? "warning" : "default"}
                size="medium"
                sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
              />
            </Box>
            <Divider sx={{ mb: 3 }} />
            {expiringSoonAlerts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary" variant="h6" gutterBottom>
                  ✅ No Batches Expiring Soon
                </Typography>
                <Typography color="textSecondary">
                  All inventory is within safe expiry dates
                </Typography>
              </Box>
            ) : (
              <List dense sx={{ maxHeight: 320, overflow: 'auto' }}>
                {expiringSoonAlerts.map((item, idx) => {
                  const expiry = new Date(item.expiryDate);
                  const today = new Date();
                  const timeDiff = expiry - today;
                  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

                  let primaryColor = "text.primary";
                  let secondaryColor = "text.secondary";
                  let fontWeight = "normal";
                  let bgColor = alpha(theme.palette.warning.main, 0.04);

                  if (daysDiff < 0) {
                    primaryColor = "error.main";
                    secondaryColor = "error.main";
                    fontWeight = "bold";
                    bgColor = alpha(theme.palette.error.main, 0.08);
                  } else if (daysDiff <= 7) {
                    primaryColor = "warning.dark";
                    secondaryColor = "warning.main";
                    fontWeight = "medium";
                    bgColor = alpha(theme.palette.warning.main, 0.08);
                  }

                  return (
                    <ListItem 
                      key={idx} 
                      alignItems="flex-start"
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        backgroundColor: bgColor,
                        '&:hover': {
                          backgroundColor: alpha(bgColor, 2),
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                        {daysDiff < 0 ? (
                          <ReportIcon color="error" fontSize="small" />
                        ) : daysDiff <= 7 ? (
                          <WarningAmberIcon color="warning" fontSize="small" />
                        ) : null}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography component="span" color={primaryColor} fontWeight={fontWeight}>
                            {item.medicineName}
                          </Typography>
                        }
                        secondary={
                          <Typography component="span" variant="body2" color={secondaryColor}>
                            Batch: {item.batchNumber} | Qty: {item.quantity} | 
                            Exp: {expiry.toLocaleDateString()} 
                            {daysDiff < 0 
                              ? " ⚠️ EXPIRED" 
                              : ` (${daysDiff} day${daysDiff !== 1 ? 's' : ''} left)`
                            }
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons - Centered with better styling */}
      <Box 
        sx={{ 
          mt: 6, 
          display: "flex", 
          gap: 3, 
          justifyContent: "center", 
          flexWrap: "wrap",
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          borderRadius: 4,
          py: 4,
          px: 3
        }}
      >
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<ShoppingCartIcon />}
          onClick={() => navigate("/orders/create")}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(76, 175, 80, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
            minWidth: 200
          }}
        >
          Create New Order
        </Button>
        <Button
          variant="contained"
          color="info"
          size="large"
          startIcon={<MedicalInformationIcon />}
          onClick={() => navigate("/prescriptions/manage")}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(33, 150, 243, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
            minWidth: 200
          }}
        >
          Fulfill Prescriptions
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="large"
          startIcon={<InventoryIcon />}
          onClick={() => navigate("/inventory/manage")}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
            minWidth: 200
          }}
        >
          Manage Inventory
        </Button>
      </Box>
    </Container>
  );
}