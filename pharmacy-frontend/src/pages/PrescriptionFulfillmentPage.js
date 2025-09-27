// src/pages/PrescriptionFulfillmentPage.js
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
} from "@mui/material";
import {
  getPendingPrescriptions,
  fulfillPrescription,
  cancelPrescription,
} from "../services/api";
import { toast } from "react-toastify";

export default function PrescriptionFulfillmentPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPendingPrescriptions();
      console.log("📦 Pending prescriptions:", response.data);

      // ✅ Fix: Use .prescriptions, not .data.data
      const data = response.data?.prescriptions;

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      setPrescriptions(data);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      const message = err.response?.data?.message || "Failed to load prescriptions";
      setError(message);
      setPrescriptions([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleFulfill = async (id) => {
    try {
      await fulfillPrescription(id);
      toast.success("✅ Prescription fulfilled and order created!");
      fetchPrescriptions(); // Refresh list
    } catch (err) {
      console.error("Error fulfilling prescription:", err);
      const message = err.response?.data?.message || "Failed to fulfill prescription";
      toast.error(`❌ ${message}`);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this prescription?")) return;

    try {
      await cancelPrescription(id);
      toast.success("🗑️ Prescription cancelled");
      fetchPrescriptions();
    } catch (err) {
      console.error("Error cancelling prescription:", err);
      const message = err.response?.data?.message || "Failed to cancel prescription";
      toast.error(`❌ ${message}`);
    }
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
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={fetchPrescriptions}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🧾 Prescription Fulfillment
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Review and fulfill pending prescriptions
      </Typography>

      {prescriptions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "#f8f9fa" }}>
          <Typography variant="h6" color="textSecondary">
            No pending prescriptions
          </Typography>
          <Typography color="textSecondary">
            All prescriptions have been fulfilled or cancelled.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Doctor</strong></TableCell>
                <TableCell><strong>Patient</strong></TableCell>
                <TableCell><strong>Details</strong></TableCell>
                <TableCell><strong>Issued At</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>#{prescription.id}</TableCell>
                  <TableCell>{prescription.doctor?.username || "Unknown Doctor"}</TableCell>
                  {/* ✅ Show customerName instead of customer.username */}
                  <TableCell>
                    {prescription.customerName || "Walk-in Patient"}
                    {prescription.customerPhone && (
                      <Typography variant="caption" display="block" color="textSecondary">
                        {prescription.customerPhone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 250, wordWrap: "break-word" }}>
                      {prescription.details}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(prescription.issuedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={prescription.status}
                      color={
                        prescription.status === "pending"
                          ? "warning"
                          : prescription.status === "fulfilled"
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleFulfill(prescription.id)}
                      >
                        ✅ Fulfill
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancel(prescription.id)}
                      >
                        ❌ Cancel
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}