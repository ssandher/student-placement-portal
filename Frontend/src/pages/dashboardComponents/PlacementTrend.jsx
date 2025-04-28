// PlacementTrend.js
import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PlacementTrend = ({ data }) => {
  // 1. Calculate the maximum value from the data
  // Ensure data exists and has items before processing
  const maxValue = React.useMemo(() => {
    if (!data || data.length === 0) {
      return 0; // Default max value if no data
    }
    // Find the highest value among all 'Placed' and 'Total' entries
    return data.reduce((max, item) => {
      // Ensure item properties exist and are numbers
      const placedValue = typeof item.Placed === 'number' ? item.Placed : 0;
      const totalValue = typeof item.Total === 'number' ? item.Total : 0;
      return Math.max(max, placedValue, totalValue);
    }, 0); // Start with 0 as the initial maximum
  }, [data]); // Recalculate only when data changes

  // 2. Generate an array of ticks from 0 to maxValue
  // Ensure maxValue is a non-negative integer before generating ticks
  const yTicks = React.useMemo(() => {
    const safeMaxValue = Math.max(0, Math.ceil(maxValue)); // Ensure it's at least 0 and an integer
    // Create an array [0, 1, 2, ..., safeMaxValue]
    return Array.from({ length: safeMaxValue + 1 }, (_, i) => i);
    // Example: if safeMaxValue is 4, length is 5, array is [0, 1, 2, 3, 4]
  }, [maxValue]); // Recalculate only when maxValue changes

  // Handle case where there's no data to display
  if (!data || data.length === 0) {
    return (
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 500, justifyContent: 'center', alignItems: 'center' }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Placement Trend
          </Typography>
          <Typography variant="body1" color="textSecondary">
            No data available for placement trend.
          </Typography>
        </Paper>
      </Grid>
    );
  }

  // **Important Consideration:** If maxValue is very large (e.g., > 20-30),
  // displaying every single tick might make the Y-axis unreadable due to overlap.
  // In such cases, you might remove the `ticks` prop and let Recharts decide,
  // or implement more complex logic to show ticks at intervals (e.g., every 5 or 10).

  return (
    <Grid item xs={12} md={6}>
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 500 }}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Placement Trend
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 15,    // Added some top margin
              right: 20, // Added right margin for potential labels
              left: 0,   // Adjust left margin if needed for Y-axis labels
              bottom: 30 // Increased bottom margin further for rotated X labels
            }}
          >
            <XAxis
              dataKey="name"
              height={100} // Adjust height based on label length and rotation
              tick={{
                angle: -45,
                textAnchor: 'end',
                fontSize: 14, // Adjust font size if needed
                dy: 5 // Adjust vertical displacement
              }}
              interval={0}
              axisLine={true}
              tickLine={true}
            />
            <YAxis
              // Ensure domain includes the calculated max value
              domain={[0, 'auto']} // 'auto' works well with explicit ticks
              allowDecimals={false}
              // 3. Pass the generated ticks array to the YAxis
              ticks={yTicks}
              // Optionally set interval={0} for YAxis too, if needed, though `ticks` usually suffices
              // interval={0}
            />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '130px' }} /> {/* Add padding above legend */}
            <Bar dataKey="Placed" fill="#8884d8" />
            <Bar dataKey="Total" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>
  );
};

export default PlacementTrend;

/* <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data}
          margin={{
            bottom: 70  // Added margin to accommodate rotated labels
          }}
        >
          <XAxis 
            dataKey="name" 
            height={60}
            tick={{
              angle: -45,  // Rotate labels
              textAnchor: 'end',
              dy: 10
            }}
            interval={0}  // Show all labels
            axisLine={true}
            tickLine={true}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Placed" fill="#8884d8" />
          <Bar dataKey="Total" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
      
*/

// original code
// // PlacementTrend.js
// import React from 'react';
// import { Grid, Paper, Typography } from '@mui/material';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const PlacementTrend = ({ data }) => (
//   <Grid item xs={12} md={6}>
//     <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
//       <Typography component="h2" variant="h6" color="primary" gutterBottom>
//         Placement Trend
//       </Typography>
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart data={data}>
//           <XAxis 
//             dataKey="name" 
//             height={50}
//             tick={{dy: 10}}
//             axisLine={true}
//             tickLine={true}
//           />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="Placed" fill="#8884d8" />
//           <Bar dataKey="Total" fill="#82ca9d" />
//         </BarChart>
//       </ResponsiveContainer>
//     </Paper>
//   </Grid>
// );

// export default PlacementTrend;

// 2nd

// const PlacementTrend = ({ data }) => (
//   <Grid item xs={12} md={6}>
//     <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
//       <Typography component="h2" variant="h6" color="primary" gutterBottom>
//         Placement Trend
//       </Typography>
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart 
//           data={data}
//           margin={{
//             bottom: 70  // Added margin to accommodate rotated labels
//           }}
//         >
//           <XAxis 
//             dataKey="name" 
//             height={60}
//             tick={{
//               angle: -45,  // Rotate labels
//               textAnchor: 'end',
//               dy: 10
//             }}
//             interval={0}  // Show all labels
//             axisLine={true}
//             tickLine={true}
//           />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="Placed" fill="#8884d8" />
//           <Bar dataKey="Total" fill="#82ca9d" />
//         </BarChart>
//       </ResponsiveContainer>
//     </Paper>
//   </Grid>
// );