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
  Card,
  CardContent,
  Grid,
  Avatar,
  InputAdornment,
  Tooltip,
  IconButton,
  alpha,
  useTheme,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Add,
  Person,
  Email,
  Lock,
  Security,
  Refresh,
  Search,
  Visibility,
  Edit,
  Delete,
  LockReset,
  Block,
  CheckCircle,
  Warning,
  AdminPanelSettings,
  LocalPharmacy,
  Receipt,
  MedicalServices,
  Group,
  TrendingUp,
  CheckCircleOutline,
  Cancel,
} from "@mui/icons-material";

import TableSkeleton from "../components/skeletons/TableSkeleton";
import { getAllUsers, createUser, updateUserStatus, deleteUser, resetUserPassword } from "../services/api";
import { toast } from "react-toastify";

export default function UserManagementPage() {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openResetModal, setOpenResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
      toast.error("❌ Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Statistics
  const stats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    pharmacist: users.filter(u => u.role === 'pharmacist').length,
    cashier: users.filter(u => u.role === 'cashier').length,
    doctor: users.filter(u => u.role === 'doctor').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

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
      toast.success("🎉 User created successfully!");
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
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await deleteUser(id);
      toast.success("🗑️ User deleted successfully!");
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to delete user";
      toast.error(`❌ ${msg}`);
    }
  };

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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings />;
      case 'pharmacist': return <LocalPharmacy />;
      case 'cashier': return <Receipt />;
      case 'doctor': return <MedicalServices />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'pharmacist': return 'primary';
      case 'cashier': return 'secondary';
      case 'doctor': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "60vh",
          flexDirection: "column",
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading user data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" onClick={fetchUsers}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          textAlign: "center", 
          mb: 6,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: 4,
          py: 4,
          px: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Group sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          User Management
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Manage system users, roles, and access permissions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mb: 2, mx: 'auto' }}>
                <Group />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Total Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mb: 2, mx: 'auto' }}>
                <AdminPanelSettings />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {stats.admin}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Administrators
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', mb: 2, mx: 'auto' }}>
                <LocalPharmacy />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {stats.pharmacist}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Pharmacists
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', mb: 2, mx: 'auto' }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.active}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Active Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mb: 2, mx: 'auto' }}>
                <Block />
              </Avatar>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.suspended}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Suspended
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="Search Users"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username, email, or role..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="pharmacist">Pharmacist</MenuItem>
                  <MenuItem value="cashier">Cashier</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenCreateModal(true)}
                  sx={{ flex: 1 }}
                >
                  Create User
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Showing {filteredUsers.length} of {users.length} users
        </Typography>
        {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            color="secondary"
            onClick={() => {
              setSearchTerm("");
              setRoleFilter("all");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Users Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell><strong>User Details</strong></TableCell>
              <TableCell><strong>Contact Information</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Group sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No users found
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Create your first user to get started'
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow 
                  key={user.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                    } 
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography fontWeight="bold" gutterBottom>
                        {user.username}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: #{user.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role.toUpperCase()}
                      color={getRoleColor(user.role)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={user.status === 'active' ? <CheckCircleOutline /> : <Cancel />}
                      label={user.status.toUpperCase()}
                      color={user.status === 'active' ? 'success' : 'error'}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Reset Password">
                        <IconButton
                          color="warning"
                          size="small"
                          onClick={() => handleOpenResetModal(user)}
                          sx={{
                            '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.1) }
                          }}
                        >
                          <LockReset />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.status === 'active' ? 'Suspend User' : 'Activate User'}>
                        <IconButton
                          color={user.status === 'active' ? 'error' : 'success'}
                          size="small"
                          onClick={() => handleSuspendUser(user.id, user.status)}
                          sx={{
                            '&:hover': { 
                              backgroundColor: alpha(
                                user.status === 'active' ? theme.palette.error.main : theme.palette.success.main, 
                                0.1
                              ) 
                            }
                          }}
                        >
                          {user.status === 'active' ? <Block /> : <CheckCircle />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteUser(user.id)}
                          sx={{
                            '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Enhanced Modals */}
      <EnhancedUserModal
        open={openCreateModal}
        title="Create New User"
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleCreateUser}
        handleClose={() => setOpenCreateModal(false)}
        submitText="Create User"
        submitIcon={<CheckCircle />}
      />

      <EnhancedResetModal
        open={openResetModal}
        user={selectedUser}
        resetData={resetData}
        handleResetChange={handleResetChange}
        handleSubmit={handleResetPassword}
        handleClose={() => setOpenResetModal(false)}
      />
    </Container>
  );
}

// Enhanced Create/Edit User Modal
function EnhancedUserModal({ 
  open, 
  title, 
  formData, 
  handleInputChange, 
  handleSubmit, 
  handleClose, 
  submitText,
  submitIcon 
}) {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        backgroundColor: alpha(theme.palette.primary.main, 0.04)
      }}>
        <Person color="primary" />
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="username"
              label="Username"
              fullWidth
              value={formData.username}
              onChange={handleInputChange}
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleInputChange}
              required
              inputProps={{ minLength: 6 }}
              helperText="Minimum 6 characters"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleInputChange}
              >
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="pharmacist">Pharmacist</MenuItem>
                <MenuItem value="cashier">Cashier</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          startIcon={submitIcon}
          sx={{ px: 4 }}
        >
          {submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Enhanced Reset Password Modal
function EnhancedResetModal({ 
  open, 
  user, 
  resetData, 
  handleResetChange, 
  handleSubmit, 
  handleClose 
}) {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        backgroundColor: alpha(theme.palette.warning.main, 0.04)
      }}>
        <LockReset color="warning" />
        <Typography variant="h6" fontWeight="bold">
          Reset Password
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {user && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: alpha(theme.palette.info.main, 0.04), borderRadius: 2 }}>
            <Typography variant="body1" fontWeight="medium">
              {user.username}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ID: #{user.id} • {user.role.toUpperCase()} • {user.email}
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="newPassword"
              label="New Password"
              type="password"
              fullWidth
              value={resetData.newPassword}
              onChange={handleResetChange}
              required
              placeholder="Enter new password (min 6 chars)"
              inputProps={{ minLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              fullWidth
              value={resetData.confirmPassword}
              onChange={handleResetChange}
              required
              error={resetData.confirmPassword && resetData.newPassword !== resetData.confirmPassword}
              helperText={
                resetData.confirmPassword && resetData.newPassword !== resetData.confirmPassword 
                  ? "Passwords do not match" 
                  : ""
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CheckCircle color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleClose} 
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="warning"
          startIcon={<LockReset />}
          sx={{ px: 4 }}
        >
          Reset Password
        </Button>
      </DialogActions>
    </Dialog>
  );
}