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
import RoleMenuManagement from "./pages/RoleMenuManagement";
import NotFoundPage from "./pages/NotFoundPage"; // import the 404 page

// Enhanced theme with better customization
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: { main: "#1976d2", light: "#42a5f5", dark: "#1565c0", contrastText: "#ffffff" },
    secondary: { main: "#dc004e", light: "#ff5983", dark: "#9a0036", contrastText: "#ffffff" },
    background: { default: mode === 'light' ? '#f8fafc' : '#0a1929', paper: mode === 'light' ? '#ffffff' : '#132f4c' },
    text: { primary: mode === 'light' ? '#1a2027' : '#ffffff', secondary: mode === 'light' ? '#656f7d' : '#b0bec5' },
    divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme={mode} style={{ zIndex: 9999 }} />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute allowedRoles={["admin", "pharmacist", "cashier", "doctor", "superadmin"]}>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="medicines" element={<MedicineSearchPage />} />

              {/* Billing & Orders */}
              <Route path="orders/create" element={<OrderCreatePage />} />
              <Route path="orders/manage" element={<PrivateRoute allowedRoles={["admin", "pharmacist"]}><OrderManagementPage /></PrivateRoute>} />

              <Route path="receipt/:orderId" element={<ReceiptPage />} />

              {/* Medicines & Inventory */}
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/manage" element={<InventoryManagementPage />} />
              <Route path="inventory/alerts" element={<InventoryAlertsPage />} />
              <Route path="medicines/manage" element={<MedicineManagementPage />} />
              <Route path="suppliers" element={<SupplierManagementPage />} />

              {/* Prescriptions */}
              <Route path="prescriptions" element={<PrescriptionFulfillmentPage />} />
              <Route path="prescriptions/manage" element={<PrescriptionManagementPage />} />

              {/* Admin only */}
              <Route path="users" element={<PrivateRoute allowedRoles={["admin"]}><UserManagementPage /></PrivateRoute>} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="audit-logs" element={<PrivateRoute allowedRoles={["admin"]}><AuditLogPage /></PrivateRoute>} />

              {/* Superadmin Panel */}
              <Route path="superadmin" element={<PrivateRoute allowedRoles={["superadmin"]}><RoleMenuManagement /></PrivateRoute>} />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// PrivateRoute component
function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!user) {
    navigate("/login", { replace: true, state: { from: location } });
    return null;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return children;
}

export default App;
