// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
  Card,
  CardContent,
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
import StorefrontIcon from '@mui/icons-material/Storefront'; // ✅ Replaced StoreIcon
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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

      let hasAnySuccess = false;

      // Handle Daily Sales
      if (results[0].status === 'fulfilled' && results[0].value?.data.report) {
        const data = results[0].value.data.report;
        
        // ✅ Log to debug what's coming from API
        console.log("� Daily Sales Response:", data);

        const total = parseFloat(data.total || data.totalSales || 0);
        const count = parseInt(data.count || data.orderCount || 0);

        setSalesData({
          totalSales: total,
          orderCount: count,
          avgOrderValue: count > 0 ? total / count : 0,
          dailySales: Array.isArray(data.dailySales) ? data.dailySales : []
        });
        hasAnySuccess = true;
      } else {
        console.warn("❌ Failed to load daily sales:", results[0].reason);
      }

      // Handle Low Stock Alerts
      if (results[1].status === 'fulfilled' && results[1].value?.data) {
        const rawData = results[1].value.data.batches || [];
        const mapped = rawData.map(item => ({
          medicineName: item.Medicine?.name || "Unknown Medicine",
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          expiryDate: item.expiryDate
        }));
        setLowStockAlerts(mapped);
        hasAnySuccess = true;
      }

      // Handle Expiring Soon Alerts
      if (results[2].status === 'fulfilled' && results[2].value?.data) {
        const rawData = results[2].value.data.batches || [];
        const mapped = rawData.map(item => ({
          medicineName: item.Medicine?.name || "Unknown Medicine",
          batchNumber: item.batchNumber,
          quantity: item.quantity,
          expiryDate: item.expiryDate
        }));
        setExpiringSoonAlerts(mapped);
        hasAnySuccess = true;
      }

      // Handle Top Medicines
      if (results[3].status === 'fulfilled' && results[3].value?.data) {
        const rawData = results[3].value.data.items || results[3].value.data || [];
        const validData = Array.isArray(rawData) ? rawData : [];

        const mapped = validData
          .filter(Boolean)
          .map(item => ({
            name: item.name || item.medicineName || "Unknown",
            quantity: parseInt(item.quantity || item.totalQuantity || item.salesCount || 0)
          }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);

        setTopMedicines(mapped);
        hasAnySuccess = true;
      }

      if (!hasAnySuccess) {
        setError("Unable to load any dashboard data. Check your connection or contact support.");
      }
    } catch (err) {
      console.error("� Unexpected dashboard error:", err);
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
    { name: "In Stock", value: Math.max(1, topMedicines.reduce((sum, m) => sum + (m.quantity || 0), 0)) },
    { name: "Low Stock", value: lowStockAlerts.length },
    { name: "Expiring Soon", value: expiringSoonAlerts.length },
  ].filter(item => item.value > 0);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* ✅ Fixed Icon & Title */}
      <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={4}>
        <StorefrontIcon color="primary" fontSize="large" />
        <Typography variant="h4" align="center">
          Pharmacy Dashboard
        </Typography>
      </Box>

      {/* Sales Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="stretch">
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: "#e3f2fd",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Total Sales Today
            </Typography>
            <Typography variant="h4" color="primary" fontWeight="bold">
              ${salesData.totalSales.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: "#f3e5f5",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Orders Processed
            </Typography>
            <Typography variant="h4" color="secondary" fontWeight="bold">
              {salesData.orderCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: "#e8f5e8",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center"
            }}
          >
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Avg Order Value
            </Typography>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              ${salesData.avgOrderValue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} sx={{ mb: 4 }} alignItems="stretch">
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6">Sales Trends</Typography>
              </Box>
              <Box sx={{ height: 240 }}>
                <SalesChart data={salesData.dailySales || []} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <LocalHospitalIcon color="secondary" />
                <Typography variant="h6">Top Medicines</Typography>
              </Box>
              <Box sx={{ height: 240 }}>
                <TopMedicinesChart data={topMedicines || []} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <InventoryIcon color="warning" />
                <Typography variant="h6">Inventory Status</Typography>
              </Box>
              <Box sx={{ height: 240 }}>
                <InventoryStatusChart data={inventoryChartData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningIcon color="error" />
                <Typography variant="h6">Low Stock Alerts</Typography>
              </Box>
              <Chip
                label={`${lowStockAlerts.length} items`}
                color={lowStockAlerts.length > 0 ? "error" : "default"}
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {lowStockAlerts.length === 0 ? (
              <Typography color="textSecondary" align="center">
                All stock levels are healthy ✅
              </Typography>
            ) : (
              <List dense>
                {lowStockAlerts.map((item, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={item.medicineName}
                      secondary={`Batch: ${item.batchNumber} | Qty: ${item.quantity} | Exp: ${new Date(item.expiryDate).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeIcon color="warning" />
                <Typography variant="h6">Expiring Soon</Typography>
              </Box>
              <Chip
                label={`${expiringSoonAlerts.length} batches`}
                color={expiringSoonAlerts.length > 0 ? "warning" : "default"}
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {expiringSoonAlerts.length === 0 ? (
              <Typography color="textSecondary" align="center">
                No batches expiring soon ✅
              </Typography>
            ) : (
              <List dense>
                {expiringSoonAlerts.map((item, idx) => (
                  <ListItem key={idx}>
                    <ListItemText
                      primary={item.medicineName}
                      secondary={`Batch: ${item.batchNumber} | Qty: ${item.quantity} | Exp: ${new Date(item.expiryDate).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<ShoppingCartIcon />}
          onClick={() => navigate("/orders/create")}
        >
          Create New Order
        </Button>
        <Button
          variant="contained"
          color="info"
          size="large"
          startIcon={<MedicalInformationIcon />}
          onClick={() => navigate("/prescriptions/manage")}
        >
          Fulfill Prescriptions
        </Button>
        <Button
          variant="contained"
          color="warning"
          size="large"
          startIcon={<InventoryIcon />}
          onClick={() => navigate("/inventory/manage")}
        >
          Manage Inventory
        </Button>
      </Box>
    </Container>
  );
}