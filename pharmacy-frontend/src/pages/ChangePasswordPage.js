// src/pages/ChangePasswordPage.js
import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Avatar,
  InputAdornment,
  alpha,
  useTheme,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Security,
  Key,
  Password,
  ArrowBack,
} from "@mui/icons-material";
import { changePassword } from "../services/api";
import { toast } from "react-toastify";

export default function ChangePasswordPage() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await changePassword({ 
        oldPassword: formData.oldPassword, 
        newPassword: formData.newPassword 
      });
      toast.success("🎉 Password changed successfully!");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      const message = err.response?.data?.message || "Failed to change password. Please check your current password.";
      setError(message);
      toast.error("❌ Failed to change password");
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, color: 'grey', label: '' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;

    const colors = ['error', 'warning', 'info', 'success'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    
    return {
      strength: (strength / 4) * 100,
      color: colors[strength - 1] || 'error',
      label: labels[strength - 1] || 'Very Weak'
    };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          textAlign: "center", 
          mb: 6,
          background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: 4,
          py: 4,
          px: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Security sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Change Password
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Secure your account with a new password
        </Typography>
      </Box>

      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Card 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Card Header */}
              <Box
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  p: 3,
                  textAlign: 'center',
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    width: 60,
                    height: 60,
                    mb: 2,
                    mx: 'auto'
                  }}
                >
                  <Lock fontSize="large" />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Update Your Password
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Enter your current password and set a new secure password
                </Typography>
              </Box>

              {/* Form Section */}
              <Box sx={{ p: 4 }}>
                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Current Password */}
                    <Grid item xs={12}>
                      <TextField
                        label="Current Password"
                        type={showPasswords.old ? "text" : "password"}
                        fullWidth
                        value={formData.oldPassword}
                        onChange={handleChange('oldPassword')}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Key color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={showPasswords.old ? "Hide password" : "Show password"}>
                                <IconButton
                                  onClick={() => togglePasswordVisibility('old')}
                                  edge="end"
                                >
                                  {showPasswords.old ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* New Password */}
                    <Grid item xs={12}>
                      <TextField
                        label="New Password"
                        type={showPasswords.new ? "text" : "password"}
                        fullWidth
                        value={formData.newPassword}
                        onChange={handleChange('newPassword')}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Password color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={showPasswords.new ? "Hide password" : "Show password"}>
                                <IconButton
                                  onClick={() => togglePasswordVisibility('new')}
                                  edge="end"
                                >
                                  {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {formData.newPassword && (
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box
                              sx={{
                                flexGrow: 1,
                                height: 4,
                                backgroundColor: theme.palette.grey[300],
                                borderRadius: 2,
                                overflow: 'hidden'
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${passwordStrength.strength}%`,
                                  height: '100%',
                                  backgroundColor: theme.palette[passwordStrength.color].main,
                                  transition: 'all 0.3s ease'
                                }}
                              />
                            </Box>
                            <Typography 
                              variant="caption" 
                              color={`${passwordStrength.color}.main`}
                              fontWeight="medium"
                            >
                              {passwordStrength.label}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="textSecondary">
                            Use at least 6 characters with uppercase, lowercase, numbers, and symbols
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    {/* Confirm Password */}
                    <Grid item xs={12}>
                      <TextField
                        label="Confirm New Password"
                        type={showPasswords.confirm ? "text" : "password"}
                        fullWidth
                        value={formData.confirmPassword}
                        onChange={handleChange('confirmPassword')}
                        required
                        error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword}
                        helperText={
                          formData.confirmPassword && formData.newPassword !== formData.confirmPassword 
                            ? "Passwords do not match" 
                            : ""
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CheckCircle color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title={showPasswords.confirm ? "Hide password" : "Show password"}>
                                <IconButton
                                  onClick={() => togglePasswordVisibility('confirm')}
                                  edge="end"
                                >
                                  {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                            transform: 'translateY(-1px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? "Updating Password..." : "Change Password"}
                      </Button>
                    </Grid>
                  </Grid>
                </form>

                {/* Security Tips */}
                <Box
                  sx={{
                    mt: 4,
                    p: 3,
                    backgroundColor: alpha(theme.palette.info.main, 0.04),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                  }}
                >
                  <Typography variant="h6" gutterBottom color="info.main" fontWeight="bold">
                    💡 Password Tips
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Use at least 6 characters<br/>
                    • Include uppercase and lowercase letters<br/>
                    • Add numbers and special characters<br/>
                    • Avoid common words and personal information<br/>
                    • Don't reuse passwords from other sites
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}