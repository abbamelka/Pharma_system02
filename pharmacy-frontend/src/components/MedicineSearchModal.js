// components/MedicineSearchModal.js
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const abortControllerRef = useRef(null);

  // Create a stable reference to onClose using useCallback
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated. Please log in.");
      setMedicines([]);
      return;
    }

    if (!searchTerm.trim()) {
      setMedicines([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const delay = setTimeout(() => {
      searchMedicines({ search: searchTerm, page: 1, limit: 10 }, controller.signal)
        .then((response) => {
          const results = response?.data?.medicines;
          if (Array.isArray(results)) {
            const normalized = results.map((med) => ({
              id: med.id,
              name: med.name || "Unnamed Medicine",
              price: parseFloat(med.price) || 0,
              description: med.description || "",
              category: med.category || "Unknown",
              manufacturer: med.manufacturer || "N/A",
              expiryDate: med.expiryDate || null,
              barcode: med.barcode || "",
              requiresPrescription: !!med.requiresPrescription // ✅ Critical!
            }));
            setMedicines(normalized);
            setError("");
          } else {
            setMedicines([]);
            setError("No medicines found.");
          }
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          console.error("🚨 Search failed:", err);
          if (err.response?.status === 401) {
            setError("Session expired. Please log in again.");
            localStorage.removeItem("token");
            setTimeout(() => {
              handleClose();
              window.location.href = "/login";
            }, 1000);
          } else {
            setError("Failed to search medicines. Please try again.");
          }
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [searchTerm, open, handleClose]); // Now includes handleClose in dependencies

  const handleAdd = (med) => {
    if (!med.id) return;
    onAddMedicine(med);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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

        {error && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: "auto", mt: 2 }}>
            {medicines.length === 0 && !error ? (
              <ListItem>
                <ListItemText
                  primary="No medicines found"
                  secondary="Try a different keyword."
                />
              </ListItem>
            ) : (
              medicines.map((med) => (
                <ListItem key={med.id} disablePadding>
                  <ListItemButton onClick={() => handleAdd(med)}>
                    <ListItemText
                      primary={med.name}
                      secondary={
                        <>
                          ${med.price.toFixed(2)} | {med.manufacturer}
                          <br />
                          <strong style={{ color: med.requiresPrescription ? 'red' : 'green' }}>
                            {med.requiresPrescription ? '℞ Prescription' : 'OTC'}
                          </strong>
                        </>
                      }
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