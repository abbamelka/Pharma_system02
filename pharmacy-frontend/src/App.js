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
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
import AuditLogPage from "./pages/AuditLogPage"; // ✅ Import new page

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} />
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
              <Route path="orders/create" element={<OrderCreatePage />} />
              <Route path="prescriptions" element={<PrescriptionFulfillmentPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="receipt/:orderId" element={<ReceiptPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="change-password" element={<ChangePasswordPage />} />
              <Route path="inventory/manage" element={<InventoryManagementPage />} />
              <Route path="inventory/alerts" element={<InventoryAlertsPage />} />
              <Route path="medicines/manage" element={<MedicineManagementPage />} />
              <Route path="suppliers" element={<SupplierManagementPage />} />
              <Route path="prescriptions/manage" element={<PrescriptionManagementPage />} />

              {/* ✅ Admin-only: Audit Logs */}
              <Route
                path="audit-logs"
                element={
                  <PrivateRoute allowedRoles={["admin"]}>
                    <AuditLogPage />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ✅ Reusable PrivateRoute Component
function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <div>Loading...</div>;

  if (!user || !allowedRoles.includes(user.role)) {
    navigate("/login", { replace: true, state: { from: location } });
    return null;
  }

  return children;
}

export default App;