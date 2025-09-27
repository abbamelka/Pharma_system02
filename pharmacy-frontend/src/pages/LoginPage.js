// src/pages/LoginPage.js
import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    try {
      await login({ email, password });
      toast.success("Login successful!");

      // Get user role from localStorage (set by AuthContext after login)
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      // Decode JWT to get role
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      const role = decoded.role;

      // Redirect based on role
      let redirectPath = "/dashboard"; // Default for admin

      switch (role) {
        case "cashier":
          redirectPath = "/orders/create";
          break;
        case "doctor":
          redirectPath = "/prescriptions/manage";
          break;
        case "pharmacist":
          redirectPath = "/medicines/manage";
          break;
        default:
          redirectPath = "/dashboard"; // admin or unknown role
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        setApiError("Invalid email or password");
        toast.error("Invalid credentials");
      } else {
        setApiError("Network error. Please try again.");
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" align="center" gutterBottom>
            Pharmacy Management
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" gutterBottom>
            Sign in to continue
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}