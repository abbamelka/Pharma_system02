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
  Card,
  CardContent,
  Grid,
  Avatar,
  InputAdornment,
  IconButton,
  alpha,
  useTheme,
  Divider,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  MedicalServices,
  LocalPharmacy,
  Security,
  Person,
  ArrowForward,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const theme = useTheme();
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
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleDemoLogin = (role) => {
    const demoCredentials = {
      admin: { email: "admin@example.com", password: "password123" },
      pharmacist: { email: "pharmacist@example.com", password: "password123" },
      cashier: { email: "cashier@example.com", password: "password123" },
      doctor: { email: "doctor@example.com", password: "password123" }
    };

    const credentials = demoCredentials[role];
    if (credentials) {
      setFormData(credentials);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
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
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: alpha(theme.palette.primary.contrastText, 0.1),
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
          background: alpha(theme.palette.secondary.contrastText, 0.08),
          animation: "float 8s ease-in-out infinite",
        }}
      />

      <Container maxWidth="lg">
        <Grid container alignItems="center" justifyContent="center">
          {/* Left Side - Branding */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Zoom in={true} timeout={800}>
              <Box sx={{ textAlign: "center", color: "white", pr: 4 }}>
                <LocalPharmacy 
                  sx={{ 
                    fontSize: 120, 
                    mb: 3,
                    filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))"
                  }} 
                />
                <Typography 
                  variant="h2" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{
                    textShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    mb: 2
                  }}
                >
                  PharmaCare
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    opacity: 0.9,
                    mb: 4,
                    textShadow: "0 2px 8px rgba(0,0,0,0.2)"
                  }}
                >
                  Advanced Pharmacy Management System
                </Typography>
                
                {/* Features List */}
                <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
                  {[
                    "🏥 Complete Inventory Management",
                    "💊 Prescription Tracking",
                    "💰 Sales & Billing System",
                    "👥 Multi-role Access Control",
                    "📊 Real-time Analytics"
                  ].map((feature, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckCircle sx={{ mr: 2, color: theme.palette.success.light }} />
                      <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Zoom>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} md={6}>
            <Fade in={true} timeout={600}>
              <Card 
                sx={{ 
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <CardContent sx={{ p: 5 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 80,
                        height: 80,
                        mb: 3,
                        mx: 'auto',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                      }}
                    >
                      <Security sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h3" fontWeight="bold" gutterBottom color="primary">
                      Welcome Back
                    </Typography>
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                      Sign in to your account
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Enter your credentials to access the system
                    </Typography>
                  </Box>

                  {apiError && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.error.light}`
                      }}
                    >
                      {apiError}
                    </Alert>
                  )}

                  {/* Login Form */}
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
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
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
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
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
                      sx={{
                        py: 1.5,
                        mt: 3,
                        mb: 2,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        '&:hover': {
                          boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
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
                        { role: 'admin', label: 'Admin', color: 'error' },
                        { role: 'pharmacist', label: 'Pharmacist', color: 'primary' },
                        { role: 'cashier', label: 'Cashier', color: 'secondary' },
                        { role: 'doctor', label: 'Doctor', color: 'info' }
                      ].map((account) => (
                        <Grid item xs={6} key={account.role}>
                          <Button
                            variant="outlined"
                            color={account.color}
                            size="small"
                            fullWidth
                            onClick={() => handleDemoLogin(account.role)}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              py: 0.8
                            }}
                          >
                            {account.label}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Footer */}
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      Secure login powered by JWT authentication
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                      <MedicalServices sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                      <Typography variant="caption" color="textSecondary">
                        PharmaCare Management System v2.0
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </Box>
  );
}