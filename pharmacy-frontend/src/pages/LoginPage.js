// src/pages/LoginPage.js
import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  Zoom,
  CircularProgress,
  Alert,
  alpha
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  MedicalServices,
  LocalPharmacy,
  Security,
  ArrowForward,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "admin@example.com",
    password: "password123"
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    try {
      await login({ email: formData.email, password: formData.password });
      toast.success("🎉 Login successful!");

      // Get user role from localStorage
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      const role = decoded.role;

      // Redirect based on role
      let redirectPath = "/dashboard"; 
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
        case "superadmin":
          redirectPath = "/superadmin"; // ✅ superadmin goes here
          break;
        default:
          redirectPath = "/dashboard"; 
      }

      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        setApiError("Invalid email or password. Please check your credentials.");
        toast.error("❌ Invalid credentials");
      } else {
        setApiError("Network error. Please check your connection and try again.");
        toast.error("❌ Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      superadmin: { email: "superadmin@example.com", password: "password123" },
      admin: { email: "admin@example.com", password: "password123" },
      pharmacist: { email: "pharmacist@example.com", password: "password123" },
      cashier: { email: "cashier@example.com", password: "password123" },
      doctor: { email: "doctor@example.com", password: "password123" }
    };
    const credentials = demoCredentials[role];
    if (credentials) setFormData(credentials);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, #1976d2 0%, #dc004e 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('/api/placeholder/1200/800')",
          backgroundSize: "cover",
          opacity: 0.1,
        }
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: alpha("#ffffff", 0.1),
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: alpha("#ffffff", 0.08),
          animation: "float 8s ease-in-out infinite",
        }}
      />

      <Container maxWidth="lg">
        <Grid container alignItems="center" justifyContent="center">
          {/* Left - Branding */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Zoom in={true} timeout={800}>
              <Box sx={{ textAlign: "center", color: "white", pr: 4 }}>
                <LocalPharmacy sx={{ fontSize: 120, mb: 3, filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))" }} />
                <Typography variant="h2" fontWeight="bold" gutterBottom>
                  PharmaCare
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9, mb: 4 }}>
                  Advanced Pharmacy Management System
                </Typography>
              </Box>
            </Zoom>
          </Grid>

          {/* Right - Login Form */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={600}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', backdropFilter: 'blur(10px)', background: alpha("#ffffff", 0.95), border: `1px solid ${alpha("#1976d2", 0.1)}` }}>
                <CardContent sx={{ p: 5 }}>
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Avatar sx={{ bgcolor: "#1976d2", width: 80, height: 80, mb: 3, mx: 'auto' }}>
                      <Security sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
                      Welcome Back
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Enter your credentials to access the system
                    </Typography>
                  </Box>

                  {apiError && <Alert severity="error" sx={{ mb: 3 }}>{apiError}</Alert>}

                  <form onSubmit={handleSubmit}>
                    <TextField
                      label="Email Address"
                      type="email"
                      fullWidth
                      value={formData.email}
                      onChange={handleChange('email')}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>,
                      }}
                    />
                    <TextField
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      fullWidth
                      value={formData.password}
                      onChange={handleChange('password')}
                      required
                      sx={{ mb: 1 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Lock color="action" /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={togglePasswordVisibility} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <ArrowForward />}
                      sx={{ py: 1.5, mt: 3, mb: 2, borderRadius: 3, fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none' }}
                    >
                      {loading ? "Signing In..." : "Sign In to Dashboard"}
                    </Button>
                  </form>

                  {/* Demo Accounts */}
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 3 }}>
                      <Typography variant="body2" color="textSecondary">
                        Demo Accounts
                      </Typography>
                    </Divider>
                    <Grid container spacing={1}>
                      {[
                        { role: 'superadmin', label: 'Superadmin', color: 'warning' },
                        { role: 'admin', label: 'Admin', color: 'error' },
                        { role: 'pharmacist', label: 'Pharmacist', color: 'primary' },
                        { role: 'cashier', label: 'Cashier', color: 'secondary' },
                        { role: 'doctor', label: 'Doctor', color: 'info' }
                      ].map(account => (
                        <Grid item xs={6} key={account.role}>
                          <Button
                            variant="outlined"
                            color={account.color}
                            size="small"
                            fullWidth
                            onClick={() => handleDemoLogin(account.role)}
                            sx={{ borderRadius: 2, textTransform: 'none', py: 0.8 }}
                          >
                            {account.label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </Box>
  );
}
