// src/pages/UserManagementPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

import TableSkeleton from "../components/skeletons/TableSkeleton";
import { getAllUsers, createUser, updateUserStatus, deleteUser, resetUserPassword } from "../services/api";
import { toast } from "react-toastify";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openResetModal, setOpenResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "pharmacist",
  });

  const [resetData, setResetData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAllUsers();

      let usersData = null;
      if (Array.isArray(response.data?.users)) {
        usersData = response.data.users;
      } else if (response.data?.users && Array.isArray(response.data.users.users)) {
        console.warn("⚠️ Detected double-wrapped users response");
        usersData = response.data.users.users;
      } else if (Array.isArray(response.data)) {
        usersData = response.data;
      } else {
        throw new Error("Invalid data format: 'users' array not found");
      }

      const validUsers = usersData.map(user => ({
        id: user.id,
        username: user.username || "Unknown User",
        email: user.email || "No Email",
        role: user.role || "user",
        status: user.status || "active"
      }));

      setUsers(validUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Check your connection or contact support.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await createUser(formData);
      toast.success("✅ User created successfully!");
      fetchUsers();
      setOpenCreateModal(false);
      setFormData({ username: "", email: "", password: "", role: "pharmacist" });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to create user";
      toast.error(`❌ ${msg}`);
    }
  };

  const handleSuspendUser = async (id, currentStatus) => {
    const action = currentStatus === "active" ? "suspend" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const newStatus = action === "suspend" ? "suspended" : "active";
      await updateUserStatus(id, newStatus);
      toast.success(`✅ User ${newStatus === "active" ? "activated" : "suspended"} successfully!`);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to update user status";
      toast.error(`❌ ${msg}`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(id);
      toast.success("🗑️ User deleted successfully!");
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete user";
      toast.error(`❌ ${msg}`);
    }
  };

  // ✅ Open Reset Password Modal
  const handleOpenResetModal = (user) => {
    setSelectedUser(user);
    setResetData({ newPassword: "", confirmPassword: "" });
    setOpenResetModal(true);
  };

  const handleResetPassword = async () => {
    const { newPassword, confirmPassword } = resetData;

    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetUserPassword(selectedUser.id, newPassword);
      toast.success(`✅ Password reset successfully for ${selectedUser.username}`);
      setOpenResetModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password";
      toast.error(`❌ ${msg}`);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            👥 User Management
          </Typography>
        </Box>
        <TableSkeleton rows={5} columns={6} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchUsers}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        👥 User Management
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button variant="contained" color="primary" onClick={() => setOpenCreateModal(true)}>
          Create New User
        </Button>
      </Box>

      {users.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No users found. Create one to get started.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={
                        user.role === "admin"
                          ? "error"
                          : user.role === "pharmacist"
                          ? "primary"
                          : user.role === "doctor"
                          ? "secondary"
                          : "success"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === "active" ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleOpenResetModal(user)}
                      >
                        Reset Password
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color={user.status === "active" ? "error" : "success"}
                        onClick={() => handleSuspendUser(user.id, user.status)}
                      >
                        {user.status === "active" ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create User Modal */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleInputChange}
            required
            inputProps={{ minLength: 6 }}
            helperText="Minimum 6 characters"
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleInputChange}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="pharmacist">Pharmacist</MenuItem>
              <MenuItem value="cashier">Cashier</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} variant="contained">
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={openResetModal} onClose={() => setOpenResetModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password — {selectedUser?.username}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            ID: #{selectedUser?.id} | Role: {selectedUser?.role}
          </Typography>
          <TextField
            margin="dense"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            value={resetData.newPassword}
            onChange={handleResetChange}
            placeholder="Enter new password (min 6 chars)"
            inputProps={{ minLength: 6 }}
          />
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            fullWidth
            value={resetData.confirmPassword}
            onChange={handleResetChange}
            placeholder="Re-enter to confirm"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetModal(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" color="primary">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}