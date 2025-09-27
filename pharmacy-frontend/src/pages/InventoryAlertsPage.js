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
} from "@mui/material";
import { getLowStockAlerts, getExpiringSoonAlerts } from "../services/api";

export default function InventoryAlertsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [expiringSoonAlerts, setExpiringSoonAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    setLoading(true);
    setError("");

    try {
      const [lowStockRes, expiringRes] = await Promise.all([
        getLowStockAlerts(5),
        getExpiringSoonAlerts(30)
      ]);

      // ✅ Fix: Use .batches, not .data.data
      const lowStockData = lowStockRes.data?.batches || [];
      const expiringData = expiringRes.data?.batches || [];

      // ✅ Map data to include medicine & supplier names
      const mappedLowStock = lowStockData.map(item => ({
        medicineName: item.Medicine?.name || "Unknown",
        batchNumber: item.batchNumber,
        currentStock: item.quantity,
        expiryDate: item.expiryDate,
        supplierName: item.Supplier?.name || "N/A"
      }));

      const mappedExpiring = expiringData.map(item => ({
        medicineName: item.Medicine?.name || "Unknown",
        batchNumber: item.batchNumber,
        currentStock: item.quantity,
        expiryDate: item.expiryDate,
        supplierName: item.Supplier?.name || "N/A"
      }));

      setLowStockAlerts(mappedLowStock);
      setExpiringSoonAlerts(mappedExpiring);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError("Failed to load inventory alerts");
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
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔔 Inventory Alerts
      </Typography>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={`⚠️ Low Stock (${lowStockAlerts.length})`} />
        <Tab label={`⏳ Expiring Soon (${expiringSoonAlerts.length})`} />
      </Tabs>

      {/* Low Stock Tab */}
      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>⚠️ Medicines Below Threshold (5 units)</Typography>
          {lowStockAlerts.length === 0 ? (
            <Typography color="textSecondary">✅ All medicines have healthy stock levels.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Medicine</strong></TableCell>
                    <TableCell><strong>Batch</strong></TableCell>
                    <TableCell><strong>Current Stock</strong></TableCell>
                    <TableCell><strong>Expiry</strong></TableCell>
                    <TableCell><strong>Supplier</strong></TableCell>
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
                      <TableCell>{item.supplierName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {/* Expiring Soon Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>⏳ Batches Expiring in Next 30 Days</Typography>
          {expiringSoonAlerts.length === 0 ? (
            <Typography color="textSecondary">✅ No batches are expiring soon.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Medicine</strong></TableCell>
                    <TableCell><strong>Batch</strong></TableCell>
                    <TableCell><strong>Stock</strong></TableCell>
                    <TableCell><strong>Expiry Date</strong></TableCell>
                    <TableCell><strong>Supplier</strong></TableCell>
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
                      <TableCell>{item.supplierName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Container>
  );
}