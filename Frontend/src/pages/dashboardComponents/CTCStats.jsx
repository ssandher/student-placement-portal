// CTCStats.js
import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

const CTCStats = ({ stats }) => (
  <Grid item xs={12} md={6}>
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        CTC Stats
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" gutterBottom>
          Max CTC: ₹{(stats.max / 100000).toFixed(2)} LPA
        </Typography>
        <Typography variant="body1" gutterBottom>
          Avg CTC: ₹{(stats.avg / 100000).toFixed(2)} LPA
        </Typography>
        <Typography variant="body1" gutterBottom>
          Min CTC: ₹{(stats.min / 100000).toFixed(2)} LPA
        </Typography>
      </Box>
    </Paper>
  </Grid>
);
export default CTCStats;

