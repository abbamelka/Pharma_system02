// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  CircularProgress,
  alpha,
  Typography,
  Button,
} from "@mui/material";
import { Home } from "@mui/icons-material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeContextProvider, useTheme } from "./context/ThemeContext";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MedicineSearchPage from "./pages/MedicineSearchPage";
import OrderCreatePage from "./pages/OrderCreatePage";
import ReceiptPage from "./pages/ReceiptPage";
import PrescriptionFulfillmentPage from "./pages/PrescriptionFulfillmentPage";
import InventoryPage from "./pages/InventoryPage";
import UserManagementPage from "./pages/UserManagementPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import InventoryManagementPage from "./pages/InventoryManagementPage";
import InventoryAlertsPage from "./pages/InventoryAlertsPage";
import MedicineManagementPage from "./pages/MedicineManagementPage";
import SupplierManagementPage from "./pages/SupplierManagementPage";
import PrescriptionManagementPage from "./pages/PrescriptionManagementPage";
import AuditLogPage from "./pages/AuditLogPage";
import OrderManagementPage from "./pages/OrderManagementPage";

// Enhanced theme with better customization
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036",
      contrastText: "#ffffff",
    },
    background: {
      default: mode === 'light' ? '#f8fafc' : '#0a1929',
      paper: mode === 'light' ? '#ffffff' : '#132f4c',
    },
    text: {
      primary: mode === 'light' ? '#1a2027' : '#ffffff',
      secondary: mode === 'light' ? '#656f7d' : '#b0bec5',
    },
    divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
    ...(mode === 'light' ? {} : {
      background: {
        default: '#0a1929',
        paper: '#132f4c',
      }
    }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: mode === 'light' ? '#f1f1f1' : '#2d3748',
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'light' ? '#c1c1c1' : '#4a5568',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: mode === 'light' ? '#a8a8a8' : '#718096',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
          background: mode === 'light' 
            ? `linear-gradient(180deg, ${alpha('#1976d2', 0.02)} 0%, #ffffff 100%)`
            : `linear-gradient(180deg, ${alpha('#1976d2', 0.1)} 0%, #132f4c 100%)`,
          backdropFilter: 'blur(10px)',
          boxShadow: mode === 'light' 
            ? '0 0 20px rgba(0, 0, 0, 0.08)'
            : '0 0 20px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#132f4c',
          color: mode === 'light' ? '#1a2027' : '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? '0 2px 8px rgba(0, 0, 0, 0.06)'
            : '0 2px 8px rgba(0, 0, 0, 0.2)',
          border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'}`,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeContextProvider>
      <ThemedApp />
    </ThemeContextProvider>
  );
}

function ThemedApp() {
  const { mode } = useTheme();
  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer 
        position="top-right" 
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={mode}
        style={{
          zIndex: 9999,
        }}
      />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute allowedRoles={["admin", "pharmacist", "cashier", "doctor"]}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="medicines" element={<MedicineSearchPage />} />

              {/* 💵 Billing & Orders */}
              <Route path="orders/create" element={<OrderCreatePage />} />
              
              {/* ✅ Order Management - Admin & Pharmacist Only */}
              <Route
                path="orders/manage"
                element={
                  <PrivateRoute allowedRoles={["admin", "pharmacist"]}>
                    <OrderManagementPage />
                  </PrivateRoute>
                }
              />

              <Route path="receipt/:orderId" element={<ReceiptPage />} />

              {/* 🧪 Medicines & Inventory */}
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/manage" element={<InventoryManagementPage />} />
              <Route path="inventory/alerts" element={<InventoryAlertsPage />} />
              <Route path="medicines/manage" element={<MedicineManagementPage />} />
              <Route path="suppliers" element={<SupplierManagementPage />} />

              {/* 📄 Prescriptions */}
              <Route path="prescriptions" element={<PrescriptionFulfillmentPage />} />
              <Route path="prescriptions/manage" element={<PrescriptionManagementPage />} />

              {/* 🔐 Admin Only */}
              <Route 
                path="users" 
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <UserManagementPage />
                  </PrivateRoute>
                } 
              />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route
                path="audit-logs"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <AuditLogPage />
                  </PrivateRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Catch all route for non-existent paths */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Enhanced PrivateRoute Component with better loading state
function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useTheme();

  // Get theme colors for the loading screen
  const primaryColor = mode === 'light' ? '#1976d2' : '#42a5f5';
  const secondaryColor = mode === 'light' ? '#dc004e' : '#ff5983';

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: 3,
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            color: 'white',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            PharmaCare System
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
    // Redirect to login if no user
    navigate("/login", { 
      replace: true, 
      state: { 
        from: location,
        message: "Please login to continue"
      } 
    });
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user doesn't have required role
    navigate("/dashboard", { 
      replace: true,
      state: { 
        error: "You don't have permission to access this page"
      }
    });
    return null;
  }

  return children;
}

// Simple 404 Page component
function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h1" color="primary" fontWeight="bold" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate("/dashboard")}
        startIcon={<Home />}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
}

export default App;