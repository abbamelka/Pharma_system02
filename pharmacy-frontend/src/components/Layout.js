// src/components/Layout.js
import React, { useState, useEffect } from "react";
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
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
  alpha,
  Avatar,
  Menu,
  MenuItem,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  LocalPharmacy as MedicineIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Business as BusinessIcon,
  History as HistoryIcon,
  ListAlt as ListAltIcon,
  ChevronLeft,
  ChevronRight,
  MedicalServices,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Translate as TranslateIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import AIChatBot from "./AIChatBot";
import { getUserRoles, getMenusByRole, fetchAllMenus } from "../services/api";

const drawerWidth = 280;
const collapsedDrawerWidth = 70;

// Icon mapping
const iconMap = {
  DashboardIcon,
  ReceiptIcon,
  MedicineIcon,
  InventoryIcon,
  DescriptionIcon,
  PeopleIcon,
  WarningIcon,
  BusinessIcon,
  HistoryIcon,
  ListAltIcon,
};

// Frontend menu translations mapping
const menuTranslations = {
  1: {
    en: { title: 'Dashboard', text: 'Dashboard' },
    am: { title: 'ዳሽቦርድ', text: 'ዳሽቦርድ' },
    om: { title: 'Daashboordii', text: 'Daashboordii' }
  },
  2: {
    en: { title: 'Billing & Orders', text: 'Create Order' },
    am: { title: 'ቢሊንግ እና ትዕዛዞች', text: 'ትዕዛዝ ፍጠር' },
    om: { title: 'Biliingaa fi Ajajamota', text: 'Ajajama Uumu' }
  },
  3: {
    en: { title: 'Billing & Orders', text: 'Order Management' },
    am: { title: 'ቢሊንግ እና ትዕዛዞች', text: 'የትዕዛዝ አስተዳደር' },
    om: { title: 'Biliingaa fi Ajajamota', text: 'Mangamantaa Ajajamaa' }
  },
  4: {
    en: { title: 'Medicines & Inventory', text: 'Medicine Management' },
    am: { title: 'መድሃኒቶች እና ክምችት', text: 'የመድሃኒት አስተዳደር' },
    om: { title: 'Qorichoo fi Qabeenya', text: 'Mangamantaa Qorichaa' }
  },
  5: {
    en: { title: 'Medicines & Inventory', text: 'Inventory Management' },
    am: { title: 'መድሃኒቶች እና ክምችት', text: 'የክምችት አስተዳደር' },
    om: { title: 'Qorichoo fi Qabeenya', text: 'Mangamantaa Qabeenyaa' }
  },
  6: {
    en: { title: 'Medicines & Inventory', text: 'Inventory Alerts' },
    am: { title: 'መድሃኒቶች እና ክምችት', text: 'የክምችት ማንቂያዎች' },
    om: { title: 'Qorichoo fi Qabeenya', text: 'Akeekkachiisa Qabeenyaa' }
  },
  7: {
    en: { title: 'Medicines & Inventory', text: 'Supplier Management' },
    am: { title: 'መድሃኒቶች እና ክምችት', text: 'የስብሰባ አስተዳደር' },
    om: { title: 'Qorichoo fi Qabeenya', text: 'Mangamantaa Ooggessaa' }
  },
  8: {
    en: { title: 'Prescriptions', text: 'Prescriptions' },
    am: { title: 'ፕሬስክሪፕሽን', text: 'ፕሬስክሪፕሽን' },
    om: { title: 'Qoricha Dhiheenyaa', text: 'Qoricha Dhiheenyaa' }
  },
  9: {
    en: { title: 'Prescriptions', text: 'Prescription Management' },
    am: { title: 'ፕሬስክሪፕሽን', text: 'የፕሬስክሪፕሽን አስተዳደር' },
    om: { title: 'Qoricha Dhiheenyaa', text: 'Mangamantaa Qorichaa Dhiheenyaa' }
  },
  10: {
    en: { title: 'Administration', text: 'User Management' },
    am: { title: 'አስተዳደር', text: 'የተጠቃሚ አስተዳደር' },
    om: { title: 'Administreeshinii', text: 'Mangamantaa Fayyadamtaa' }
  },
  11: {
    en: { title: 'Administration', text: 'Audit Logs' },
    am: { title: 'አስተዳደር', text: 'የኦዲት ምዝግቦች' },
    om: { title: 'Administreeshinii', text: 'Logii Auditaa' }
  }
};

