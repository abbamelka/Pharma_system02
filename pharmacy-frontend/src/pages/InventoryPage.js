// src/pages/InventoryPage.js
import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
} from "@mui/material";
import { getLowStockAlerts, getExpiringSoonAlerts } from "../services/api";

export default function InventoryPage() {
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiringSoonAlerts, setExpiringSoonAlerts] = useState([]);
  const [expiredBatches, setExpiredBatches] = useState([]); // ✅ New state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [threshold, setThreshold] = useState(5);
  const [days, setDays] = useState(30);

  const fetchInventoryAlerts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [lowStockRes, expiringRes] = await Promise.all([
        getLowStockAlerts(threshold),
        getExpiringSoonAlerts(days)
      ]);

      const lowStockData = lowStockRes.data?.batches || [];
      const expiringData = expiringRes.data?.batches || [];

      // ✅ Map and split expiring vs expired
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const mappedExpiring = [];
      const mappedExpired = [];

      expiringData.forEach(item => {
        const expiryDate = new Date(item.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);

        if (expiryDate < now) {
          mappedExpired.push({
            medicineName: item.Medicine?.name || "Unknown",
            batchNumber: item.batchNumber,
            currentStock: item.quantity,
            expiryDate: item.expiryDate
          });
        } else {
          mappedExpiring.push({
            medicineName: item.Medicine?.name || "Unknown",
            batchNumber: item.batchNumber,
            currentStock: item.quantity,
            expiryDate: item.expiryDate
          });
        }
      });

      // ✅ Sort: soonest first
      mappedExpiring.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      mappedExpired.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

      // ✅ Map low stock
      const mappedLowStock = lowStockData.map(item => ({
        medicineName: item.Medicine?.name || "Unknown",
        batchNumber: item.batchNumber,
        currentStock: item.quantity,
        expiryDate: item.expiryDate
      }));

      setLowStockAlerts(mappedLowStock);
      setExpiringSoonAlerts(mappedExpiring);
      setExpiredBatches(mappedExpired);
    } catch (err) {
      console.error("Error fetching inventory alerts:", err);
      setError("Failed to load inventory alerts");
    } finally {
      setLoading(false);
    }
  }, [threshold, days]);

  useEffect(() => {
    fetchInventoryAlerts();
  }, [fetchInventoryAlerts]);

  const handleRefresh = () => {
    fetchInventoryAlerts();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        📦 Inventory Management
      </Typography>

      {/* Filter Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>🔔 Alert Filters</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
          <TextField
            label="Low Stock Threshold"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            size="small"
            sx={{ width: 200 }}
            inputProps={{ min: 1 }}
          />
          <TextField
            label="Expiring Soon (Days)"
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            size="small"
            sx={{ width: 200 }}
            inputProps={{ min: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleRefresh}
            sx={{ height: 40 }}
          >
            Apply Filters
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Low Stock Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">⚠️ Low Stock Alerts (Threshold: {threshold})</Typography>
              <Chip 
                label={`${lowStockAlerts.length} items`} 
                color={lowStockAlerts.length > 0 ? "error" : "default"}
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {lowStockAlerts.length === 0 ? (
              <Typography color="textSecondary">✅ All stock levels are healthy</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Medicine</strong></TableCell>
                      <TableCell><strong>Batch</strong></TableCell>
                      <TableCell><strong>Stock</strong></TableCell>
                      <TableCell><strong>Expiry</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockAlerts.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.medicineName}</TableCell>
                        <TableCell>{item.batchNumber}</TableCell>
                        <TableCell>
                          <Chip label={item.currentStock} color="error" size="small" />
                        </TableCell>
                        <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Expiring Soon Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">⏳ Expiring Soon (Next {days} days)</Typography>
              <Chip 
                label={`${expiringSoonAlerts.length} batches`} 
                color={expiringSoonAlerts.length > 0 ? "warning" : "default"}
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {expiringSoonAlerts.length === 0 ? (
              <Typography color="textSecondary">✅ No batches expiring soon</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Medicine</strong></TableCell>
                      <TableCell><strong>Batch</strong></TableCell>
                      <TableCell><strong>Stock</strong></TableCell>
                      <TableCell><strong>Expiry</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expiringSoonAlerts.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.medicineName}</TableCell>
                        <TableCell>{item.batchNumber}</TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>
                          <Chip 
                            label={new Date(item.expiryDate).toLocaleDateString()} 
                            color="warning" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Expired Batches */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">🔴 Expired Medicines</Typography>
              <Chip 
                label={`${expiredBatches.length} batches`} 
                color={expiredBatches.length > 0 ? "error" : "default"}
                size="small"
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
            {expiredBatches.length === 0 ? (
              <Typography color="textSecondary">✅ No expired medicines found</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Medicine</strong></TableCell>
                      <TableCell><strong>Batch</strong></TableCell>
                      <TableCell><strong>Stock</strong></TableCell>
                      <TableCell><strong>Expiry</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expiredBatches.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.medicineName}</TableCell>
                        <TableCell>{item.batchNumber}</TableCell>
                        <TableCell>{item.currentStock}</TableCell>
                        <TableCell>
                          <Chip 
                            label={new Date(item.expiryDate).toLocaleDateString()} 
                            color="error" 
                            size="small" 
                            icon={<span style={{ fontSize: '0.8em' }}>✖</span>}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}