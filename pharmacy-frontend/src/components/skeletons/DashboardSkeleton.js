// src/components/skeletons/DashboardSkeleton.js
import React from "react";
import {
  Grid,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  Divider,
} from "@mui/material";
import { Skeleton } from '@mui/material';

export default function DashboardSkeleton() {
  return (
    <Box>
      {/* Sales Metrics Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={4} key={item}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Skeleton variant="text" width={150} height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={100} height={40} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={6} key={item}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Alerts Skeleton */}
      <Grid container spacing={3}>
        {[1, 2].map((item) => (
          <Grid item xs={12} md={6} key={item}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton variant="circular" width={32} height={32} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                {[1, 2, 3].map((i) => (
                  <ListItem key={i}>
                    <Skeleton variant="text" width="100%" height={24} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}