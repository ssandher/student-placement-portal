// TopCompaniesByOffers.js
import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

const TopCompaniesByOffers = ({ companies }) => (
  <Grid item xs={12}>
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Top Companies - by No. of Students Placed
      </Typography>
      <Box sx={{ flexGrow: 1 }}>
        {companies.map((company, index) => (
          <Typography key={index} variant="body1" gutterBottom>
            {company.name}: {company.offers} offers
          </Typography>
        ))}
      </Box>
    </Paper>
  </Grid>
);
export default TopCompaniesByOffers;