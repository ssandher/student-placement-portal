// DepartmentWisePlacements.js
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

const DepartmentWisePlacements = ({ data }) => (
  <Grid item xs={12} md={6}>
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 500 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Department Wise Placements
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  </Grid>
);
export default DepartmentWisePlacements;