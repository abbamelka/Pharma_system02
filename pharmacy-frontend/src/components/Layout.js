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
  alpha,
  useTheme,
  Badge,
  Chip,
  Collapse,
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
  History as HistoryIcon,
  ListAlt as ListAltIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  MedicalServices,
  Notifications,
  Settings,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { Outlet } from "react-router-dom";

const drawerWidth = 280;
const collapsedDrawerWidth = 70;

export default function Layout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({});

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
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
            '& .MuiDrawer-paper': { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
            },
          }}
        >
          <Toolbar sx={{ justifyContent: 'center' }}>
            <MedicalServices sx={{ mr: 2 }} />
            <Typography variant="h6" noWrap sx={{ fontWeight: 'bold' }}>
              PharmaCare
            </Typography>
          </Toolbar>
          <Divider sx={{ borderColor: alpha('#fff', 0.2) }} />
          <List>
            <ListItem>
              <ListItemText 
                primary="Loading user..." 
                sx={{ color: 'white', textAlign: 'center' }} 
              />
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

  // Enhanced menu structure with sections
  const menuSections = [
    {
      title: "Dashboard",
      items: [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard", roles: ["admin"], badge: 0 },
      ]
    },
    {
      title: "Billing & Orders",
      items: [
        { text: "Create Order", icon: <ReceiptIcon />, path: "/orders/create", roles: ["admin", "cashier"], badge: 0 },
        { text: "Order Management", icon: <ListAltIcon />, path: "/orders/manage", roles: ["admin", "pharmacist"], badge: 3 },
      ]
    },
    {
      title: "Medicines & Inventory",
      items: [
        { text: "Medicine Management", icon: <MedicineIcon />, path: "/medicines/manage", roles: ["admin", "pharmacist"], badge: 0 },
        { text: "Inventory Management", icon: <InventoryIcon />, path: "/inventory/manage", roles: ["admin", "pharmacist"], badge: 5 },
        { text: "Inventory Alerts", icon: <WarningIcon />, path: "/inventory/alerts", roles: ["admin", "pharmacist"], badge: 2 },
        { text: "Supplier Management", icon: <BusinessIcon />, path: "/suppliers", roles: ["admin", "pharmacist"], badge: 0 },
      ]
    },
    {
      title: "Prescriptions",
      items: [
        { text: "Prescriptions", icon: <DescriptionIcon />, path: "/prescriptions", roles: ["admin", "pharmacist", "doctor"], badge: 0 },
        { text: "Prescription Management", icon: <DescriptionIcon />, path: "/prescriptions/manage", roles: ["admin", "pharmacist", "doctor"], badge: 7 },
      ]
    },
    {
      title: "Administration",
      items: [
        { text: "User Management", icon: <PeopleIcon />, path: "/users", roles: ["admin"], badge: 0 },
        { text: "Audit Logs", icon: <HistoryIcon />, path: "/audit-logs", roles: ["admin"], badge: 0 },
      ]
    }
  ];

  const getFilteredMenuItems = () => {
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(role))
    })).filter(section => section.items.length > 0);
  };

  const filteredMenuSections = getFilteredMenuItems();

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
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

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? collapsedDrawerWidth : drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          [`& .MuiDrawer-paper`]: {
            width: collapsed ? collapsedDrawerWidth : drawerWidth,
            boxSizing: "border-box",
            backgroundColor: 'background.paper',
            color: 'text.primary',
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.paper} 100%)`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {/* Header */}
        <Toolbar 
          sx={{ 
            justifyContent: collapsed ? 'center' : 'space-between',
            minHeight: '80px !important',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MedicalServices 
                sx={{ 
                  mr: 2, 
                  color: 'primary.main',
                  fontSize: 32
                }} 
              />
              <Box>
                <Typography variant="h6" noWrap component="div" fontWeight="bold">
                  PharmaCare
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Management System
                </Typography>
              </Box>
            </Box>
          )}
          {collapsed && (
            <MedicalServices 
              sx={{ 
                color: 'primary.main',
                fontSize: 32
              }} 
            />
          )}
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <IconButton 
              onClick={toggleCollapse}
              size="small"
              sx={{
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        </Toolbar>

        <Divider />

        {/* Navigation Menu */}
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          {filteredMenuSections.map((section, index) => (
            <Box key={section.title}>
              {!collapsed && (
                <ListItem sx={{ py: 1 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.7rem'
                    }}
                  >
                    {section.title}
                  </Typography>
                </ListItem>
              )}
              
              <List dense sx={{ py: 0 }}>
                {section.items.map((item) => (
                  <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton 
                      onClick={() => navigate(item.path)}
                      sx={{
                        mx: 1,
                        borderRadius: 2,
                        py: 1.2,
                        backgroundColor: isActivePath(item.path) 
                          ? alpha(theme.palette.primary.main, 0.1)
                          : 'transparent',
                        border: isActivePath(item.path) 
                          ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                          : '1px solid transparent',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                        justifyContent: collapsed ? 'center' : 'flex-start',
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: collapsed ? 'auto' : 40,
                        color: isActivePath(item.path) ? 'primary.main' : 'text.secondary'
                      }}>
                        {item.badge > 0 ? (
                          <Badge badgeContent={item.badge} color="error" variant="dot">
                            {item.icon}
                          </Badge>
                        ) : (
                          item.icon
                        )}
                      </ListItemIcon>
                      
                      {!collapsed && (
                        <>
                          <ListItemText 
                            primary={item.text}
                            primaryTypographyProps={{
                              fontSize: '0.9rem',
                              fontWeight: isActivePath(item.path) ? 'bold' : 'normal',
                              color: isActivePath(item.path) ? 'primary.main' : 'text.primary'
                            }}
                          />
                          {item.badge > 0 && (
                            <Chip 
                              label={item.badge} 
                              size="small" 
                              color="error"
                              sx={{ height: 20, minWidth: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </>
                      )}
                    </ListItemButton>
                    
                    {collapsed && (
                      <Tooltip title={item.text} placement="right" arrow>
                        <Box sx={{ position: 'absolute', right: 8 }}>
                          {item.badge > 0 && (
                            <Chip 
                              label={item.badge} 
                              size="small" 
                              color="error"
                              sx={{ 
                                height: 16, 
                                minWidth: 16, 
                                fontSize: '0.6rem',
                                position: 'absolute',
                                top: 8,
                                right: 8
                              }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    )}
                  </ListItem>
                ))}
              </List>
              
              {index < filteredMenuSections.length - 1 && !collapsed && (
                <Divider sx={{ my: 1, opacity: 0.5 }} />
              )}
            </Box>
          ))}
        </Box>

        {/* Footer Section */}
        <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`} arrow>
            <ListItemButton 
              onClick={toggleTheme}
              sx={{ 
                borderRadius: 2,
                mb: 1,
                justifyContent: collapsed ? 'center' : 'flex-start'
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40 }}>
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText primary={`${mode === 'light' ? 'Dark' : 'Light'} Mode`} />
              )}
            </ListItemButton>
          </Tooltip>

          {/* User Profile */}
          <ListItemButton 
            onClick={handleMenuOpen}
            sx={{ 
              borderRadius: 2,
              justifyContent: collapsed ? 'center' : 'flex-start'
            }}
          >
            <Avatar
              alt={username}
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: theme.palette[getRoleColor(role)].main,
                fontSize: "14px",
                mr: collapsed ? 0 : 1 
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
            
            {!collapsed && (
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight="medium" noWrap>
                  {username}
                </Typography>
                <Typography variant="caption" color="textSecondary" noWrap>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Typography>
              </Box>
            )}
          </ListItemButton>
        </Box>
      </Drawer>

      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ 
          elevation: 8, 
          sx: { 
            mt: 1.5, 
            minWidth: 200,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          } 
        }}
      >
        <MenuItem onClick={() => handleNavigate("/change-password")}>
          <ListItemIcon><LockIcon fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText primary="Change Password" />
        </MenuItem>

        <MenuItem onClick={() => handleNavigate("/settings")}>
          <ListItemIcon><Settings fontSize="small" color="primary" /></ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>

        {role === "admin" && (
          <MenuItem onClick={() => handleNavigate("/users")}>
            <ListItemIcon><PeopleIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="User Management" />
          </MenuItem>
        )}

        <Divider />

        <MenuItem 
          onClick={logout} 
          sx={{ 
            color: "error.main",
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1),
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          color: 'text.primary',
          minHeight: '100vh',
          p: 3,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: collapsed ? `-${drawerWidth - collapsedDrawerWidth}px` : 0,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}