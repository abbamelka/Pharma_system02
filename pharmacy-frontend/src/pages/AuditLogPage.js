import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  Tooltip,
  alpha,
  useTheme,
  TablePagination, // ✅ Added import
} from "@mui/material";
import {
  Search,
  Refresh,
  History,
  Security,
  CheckCircle,
  Cancel,
  Warning,
  CalendarToday,
  Person,
} from "@mui/icons-material";
import { getAuditLogs } from "../services/api";
import { toast } from "react-toastify";

// ✅ Add translation hook
import { useTranslation } from 'react-i18next';

// All possible actions for filter dropdown
const ACTION_OPTIONS = [
  "USER_LOGIN",
  "USER_LOGOUT",
  "USER_CREATE",
  "USER_UPDATE",
  "USER_DELETE",
  "USER_PASSWORD_RESET",
  "USER_CHANGE_OWN_PASSWORD",
  "USER_STATUS_CHANGE",
  "MEDICINE_CREATE",
  "MEDICINE_UPDATE",
  "ORDER_CREATE",
  "PRESCRIPTION_FULFILL",
  "INVENTORY_ADD"
];

export default function AuditLogPage() {
  const theme = useTheme();
  
  // ✅ Initialize translation
  const { t } = useTranslation();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 🔍 Filters
  const [filters, setFilters] = useState({
    action: "",
    performedBy: "",
    startDate: "",
    endDate: "",
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Fetch logs from backend
      const response = await getAuditLogs();
      let filteredLogs = response.data.logs || [];

      // Apply frontend filters
      filteredLogs = filteredLogs.filter((log) => {
        // Skip unwanted action
        if (log.action === "USER_ACCESS_USER_LIST") return false;

        // Filter by action
        if (filters.action && log.action !== filters.action) return false;

        // Filter by performer username
        if (
          filters.performedBy &&
          !log.performedByUsername?.toLowerCase().includes(filters.performedBy.toLowerCase())
        )
          return false;

        // Filter by start date
        if (filters.startDate) {
          const logDate = new Date(log.createdAt);
          const startDate = new Date(filters.startDate);
          if (logDate < startDate) return false;
        }

        // Filter by end date
        if (filters.endDate) {
          const logDate = new Date(log.createdAt);
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (logDate > endDate) return false;
        }

        return true;
      });

      // Sort by createdAt descending
      filteredLogs.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setLogs(filteredLogs);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError(t('audit.failedToLoadLogs'));
      toast.error(`❌ ${t('audit.failedToLoadLogs')}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reset pagination when filters change
  useEffect(() => {
    setPage(0);
  }, [logs]);

  // ✅ Change page handler
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // ✅ Change rows per page handler
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ✅ Paginated list
  const paginatedLogs = logs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs();
  };

  const handleResetFilters = () => {
    setFilters({ action: "", performedBy: "", startDate: "", endDate: "" });
    fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    if (["PASSWORD_RESET", "DELETE", "SUSPEND"].some(x => action.includes(x))) {
      return 'error';
    }
    if (action.includes("CREATE") || action.includes("FULFILL") || action.includes("LOGIN")) {
      return 'success';
    }
    if (action.includes("UPDATE") || action.includes("CHANGE")) {
      return 'warning';
    }
    return 'info';
  };

  const getActionIcon = (action) => {
    if (action.includes("DELETE") || action.includes("SUSPEND")) {
      return <Cancel />;
    }
    if (action.includes("CREATE") || action.includes("FULFILL")) {
      return <CheckCircle />;
    }
    if (action.includes("LOGIN") || action.includes("LOGOUT")) {
      return <Security />;
    }
    return <History />;
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
          {t('audit.loadingLogs')}
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
            <Button color="inherit" onClick={fetchLogs}>
              {t('common.retry')}
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
          background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
          borderRadius: 4,
          py: 4,
          px: 3,
          color: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}
      >
        <Security sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {t('audit.auditLogs')}
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          {t('audit.trackSystemActivities')}
        </Typography>
      </Box>

      {/* Statistics Card */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
                  <History />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {logs.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {t('audit.totalLogs')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={9}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchLogs}
                disabled={loading}
                sx={{ float: 'right' }}
              >
                {t('common.refresh')}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Search />
            {t('audit.filterLogs')}
          </Typography>
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('audit.action')}</InputLabel>
                <Select
                  value={filters.action}
                  label={t('audit.action')}
                  onChange={(e) => handleFilterChange("action", e.target.value)}
                >
                  <MenuItem value="">{t('audit.allActions')}</MenuItem>
                  {ACTION_OPTIONS.map((action) => (
                    <MenuItem key={action} value={action}>
                      {action.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label={t('audit.performedBy')}
                value={filters.performedBy}
                onChange={(e) => handleFilterChange("performedBy", e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label={t('audit.startDate')}
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label={t('audit.endDate')}
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarToday color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleApplyFilters}
                  sx={{ flex: 1 }}
                >
                  {t('audit.applyFilters')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                >
                  {t('audit.resetFilters')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          {t('audit.showingLogs', { count: logs.length })}
        </Typography>
        {(filters.action || filters.performedBy || filters.startDate || filters.endDate) && (
          <Button
            color="secondary"
            onClick={handleResetFilters}
          >
            {t('audit.clearAllFilters')}
          </Button>
        )}
      </Box>

      {/* Audit Logs Table */}
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
              <TableCell><strong>{t('audit.action')}</strong></TableCell>
              <TableCell><strong>{t('audit.entity')}</strong></TableCell>
              <TableCell><strong>{t('audit.entityId')}</strong></TableCell>
              <TableCell><strong>{t('audit.performedBy')}</strong></TableCell>
              <TableCell><strong>{t('audit.details')}</strong></TableCell>
              <TableCell><strong>{t('audit.timestamp')}</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <History sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    {t('audit.noLogsFound')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {filters.action || filters.performedBy || filters.startDate || filters.endDate
                      ? t('audit.adjustFilters')
                      : t('audit.noActivitiesRecorded')
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log, idx) => (
                <TableRow 
                  key={idx}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.primary.main, 0.02) 
                    } 
                  }}
                >
                  <TableCell>
                    <Chip
                      icon={getActionIcon(log.action)}
                      label={log.action.replace(/_/g, " ")}
                      color={getActionColor(log.action)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {log.entity || t('common.na')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {log.entityId || t('common.na')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {log.performedByUsername || t('audit.unknownUser')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip 
                      title={log.details ? JSON.stringify(log.details, null, 2) : t('audit.noDetails')}
                      arrow
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          color: 'text.secondary'
                        }}
                      >
                        {log.details ? JSON.stringify(log.details) : t('audit.noDetails')}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {new Date(log.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✅ Pagination */}
      <TablePagination
        component="div"
        count={logs.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage={t('common.rowsPerPage')}
        labelDisplayedRows={({ from, to, count }) =>
          t('common.displayedRows', { from, to, count })
        }
      />
    </Container>
  );
}