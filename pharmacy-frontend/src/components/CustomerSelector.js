// src/components/CustomerSelector.js
import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import api from "../services/api";

export default function CustomerSelector({ value, onChange, error }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await api.get("/users");
        // Filter for customers or cashiers (you can add role filter in backend later)
        const customerUsers = response.data.data.filter(
          (user) => user.role === "customer" || user.role === "cashier"
        );
        setCustomers(customerUsers);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <Autocomplete
      options={customers}
      getOptionLabel={(option) => option.username || ""}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Customer"
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Typography variant="body1">{option.username}</Typography>
          {option.email && (
            <Typography variant="body2" color="textSecondary">
              {option.email}
            </Typography>
          )}
        </Box>
      )}
    />
  );
}