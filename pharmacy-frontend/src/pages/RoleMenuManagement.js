import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  getAllUsers,
  getAllRoles,
  getUserRoles,
  assignRoleToUser,
  removeRoleFromUser,
  getMenusByRole,
  assignMenuToRole,
  removeMenuFromRole,
  fetchAllMenus,
} from "../services/api";

export default function RoleMenuManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleMenus, setRoleMenus] = useState([]);
  const [allMenus, setAllMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Safe data extraction helper
  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.data)) return response.data.data;
    if (Array.isArray(response.data?.users)) return response.data.users;
    if (Array.isArray(response.data?.roles)) return response.data.roles;
    if (Array.isArray(response.data?.menus)) return response.data.menus;
    return [];
  };

  // ✅ Load all users, roles, and menus once
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [uRes, rRes, mRes] = await Promise.all([
          getAllUsers(),
          getAllRoles(),
          fetchAllMenus(),
        ]);
        
        setUsers(extractData(uRes) || []);
        setRoles(extractData(rRes) || []);
        setAllMenus(extractData(mRes) || []);
        
      } catch (err) {
        console.error("❌ Error loading initial data:", err.response?.data || err.message);
        setError("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // ✅ Load roles of selected user
  useEffect(() => {
    const fetchUserRolesData = async () => {
      if (!selectedUser) {
        setUserRoles([]);
        return;
      }
      try {
        const res = await getUserRoles(selectedUser.id);
        setUserRoles(extractData(res) || []);
      } catch (err) {
        console.error("❌ Failed to load user roles:", err.response?.data || err.message);
        setError("Failed to load user roles");
        setUserRoles([]);
      }
    };
    fetchUserRolesData();
  }, [selectedUser]);

  // ✅ Load menus of selected role
  useEffect(() => {
    const fetchRoleMenusData = async () => {
      if (!selectedRole) {
        setRoleMenus([]);
        return;
      }
      try {
        const res = await getMenusByRole(selectedRole.id);
        setRoleMenus(extractData(res) || []);
      } catch (err) {
        console.error("❌ Failed to load role menus:", err.response?.data || err.message);
        setError("Failed to load role menus");
        setRoleMenus([]);
      }
    };
    fetchRoleMenusData();
  }, [selectedRole]);

  // ✅ Assign Role to User
  const handleAssignRole = async (roleId) => {
    if (!selectedUser) return;
    try {
      await assignRoleToUser({ userId: selectedUser.id, roleId });
      const res = await getUserRoles(selectedUser.id);
      setUserRoles(extractData(res) || []);
      setSuccess("Role assigned successfully");
    } catch (err) {
      console.error("❌ Error assigning role:", err.response?.data || err.message);
      setError("Failed to assign role");
    }
  };

  // ✅ Remove Role from User
  const handleRemoveRole = async (roleId) => {
    if (!selectedUser) return;
    try {
      await removeRoleFromUser({ userId: selectedUser.id, roleId });
      const res = await getUserRoles(selectedUser.id);
      setUserRoles(extractData(res) || []);
      setSuccess("Role removed successfully");
    } catch (err) {
      console.error("❌ Error removing role:", err.response?.data || err.message);
      setError("Failed to remove role");
    }
  };

  // ✅ Assign Menu to Role
  const handleAssignMenu = async (menuId) => {
    if (!selectedRole) return;
    try {
      await assignMenuToRole({ roleId: selectedRole.id, menuId });
      const res = await getMenusByRole(selectedRole.id);
      setRoleMenus(extractData(res) || []);
      setSuccess("Menu assigned successfully");
    } catch (err) {
      console.error("❌ Error assigning menu:", err.response?.data || err.message);
      setError("Failed to assign menu");
    }
  };

  // ✅ Remove Menu from Role
  const handleRemoveMenu = async (menuId) => {
    if (!selectedRole) return;
    try {
      await removeMenuFromRole({ roleId: selectedRole.id, menuId });
      const res = await getMenusByRole(selectedRole.id);
      setRoleMenus(extractData(res) || []);
      setSuccess("Menu removed successfully");
    } catch (err) {
      console.error("❌ Error removing menu:", err.response?.data || err.message);
      setError("Failed to remove menu");
    }
  };

  // ✅ Handle snackbar close
  const handleCloseSnackbar = () => {
    setError("");
    setSuccess("");
  };

  // ✅ Loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Loading Role Management...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        🧩 Superadmin Role & Menu Management
      </Typography>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="error" onClose={handleCloseSnackbar}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity="success" onClose={handleCloseSnackbar}>
          {success}
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* Users & Roles */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Users</Typography>
            
            {!users || users.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No users found
              </Typography>
            ) : (
              <List sx={{ maxHeight: 300, overflowY: "auto" }}>
                {users.map((user) => (
                  <ListItem
                    key={user.id}
                    button
                    selected={selectedUser?.id === user.id}
                    onClick={() => setSelectedUser(user)}
                  >
                    <ListItemText 
                      primary={user.username} 
                      secondary={user.email || user.role || "No role"} 
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {selectedUser && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Roles of <strong>{selectedUser.username}</strong>
                </Typography>
                
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {!userRoles || userRoles.length === 0 ? (
                    <Typography color="text.secondary">No roles assigned</Typography>
                  ) : (
                    userRoles.map((r) => (
                      <Chip
                        key={r.id}
                        label={r.name || r.roleName || "Unknown"}
                        color="primary"
                        onDelete={() => handleRemoveRole(r.id)}
                      />
                    ))
                  )}
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Add Role</InputLabel>
                  <Select
                    value=""
                    label="Add Role"
                    onChange={(e) => handleAssignRole(e.target.value)}
                  >
                    {roles
                      .filter((r) => !userRoles.find((ur) => ur.id === r.id))
                      .map((r) => (
                        <MenuItem key={r.id} value={r.id}>
                          {r.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Paper>
        </Grid>

        {/* Roles & Menus */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Roles</Typography>
            
            {!roles || roles.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No roles found
              </Typography>
            ) : (
              <List sx={{ maxHeight: 300, overflowY: "auto" }}>
                {roles.map((role) => (
                  <ListItem
                    key={role.id}
                    button
                    selected={selectedRole?.id === role.id}
                    onClick={() => setSelectedRole(role)}
                  >
                    <ListItemText primary={role.name} />
                  </ListItem>
                ))}
              </List>
            )}

            {selectedRole && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Menus for <strong>{selectedRole.name}</strong>
                </Typography>
                
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {!roleMenus || roleMenus.length === 0 ? (
                    <Typography color="text.secondary">No menus assigned</Typography>
                  ) : (
                    roleMenus.map((m) => (
                      <Chip
                        key={m.id}
                        label={m.text || m.title || m.name || "Unknown"}
                        color="secondary"
                        onDelete={() => handleRemoveMenu(m.id)}
                      />
                    ))
                  )}
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Add Menu</InputLabel>
                  <Select
                    value=""
                    label="Add Menu"
                    onChange={(e) => handleAssignMenu(e.target.value)}
                  >
                    {allMenus
                      .filter((m) => !roleMenus.find((rm) => rm.id === m.id))
                      .map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.text || m.title || m.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}