// src/pages/PrescriptionManagementPage.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";

import {
  getPendingPrescriptions,
  createPrescription,
  fulfillPrescription,
  cancelPrescription,
  getCustomerPrescriptions,
} from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import TableSkeleton from "../components/skeletons/TableSkeleton";

export default function PrescriptionManagementPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchPhone, setSearchPhone] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    details: "",
    dosage: "1 tablet",
    frequency: "once daily",
    duration: "7 days",
    validUntil: "",
  });

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      let data = [];

      if (activeTab === 0) {
        if (user?.role === "doctor") {
          const res = await getCustomerPrescriptions({});
          data = Array.isArray(res.data?.prescriptions)
            ? res.data.prescriptions.filter(p => p.doctorId === user.id)
            : [];
        } else {
          try {
            const res = await getPendingPrescriptions();
            data = res.data?.prescriptions || [];
          } catch (err) {
            if (err.response?.status === 403) {
              setError("You don't have permission to view pending prescriptions.");
            } else {
              throw err;
            }
            data = [];
          }
        }
      } else if (activeTab === 1) {
        if (!searchPhone.trim()) {
          setPrescriptions([]);
          setLoading(false);
          return;
        }

        // ✅ Fixed regex: no unnecessary escape
        if (!/^[+]?[0-9\s\-()]{8,15}$/.test(searchPhone.trim())) {
          setError("Please enter a valid phone number");
          data = [];
        } else {
          try {
            const res = await getCustomerPrescriptions({ phone: searchPhone.trim() });
            data = res.data?.prescriptions || [];
            if (data.length === 0) {
              setError("No prescriptions found for this phone number.");
            }
          } catch (err) {
            if (err.response?.status === 400) {
              setError("Invalid phone format");
            } else {
              throw err;
            }
            data = [];
          }
        }
      }

      setPrescriptions(data);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
      setError("Failed to load prescriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchPhone, user]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleCreatePrescription = async () => {
    if (!formData.customerName.trim()) {
      toast.error("Patient name is required");
      return;
    }
    if (!formData.details.trim()) {
      toast.error("Prescription details are required");
      return;
    }

    try {
      await createPrescription({
        ...formData,
        validUntil: formData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      });

      toast.success("✅ Prescription created!");
      fetchPrescriptions();
      setOpenCreateModal(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create prescription";
      toast.error(`❌ ${msg}`);
    }
  };

  const handleFulfillPrescription = async (id) => {
    try {
      await fulfillPrescription(id);
      toast.success("✅ Prescription fulfilled and order created!");
      fetchPrescriptions();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to fulfill prescription";
      toast.error(`❌ ${msg}`);
    }
  };

  const handleCancelPrescription = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this prescription?")) return;

    try {
      await cancelPrescription(id);
      toast.success("�️ Prescription cancelled!");
      fetchPrescriptions();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel prescription";
      toast.error(`❌ ${msg}`);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      details: "",
      dosage: "1 tablet",
      frequency: "once daily",
      duration: "7 days",
      validUntil: ""
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchPhone("");
    setPrescriptions([]);
    setError("");
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <TableSkeleton rows={5} columns={8} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        � Prescription Management
      </Typography>

      {(user?.role === "doctor") && (
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateModal(true)}
          >
            Create New Prescription
          </Button>
        </Box>
      )}

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label={user?.role === "doctor" ? "My Prescriptions" : "Pending Prescriptions"} />
        <Tab label="Search by Phone" />
      </Tabs>

      {activeTab === 1 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            � Search by Patient Phone Number
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              label="Phone Number"
              fullWidth
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="e.g., +251912345678"
              sx={{ flexGrow: 1, minWidth: 200 }}
              autoFocus
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={fetchPrescriptions}
              disabled={!searchPhone.trim()}
            >
              Search
            </Button>
          </Box>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Doctor</strong></TableCell>
              <TableCell><strong>Patient</strong></TableCell>
              <TableCell><strong>Details</strong></TableCell>
              <TableCell><strong>Issued At</strong></TableCell>
              <TableCell><strong>Valid Until</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prescriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  {activeTab === 0
                    ? user?.role === "doctor"
                      ? "No prescriptions created yet"
                      : "No pending prescriptions"
                    : "No prescriptions found. Try a different phone number."}
                </TableCell>
              </TableRow>
            ) : (
              prescriptions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>#{p.id}</TableCell>
                  <TableCell>{p.doctor?.username || "Unknown Doctor"}</TableCell>
                  <TableCell>
                    {p.customerName || "Walk-in Patient"}
                    {p.customerPhone && (
                      <Typography variant="caption" display="block" color="textSecondary">
                        � {p.customerPhone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, wordWrap: "break-word" }}>
                      {p.details} ({p.dosage}, {p.frequency})
                    </Typography>
                  </TableCell>
                  <TableCell>{new Date(p.issuedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {p.validUntil ? new Date(p.validUntil).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={p.status}
                      color={
                        p.status === "pending"
                          ? "warning"
                          : p.status === "fulfilled"
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {p.status === "pending" && user?.role !== "doctor" && (
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleFulfillPrescription(p.id)}
                          title="Fulfill Prescription"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      )}
                      {p.status === "pending" && (
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleCancelPrescription(p.id)}
                          title="Cancel Prescription"
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Prescription</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              margin="dense"
              name="customerName"
              label="Patient Name"
              fullWidth
              value={formData.customerName}
              onChange={handleInputChange}
              required
              autoFocus
            />
            <TextField
              margin="dense"
              name="customerPhone"
              label="Phone (Optional)"
              fullWidth
              value={formData.customerPhone}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="details"
              label="Medicines (Format: medicineId:quantity)"
              fullWidth
              multiline
              rows={3}
              value={formData.details}
              onChange={handleInputChange}
              placeholder="e.g., 3:2,7:1"
              required
              helperText="Use format: medicineId:quantity (e.g., 3:2 means 2 tablets of medicine #3)"
            />
            <TextField
              margin="dense"
              name="dosage"
              label="Dosage"
              fullWidth
              value={formData.dosage}
              onChange={handleInputChange}
              placeholder="e.g., 1 tablet"
            />
            <TextField
              margin="dense"
              name="frequency"
              label="Frequency"
              fullWidth
              value={formData.frequency}
              onChange={handleInputChange}
              placeholder="e.g., twice daily"
            />
            <TextField
              margin="dense"
              name="duration"
              label="Duration"
              fullWidth
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="e.g., 7 days"
            />
            <TextField
              margin="dense"
              name="validUntil"
              label="Valid Until"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.validUntil}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreatePrescription} variant="contained" color="primary">
            Create Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}