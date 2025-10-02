// src/pages/AuditLogPage.js
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
  Tooltip
} from "@mui/material";
import { getAuditLogs } from "../services/api";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await getAuditLogs();
        setLogs(response.data.logs || []);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
        setError("Could not load audit logs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

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
      <Typography variant="body1" color="textSecondary" gutterBottom>
        Track all critical actions performed in the system.
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
                <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary' }}>
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
                        ["USER_PASSWORD_RESET", "USER_DELETE", "USER_STATUS_CHANGE_SUSPEND"]
                          .includes(log.action)
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
                  <TableCell>
                    <Tooltip title={log.performer?.role || "Unknown role"}>
                      <span>{log.performedByUsername}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <pre style={{ margin: 0, fontSize: '0.8em', color: '#666', wordBreak: 'break-word' }}>
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
    </Container>
  );
}