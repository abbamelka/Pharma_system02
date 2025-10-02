// src/components/Layout.js
import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
  Typography,
  CssBaseline,
  Divider,
  Menu,
  MenuItem,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  LocalPharmacy as MedicineIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  History as HistoryIcon, // ✅ Add History icon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Outlet } from "react-router-dom";

const drawerWidth = 240;

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  if (!user) {
    return (
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap>Pharmacy Mgmt</Typography>
          </Toolbar>
          <Divider />
          <List>
            <ListItem>
              <ListItemText primary="Loading user..." />
            </ListItem>
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: 'background.default',
            color: 'text.primary',
            minHeight: '100vh',
            p: 3
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    );
  }

  const username = user.username || user.email?.split("@")[0] || "User";
  const role = user.role || "user";

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard", roles: ["admin"] },
    { text: "Create Order", icon: <ReceiptIcon />, path: "/orders/create", roles: ["admin", "cashier"] },
    { text: "Inventory", icon: <InventoryIcon />, path: "/inventory", roles: ["admin", "pharmacist"] },
    { text: "Prescriptions", icon: <DescriptionIcon />, path: "/prescriptions", roles: ["admin", "pharmacist", "doctor"] },
    { text: "Inventory Management", icon: <InventoryIcon />, path: "/inventory/manage", roles: ["admin", "pharmacist"] },
    { text: "Inventory Alerts", icon: <WarningIcon />, path: "/inventory/alerts", roles: ["admin", "pharmacist"] },
    { text: "Medicine Management", icon: <MedicineIcon />, path: "/medicines/manage", roles: ["admin", "pharmacist"] },
    { text: "Supplier Management", icon: <BusinessIcon />, path: "/suppliers", roles: ["admin", "pharmacist"] },
    { text: "Prescription Management", icon: <DescriptionIcon />, path: "/prescriptions/manage", roles: ["admin", "pharmacist", "doctor"] },
    
    // ✅ Add Audit Logs (Admin only)
    { text: "Audit Logs", icon: <HistoryIcon />, path: "/audit-logs", roles: ["admin"] },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(role)
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: 'background.paper',
            color: 'text.primary'
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Pharmacy Mgmt
          </Typography>
        </Toolbar>
        <Divider />

        <List>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon>
                  {React.cloneElement(item.icon, {
                    sx: { color: 'primary.main' }
                  })}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        <List>
          {/* Theme Toggle */}
          <ListItem disablePadding>
            <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`} arrow>
              <ListItemButton onClick={toggleTheme} sx={{ px: 2.5 }}>
                <ListItemIcon>
                  {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </ListItemIcon>
                <ListItemText primary={`${mode === 'light' ? 'Dark' : 'Light'} Mode`} />
              </ListItemButton>
            </Tooltip>
          </ListItem>

          {/* User Profile */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleMenuOpen} sx={{ px: 2.5 }}>
              <Avatar
                alt={username}
                sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "14px", mr: 1 }}
              >
                {username.charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="medium">
                    {username}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="textSecondary">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ 
            elevation: 4, 
            sx: { mt: 1.5, minWidth: 200 } 
          }}
        >
          <MenuItem onClick={() => handleNavigate("/change-password")}>
            <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Change Password" />
          </MenuItem>

          {role === "admin" && (
            <MenuItem onClick={() => handleNavigate("/users")}>
              <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="User Management" />
            </MenuItem>
          )}

          <Divider />

          <MenuItem onClick={logout} sx={{ color: "error.main" }}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          color: 'text.primary',
          minHeight: '100vh',
          p: 3
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}