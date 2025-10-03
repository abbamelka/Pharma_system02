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
  Stack,
  Pagination,
  TextField,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  Button,
  Grid,
  Autocomplete,
} from "@mui/material";
import { getAuditLogs } from "../services/api";

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
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // 🔍 Filters
  const [filters, setFilters] = useState({
    action: "",
    performedBy: "",
    startDate: "",
    endDate: "",
  });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      // Fetch full logs from backend
      const response = await getAuditLogs(page, 50); // Larger page size for filtering
      let filteredLogs = response.data.logs;

      // Apply frontend filters
      filteredLogs = filteredLogs.filter((log) => {
        // Skip unwanted action
        if (log.action === "USER_ACCESS_USER_LIST") return false;

        // Filter by action
        if (filters.action && log.action !== filters.action) return false;

        // Filter by performer username
        if (
          filters.performedBy &&
          !log.performedByUsername.toLowerCase().includes(filters.performedBy.toLowerCase())
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

      // Paginate filtered results
      const pageSize = 10;
      const totalItems = filteredLogs.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

      setLogs(paginatedLogs);
      setPagination({
        currentPage: page,
        totalPages: totalPages || 1,
        totalItems,
      });
    } catch (err) {
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchLogs(1);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ action: "", performedBy: "", startDate: "", endDate: "" });
    fetchLogs(1);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  useEffect(() => {
    fetchLogs(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (e, value) => {
    fetchLogs(value);
    setPagination((prev) => ({ ...prev, currentPage: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Audit Logs
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: "background.default" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={filters.action}
                label="Action"
                onChange={(e) => handleFilterChange("action", e.target.value)}
                size="small"
              >
                <MenuItem value="">
                  <em>All Actions</em>
                </MenuItem>
                {ACTION_OPTIONS.map((action) => (
                  <MenuItem key={action} value={action}>
                    {action.replace(/_/g, " ")}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Performed By"
              value={filters.performedBy}
              onChange={(e) => handleFilterChange("performedBy", e.target.value)}
              size="small"
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilters}
              size="small"
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleResetFilters}
              size="small"
              sx={{ ml: 1 }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Action</strong></TableCell>
              <TableCell><strong>Entity</strong></TableCell>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Performed By</strong></TableCell>
              <TableCell><strong>Details</strong></TableCell>
              <TableCell><strong>Timestamp</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: "text.secondary" }}>
                  No audit logs found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Chip
                      label={log.action.replace(/_/g, " ")}
                      color={
                        ["PASSWORD_RESET", "DELETE", "SUSPEND"].some(x =>
                          log.action.includes(x)
                        )
                          ? "error"
                          : log.action.includes("CREATE") || log.action.includes("FULFILL")
                          ? "success"
                          : "info"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell>{log.entityId || "N/A"}</TableCell>
                  <TableCell>{log.performedByUsername}</TableCell>
                  <TableCell>
                    <pre style={{ margin: 0, fontSize: "0.8em", color: "#666" }}>
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </TableCell>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack spacing={2} mt={3} alignItems="center">
        <Pagination
          count={pagination.totalPages}
          page={pagination.currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
        <Typography variant="body2" color="textSecondary">
          Page {pagination.currentPage} of {pagination.totalPages} • Total: {pagination.totalItems} logs
        </Typography>
      </Stack>
    </Container>
  );
}