export default function Layout() {
  const muiTheme = useMuiTheme();
  const { mode, toggleTheme } = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { i18n, t } = useTranslation();

  const [collapsed, setCollapsed] = useState(false);
  const [menuSections, setMenuSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [menuData, setMenuData] = useState([]); // Store raw menu data

  const toggleCollapse = () => setCollapsed(!collapsed);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLanguageMenuOpen = (event) => setLanguageAnchorEl(event.currentTarget);
  const handleLanguageMenuClose = () => setLanguageAnchorEl(null);

  const isActivePath = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // Function to get translated menu text based on current language - UPDATED
  const getTranslatedMenuText = (menu) => {
    const currentLanguage = i18n.language;
    
    // Check if we have translations for this menu
    if (menuTranslations[menu.id] && menuTranslations[menu.id][currentLanguage]) {
      const translation = menuTranslations[menu.id][currentLanguage];
      console.log('Using frontend translation for menu:', {
        menuId: menu.id,
        language: currentLanguage,
        original: { title: menu.title, text: menu.text },
        translated: translation
      });
      return translation;
    }
    
    // Fallback to original English
    console.log('No translation found for menu, using fallback:', {
      menuId: menu.id,
      language: currentLanguage,
      usingFallback: { title: menu.title, text: menu.text }
    });
    
    return {
      title: menu.title || 'Untitled',
      text: menu.text || 'No Text'
    };
  };

  // Fetch menus - store raw data
  useEffect(() => {
    const loadMenus = async () => {
      if (!user) return;

      setLoading(true);
      try {
        console.log('Loading menus for language:', i18n.language);
        
        // Step 1: Get user roles
        const rolesRes = await getUserRoles(user.id);
        const userRoles = rolesRes.data;
        console.log('User roles:', userRoles);

        // If no roles → empty menu
        if (!userRoles?.length) {
          setMenuData([]);
          setMenuSections([]);
          setLoading(false);
          return;
        }

        // Check if user is superadmin
        const isSuperAdmin = userRoles.some(r => r.name.toLowerCase() === 'superadmin');
        console.log('Is superadmin:', isSuperAdmin);

        let menus = [];

        if (isSuperAdmin) {
          // Superadmin gets all menus
          const allMenusRes = await fetchAllMenus();
          menus = allMenusRes.data;
          console.log('Superadmin menus:', menus);
        } else {
          // Regular user: collect menus from all roles
          const menuPromises = userRoles.map(role => getMenusByRole(role.id));
          const results = await Promise.all(menuPromises);
          console.log('Menu results:', results);

          // Flatten and deduplicate by id
          const merged = results.flatMap(res => res.data || []);
          menus = Array.from(new Map(merged.map(m => [m.id, m])).values());
          console.log('Regular user menus:', menus);
        }

        // Store raw menu data for re-translation
        setMenuData(menus);
        
        // Apply translations to all menus
        applyTranslations(menus);
        
      } catch (err) {
        console.error("Failed to load menus:", err);
        setMenuData([]);
        setMenuSections([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, [user]); // Only depend on user, not language

  // Apply translations whenever language changes
  useEffect(() => {
    if (menuData.length > 0) {
      console.log('Re-applying translations for language:', i18n.language);
      applyTranslations(menuData);
    }
  }, [i18n.language, menuData]);

  // Function to apply translations and group menus
  const applyTranslations = (menus) => {
    const translatedMenus = menus.map(menu => {
      const translated = getTranslatedMenuText(menu);
      const translatedMenu = {
        ...menu,
        displayTitle: translated.title, // Use separate field for display
        displayText: translated.text    // Use separate field for display
      };
      console.log('Translated menu:', {
        originalTitle: menu.title,
        originalText: menu.text,
        translatedTitle: translatedMenu.displayTitle,
        translatedText: translatedMenu.displayText
      });
      return translatedMenu;
    });

    // Group by displayTitle (FIXED: was using title which caused issues)
    const grouped = translatedMenus.reduce((acc, menu) => {
      let section = acc.find(s => s.title === menu.displayTitle);
      if (!section) {
        section = { 
          title: menu.displayTitle, 
          items: [] 
        };
        acc.push(section);
      }
      section.items.push(menu);
      return acc;
    }, []);

    console.log('Grouped menus:', grouped);

    // Sort sections and items alphabetically
    grouped.forEach(s => s.items.sort((a, b) => a.displayText.localeCompare(b.displayText)));
    grouped.sort((a, b) => a.title.localeCompare(b.title));

    setMenuSections(grouped);
  };

  const changeLanguage = (code) => {
    console.log('Changing language to:', code);
    i18n.changeLanguage(code);
    handleLanguageMenuClose();
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
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: `linear-gradient(180deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.primary.dark} 100%)`,
              color: "white",
            },
          }}
        >
          <Toolbar sx={{ justifyContent: "center" }}>
            <MedicalServices sx={{ mr: 2 }} />
            <Typography variant="h6" noWrap sx={{ fontWeight: "bold" }}>
              PharmaCare
            </Typography>
          </Toolbar>
          <Divider sx={{ borderColor: alpha("#fff", 0.2) }} />
          <List>
            <ListItem>
              <ListItemText
                primary="Loading..."
                sx={{ color: "white", textAlign: "center" }}
              />
            </ListItem>
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            minHeight: "100vh",
            p: 3,
          }}
        >
          <Toolbar />
          <Outlet />
          <AIChatBot />
        </Box>
      </Box>
    );
  }

  const username = user.username || user.email?.split("@")[0] || "User";
  const roleNames = user.role ? [user.role] : [];

  // Supported languages WITH FLAGS
  const languages = [
    { code: "en", name: t("common.english"), flag: "🇬🇧" },
    { code: "am", name: t("common.amharic"), flag: "🇪🇹" },
    { code: "om", name: t("common.oromo"), flag: "🇪🇹" },
  ];
  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  // Debug component
  const DebugInfo = () => (
    <Box sx={{ position: 'fixed', bottom: 10, right: 10, bgcolor: 'black', color: 'white', p: 1, fontSize: '12px', zIndex: 9999 }}>
      Language: {i18n.language} | Menus: {menuSections.length} | Sections: {JSON.stringify(menuSections.map(s => s.title))}
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? collapsedDrawerWidth : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedDrawerWidth : drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "background.paper",
            color: "text.primary",
            borderRight: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}`,
          },
        }}
      >
        {/* Header */}
        <Toolbar
          sx={{
            justifyContent: collapsed ? "center" : "space-between",
            minHeight: "80px !important",
            borderBottom: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}`,
          }}
        >
          {!collapsed && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <MedicalServices sx={{ mr: 2, color: "primary.main", fontSize: 32 }} />
              <Box>
                <Typography variant="h6" noWrap fontWeight="bold">
                  PharmaCare
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {t("layout.managementSystem")}
                </Typography>
              </Box>
            </Box>
          )}
          {collapsed && (
            <MedicalServices sx={{ color: "primary.main", fontSize: 32 }} />
          )}
          <Tooltip title={collapsed ? t("layout.expandSidebar") : t("layout.collapseSidebar")}>
            <IconButton
              onClick={toggleCollapse}
              size="small"
              sx={{
                border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`,
                bgcolor: alpha(muiTheme.palette.primary.main, 0.05),
              }}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        </Toolbar>

        <Divider />

        {/* Loading State */}
        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress size={24} />
            <Typography variant="body2" mt={1}>
              {t("layout.loadingMenu") || "Loading menu..."}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflow: "auto", flexGrow: 1 }}>
            {menuSections.length === 0 ? (
              <Box sx={{ p: 3 }}>
                <Typography color="text.secondary" textAlign="center">
                  {t("layout.noAccess") || "No access to any pages."}
                </Typography>
              </Box>
            ) : (
              menuSections.map((section) => (
                <Box key={section.title} component="nav">
                  {!collapsed && (
                    <ListItem sx={{ py: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: "bold",
                          color: "text.secondary",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontSize: "0.7rem",
                        }}
                      >
                        {section.title}
                      </Typography>
                    </ListItem>
                  )}
                  <List dense>
                    {section.items.map((item) => (
                      <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => navigate(item.path)}
                          sx={{
                            mx: 1,
                            borderRadius: 2,
                            py: 1.2,
                            backgroundColor: isActivePath(item.path)
                              ? alpha(muiTheme.palette.primary.main, 0.1)
                              : "transparent",
                            border: isActivePath(item.path)
                              ? `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`
                              : "1px solid transparent",
                            "&:hover": {
                              backgroundColor: alpha(muiTheme.palette.primary.main, 0.05),
                              border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.1)}`,
                            },
                            justifyContent: collapsed ? "center" : "flex-start",
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: collapsed ? "auto" : 40,
                              color: isActivePath(item.path)
                                ? "primary.main"
                                : "text.secondary",
                            }}
                          >
                            {React.createElement(iconMap[item.icon] || DashboardIcon)}
                          </ListItemIcon>
                          {!collapsed && (
                            <>
                              <ListItemText
                                primary={item.displayText}
                                primaryTypographyProps={{
                                  fontSize: "0.9rem",
                                  fontWeight: isActivePath(item.path) ? "bold" : "normal",
                                  color: isActivePath(item.path) ? "primary.main" : "text.primary",
                                }}
                              />
                              {item.badge > 0 && (
                                <Chip
                                  label={item.badge}
                                  size="small"
                                  color="error"
                                  sx={{ height: 20, minWidth: 20, fontSize: "0.7rem" }}
                                />
                              )}
                            </>
                          )}
                        </ListItemButton>
                        {collapsed && item.badge > 0 && (
                          <Chip
                            label={item.badge}
                            size="small"
                            color="error"
                            sx={{
                              position: "absolute",
                              right: 8,
                              top: 10,
                              height: 16,
                              fontSize: "0.6rem",
                            }}
                          />
                        )}
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 1, opacity: 0.5 }} />
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: `1px solid ${alpha(muiTheme.palette.divider, 0.1)}` }}>
          
          {/* Theme Toggle Button */}
          <ListItemButton 
            onClick={toggleTheme}
            sx={{ 
              borderRadius: 2, 
              mb: 1,
              justifyContent: collapsed ? "center" : "flex-start" 
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 40 }}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            {!collapsed && (
              <ListItemText primary={t("layout.themeMode")} />
            )}
          </ListItemButton>

          {/* Language Switch Button WITH FLAG */}
          <ListItemButton 
            onClick={handleLanguageMenuOpen}
            sx={{ 
              borderRadius: 2, 
              mb: 1,
              justifyContent: collapsed ? "center" : "flex-start" 
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? "auto" : 40 }}>
              <TranslateIcon />
            </ListItemIcon>
            {!collapsed && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span role="img" aria-label={currentLang.name} style={{ fontSize: '1.2em' }}>
                  {currentLang.flag}
                </span>
                <Typography variant="body2">{currentLang.name}</Typography>
              </Box>
            )}
          </ListItemButton>

          {/* User Profile */}
          <ListItemButton onClick={handleMenuOpen} sx={{ borderRadius: 2 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                fontSize: "14px",
                mr: 1,
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
            {!collapsed && (
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" fontWeight="medium" noWrap>
                  {username}
                </Typography>
                <Typography variant="caption" color="textSecondary" noWrap>
                  {roleNames.join(", ")}
                </Typography>
              </Box>
            )}
          </ListItemButton>
        </Box>
      </Drawer>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ elevation: 8 }}
      >
        <MenuItem onClick={() => navigate("/change-password")}>
          <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{t("layout.changePassword")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>
            {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{t("layout.themeMode")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={logout}>
          <ListItemIcon><PeopleIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary={t("layout.logout")} />
        </MenuItem>
      </Menu>

      {/* Language Menu WITH FLAGS */}
      <Menu
        anchorEl={languageAnchorEl}
        open={Boolean(languageAnchorEl)}
        onClose={handleLanguageMenuClose}
        PaperProps={{ elevation: 8 }}
      >
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => changeLanguage(lang.code)}
            selected={i18n.language === lang.code}
          >
            <ListItemIcon>
              <span role="img" aria-label={lang.name} style={{ fontSize: '1.2em' }}>
                {lang.flag}
              </span>
            </ListItemIcon>
            <ListItemText>{lang.name}</ListItemText>
            {i18n.language === lang.code && (
              <ListItemIcon>✓</ListItemIcon>
            )}
          </MenuItem>
        ))}
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          color: "text.primary",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Toolbar />
        <Outlet />
        <AIChatBot />
        <DebugInfo />
      </Box>
    </Box>
  );
}