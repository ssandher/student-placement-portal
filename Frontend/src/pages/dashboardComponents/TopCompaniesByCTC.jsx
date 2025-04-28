// TopCompaniesByCTC.js
import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

const TopCompaniesByCTC = ({ companies }) => (
  <Grid item xs={12} md={6}>
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Top Companies - by CTC
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        {companies.map((company, index) => (
          <Typography key={index} variant="body1" gutterBottom>
            {company.name}: ₹{(company.ctc / 100000).toFixed(2)} LPA
          </Typography>
        ))}
      </Box>
    </Paper>
  </Grid>
);
export default TopCompaniesByCTC;