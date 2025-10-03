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
  Pagination
} from "@mui/material";
import { getAuditLogs } from "../services/api";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getAuditLogs(page, 10);

      // ✅ filter out unwanted logs
      const filteredLogs = response.data.logs.filter(
        log => log.action !== "USER_ACCESS_USER_LIST"
      );

      // ✅ adjust pagination counts to match filtered logs
      setLogs(filteredLogs);
      setPagination({
        ...response.data.pagination,
        totalItems: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / 10) || 1,
        currentPage: page
      });
    } catch (err) {
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (e, value) => {
    fetchLogs(value);
    setPagination(prev => ({ ...prev, currentPage: value }));
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
