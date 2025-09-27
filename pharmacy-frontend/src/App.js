// src/App.js
import React,{useEffect} from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation, 
  useNavigate,   // ✅ Fixed
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
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [user, loading, navigate, location, allowedRoles]);

  if (loading) return <div>Loading...</div>;
  if (!user || !allowedRoles.includes(user.role)) return null;

  return children;
}

export default App;