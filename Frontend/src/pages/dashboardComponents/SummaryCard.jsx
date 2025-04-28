// SummaryCard.js
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const SummaryCard = ({ title, count }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 120,
      }}
    >
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        {title}
      </Typography>
      <Typography component="p" variant="h4">
        {count}
      </Typography>
    </Paper>
  </Grid>
);
export default SummaryCard;