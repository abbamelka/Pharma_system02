// src/pages/MedicineSearchPage.js
import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { searchMedicines } from "../services/api";

export default function MedicineSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const response = await searchMedicines({ search: searchTerm });
      setMedicines(response.data.data);
    } catch (err) {
      console.error("Error searching medicines:", err);
      setError("Failed to search medicines");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Search Medicines
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search by name or barcode"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        {medicines.map((med) => (
          <Grid item xs={12} sm={6} md={4} key={med.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{med.name}</Typography>
                <Typography color="textSecondary">Category: {med.category}</Typography>
                <Typography variant="h5">${med.price}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading && medicines.length === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {medicines.length === 0 && !loading && !error && (
        <Typography align="center" color="textSecondary" sx={{ mt: 4 }}>
          Start typing to search for medicines...
        </Typography>
      )}
    </Container>
  );
}