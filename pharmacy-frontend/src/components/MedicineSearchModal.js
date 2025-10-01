// components/MedicineSearchModal.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { searchMedicines } from "../services/api";

export default function MedicineSearchModal({ open, onClose, onAddMedicine }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated. Please log in.");
      return;
    }

    if (!searchTerm.trim()) {
      setMedicines([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    const delay = setTimeout(() => {
      searchMedicines({ search: searchTerm, page: 1, limit: 10 })
        .then((response) => {
          console.log("📦 Search result:", response);

          const results = response?.data?.medicines;
          if (Array.isArray(results)) {
            // ✅ Normalize _id → id for consistency
            const normalized = results.map(med => ({
              ...med,
              id: med.id || med._id,
              price: parseFloat(med.price) || 0
            }));
            setMedicines(normalized);
            setError("");
          } else {
            setMedicines([]);
            setError("No medicines found.");
          }
        })
        .catch((err) => {
          console.error("🚨 Search failed:", err);
          if (err.response?.status === 401) {
            setError("Session expired. Logging out...");
            localStorage.removeItem("token");
            setTimeout(() => (window.location.href = "/login"), 1500);
          } else {
            setError("Failed to search medicines. Please try again.");
          }
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delay);
  }, [searchTerm, open]);

  const handleAdd = (med) => {
    // ✅ Ensure we pass `id` (not _id)
    onAddMedicine({
      id: med.id,  // Now guaranteed to exist
      name: med.name,
      price: med.price,
      description: med.description,
      category: med.category,
      manufacturer: med.manufacturer,
      expiryDate: med.expiryDate,
      barcode: med.barcode
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Search Medicines</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Search by name"
          type="text"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
            {medicines.length === 0 && !loading && !error ? (
              <ListItem>
                <ListItemText primary="No medicines found" secondary="Try a different keyword." />
              </ListItem>
            ) : (
              medicines.map((med) => (
                <ListItem key={med.id} disablePadding>
                  <ListItemButton onClick={() => handleAdd(med)}>
                    <ListItemText
                      primary={med.name}
                      secondary={`$${med.price.toFixed(2)} | ${med.manufacturer || 'N/A'}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}