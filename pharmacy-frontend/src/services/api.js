// src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Change to your backend URL

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== Auth =====
export const login = (credentials) => api.post("/users/login", credentials);
export const verifyToken = (token) =>
  token ? Promise.resolve() : Promise.reject(new Error("No token"));

// ===== Reports =====
export const getDailySales = () => api.get("/reports/daily-sales");
export const getTopMedicines = (limit = 10) => api.get(`/reports/top-medicines?limit=${limit}`);
export const getLowStockAlerts = (threshold = 5) =>
  api.get(`/inventory/low-stock?threshold=${threshold}`);
export const getExpiringSoonAlerts = (days = 30) =>
  api.get(`/inventory/expiring-soon?days=${days}`);

// ===== Orders =====
export const createOrder = (orderData) => api.post("/orders", orderData);

// ===== Medicines =====
export const searchMedicines = (params) => api.get("/medicine/search", { params });
export const createMedicine = (medicineData) => api.post("/medicine", medicineData);
export const getAllMedicines = () => api.get("/medicine");
export const getMedicineById = (id) => api.get(`/medicine/${id}`);
export const updateMedicine = (id, medicineData) => api.put(`/medicine/${id}`, medicineData);
export const deleteMedicine = (id) => api.delete(`/medicine/${id}`);
export const addInventoryToMedicine = (medicineId, inventoryData) =>
  api.post(`/medicine/${medicineId}/inventory`, inventoryData);
export const getLowStockMedicines = (threshold = 5) =>
  api.get(`/medicine/low-stock?threshold=${threshold}`);
export const getExpiringSoonMedicines = (days = 30) =>
  api.get(`/medicine/expiring-soon?days=${days}`);

// ===== Receipts =====
export const generateReceipt = (orderId) => api.get(`/receipts/${orderId}`);
export const downloadReceipt = (orderId) =>
  api.get(`/receipts/${orderId}/download`, { responseType: "blob" });

// ===== Prescriptions =====
export const getPendingPrescriptions = () => api.get("/prescriptions/pending");
export const fulfillPrescription = (prescriptionId) =>
  api.patch(`/prescriptions/${prescriptionId}/fulfill`);
export const cancelPrescription = (prescriptionId) =>
  api.patch(`/prescriptions/${prescriptionId}/cancel`);
export const createPrescription = (prescriptionData) =>
  api.post("/prescriptions", prescriptionData);
export const getCustomerPrescriptions = ({ name, phone }) => {
  return api.get("/prescriptions/search", {
    params: { name, phone }
  });
};

// ===== Inventory Management =====
export const addBatch = (batchData) => api.post("/inventory/batch", batchData);
export const updateBatch = (id, batchData) => api.put(`/inventory/batch/${id}`, batchData);
export const getBatchesByMedicine = (medicineId) => api.get(`/inventory/medicine/${medicineId}`);
export const getBatchById = (id) => api.get(`/inventory/batch/${id}`);

// ===== User Management =====
export const createUser = (userData) => api.post("/users/register", userData);
export const changePassword = (passwordData) => api.put("/users/password", passwordData);
export const updateUserStatus = (id, status) =>
  api.patch(`/users/${id}/status`, { status }); // ✅ Supports both suspend & activate
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getAllUsers = () => api.get("/users");

// ===== Supplier Management =====
export const createSupplier = (supplierData) => api.post("/suppliers", supplierData);
export const getAllSuppliers = () => api.get("/suppliers");
export const searchSuppliers = (name) => api.get(`/suppliers/search?name=${name}`);
export const getSupplierById = (id) => api.get(`/suppliers/${id}`);
export const updateSupplier = (id, supplierData) => api.put(`/suppliers/${id}`, supplierData);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

// Grouped exports for scalability
export const reportsApi = { getDailySales, getTopMedicines, getLowStockAlerts, getExpiringSoonAlerts };
export const ordersApi = { create: createOrder };
export const medicinesApi = { search: searchMedicines };
export const receiptsApi = { generate: generateReceipt, download: downloadReceipt };
export const prescriptionsApi = { getPending: getPendingPrescriptions, fulfill: fulfillPrescription, cancel: cancelPrescription, create: createPrescription, search: getCustomerPrescriptions };
export const inventoryApi = { lowStock: getLowStockAlerts, expiringSoon: getExpiringSoonAlerts };

export default api;