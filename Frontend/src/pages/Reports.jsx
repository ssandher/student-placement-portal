// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { DataTable } from "primereact/datatable";
// import { Column } from "primereact/column";
// import { Chart } from "primereact/chart";
// import { Card } from "primereact/card";
// import { Container, Grid } from "@mui/material";

// const PlacementReport = () => {
//     const [allPlacements, setAllPlacements] = useState([]);
//     const [coreNonCoreData, setCoreNonCoreData] = useState([]);
//     const [yearWiseData, setYearWiseData] = useState([]);
//     const [departmentWiseData, setDepartmentWiseData] = useState([]);

//     useEffect(() => {
//         fetchAllPlacements();
//         fetchCoreNonCoreData();
//         fetchYearWiseData();
//         fetchDepartmentWiseData();
//     }, []);

//     const fetchAllPlacements = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.get(
//                 "http://localhost:3000/api/placement/getAllPlacementDetails",
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             setAllPlacements(response.data);
//         } catch (error) {
//             console.error("Failed to fetch all placements", error);
//         }
//     };

//     const fetchCoreNonCoreData = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.get(
//                 "http://localhost:3000/api/placement/getCoreNonCorePlacements",
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             setCoreNonCoreData(response.data);
//         } catch (error) {
//             console.error("Failed to fetch core/non-core data", error);
//         }
//     };

//     const fetchYearWiseData = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.get(
//                 "http://localhost:3000/api/placement/getStudentsPlacedYearOfStudyWise",
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             setYearWiseData(response.data);
//         } catch (error) {
//             console.error("Failed to fetch year-wise placement data", error);
//         }
//     };

//     const fetchDepartmentWiseData = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.get(
//                 "http://localhost:3000/api/placement/getPlacedDepartmentWise",
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             setDepartmentWiseData(response.data);
//         } catch (error) {
//             console.error("Failed to fetch department-wise placement data", error);
//         }
//     };

//     const coreNonCoreOptions = {
//         labels: coreNonCoreData.map((data) => data.core_non_core),
//         datasets: [
//             {
//                 data: coreNonCoreData.map((data) => data.count),
//                 backgroundColor: ["#42A5F5", "#66BB6A"],
//                 hoverBackgroundColor: ["#64B5F6", "#81C784"],
//             },
//         ],
//     };

//     const yearWiseOptions = {
//         labels: yearWiseData.map((data) => data.year),
//         datasets: [
//             {
//                 label: "Number of Students Placed",
//                 data: yearWiseData.map((data) => data.placed_students),
//                 backgroundColor: "#ffce56",
//             },
//         ],
//     };

//     return (
//         <Container>
//             <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                     <Card title="Placement Details">
//                         <DataTable value={allPlacements}>
//                             <Column field="student_name" header="Student Name" />
//                             <Column field="company_name" header="Company Name" />
//                             <Column field="position" header="Position" />
//                             <Column field="salary" header="Salary" />
//                             <Column field="placement_date" header="Placement Date" />
//                             <Column field="location" header="Location" />
//                             <Column field="core_non_core" header="Core/Non-Core" />
//                         </DataTable>
//                     </Card>
//                 </Grid>

//                 {/* Ensuring Equal Card Heights for Charts */}
//                 <Grid item xs={12} sm={6}>
//                     <Card
//                         style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             height: "100%",
//                         }}
//                         title="Core vs Non-Core Placements"
//                     >
//                         <div style={{ height: "300px" }}>
//                             <Chart type="pie" data={coreNonCoreOptions} />
//                         </div>
//                     </Card>
//                 </Grid>

//                 <Grid item xs={12} sm={6}>
//                     <Card
//                         style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             height: "100%",
//                         }}
//                         title="Year of Study Placement Stats"
//                     >
//                         <div style={{ height: "300px" }}>
//                             <Chart type="bar" data={yearWiseOptions} options={{ maintainAspectRatio: false }} />
//                         </div>
//                     </Card>
//                 </Grid>

//                 <Grid item xs={12}>
//                     <Card title="Department Wise Placement Stats">
//                         <DataTable value={departmentWiseData}>
//                             <Column field="department" header="Department" />
//                             <Column field="placed_students" header="Placed Students" />
//                         </DataTable>
//                     </Card>
//                 </Grid>
//             </Grid>
//         </Container>
//     );
// };

// export default PlacementReport;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Container, Grid } from "@mui/material";
import "./PlacementReport.css";

const emptyPieData = { labels: [], datasets: [{ data: [], backgroundColor: [], hoverBackgroundColor: [] }] };
const emptyBarData = { labels: [], datasets: [{ label: '', data: [], backgroundColor: '' }] };

const PlacementReport = () => {
    const [allPlacements, setAllPlacements] = useState([]);
    const [coreNonCoreData, setCoreNonCoreData] = useState([]);
    const [yearWiseData, setYearWiseData] = useState([]);
    const [departmentWiseData, setDepartmentWiseData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getToken = () => localStorage.getItem("token");

    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchData = async () => {
            try {
                const token = getToken();
                const headers = { Authorization: `Bearer ${token}` };

                const [
                    placementsRes,
                    coreRes,
                    yearRes,
                    deptRes
                ] = await Promise.all([
                    axios.get("http://localhost:3000/api/placement/getAllPlacementDetails", { headers }),
                    axios.get("http://localhost:3000/api/placement/getCoreNonCorePlacements", { headers }),
                    axios.get("http://localhost:3000/api/placement/getStudentsPlacedYearOfStudyWise", { headers }),
                    axios.get("http://localhost:3000/api/placement/getPlacedDepartmentWise", { headers })
                ]);

                setAllPlacements(Array.isArray(placementsRes.data) ? placementsRes.data : []);
                setCoreNonCoreData(Array.isArray(coreRes.data) ? coreRes.data : []);
                setYearWiseData(Array.isArray(yearRes.data) ? yearRes.data : []);
                setDepartmentWiseData(Array.isArray(deptRes.data) ? deptRes.data : []);

            } catch (err) {
                console.error("Failed to fetch placement report data:", err);
                const errorMsg = err.response?.data?.message || err.message || "Failed to load report data.";
                setError(errorMsg);
                setAllPlacements([]);
                setCoreNonCoreData([]);
                setYearWiseData([]);
                setDepartmentWiseData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getCoreNonCoreOptions = () => {
        if (!coreNonCoreData || !Array.isArray(coreNonCoreData) || coreNonCoreData.length === 0) {
            return emptyPieData;
        }
        try {
            return {
                labels: coreNonCoreData.map(data => data.core_non_core || 'Unknown'),
                datasets: [{
                    data: coreNonCoreData.map(data => data.count || 0),
                    backgroundColor: ["#42A5F5", "#66BB6A", "#FFA726"],
                    hoverBackgroundColor: ["#64B5F6", "#81C784", "#FFB74D"],
                }],
            };
        } catch (e) { console.error("Chart Error (Core):", e); return emptyPieData; }
    };
    const coreChartData = getCoreNonCoreOptions();

    const getYearWiseOptions = () => {
        if (!yearWiseData || !Array.isArray(yearWiseData) || yearWiseData.length === 0) {
            return emptyBarData;
        }
        try {
            return {
                labels: yearWiseData.map(data => data.year || 'Unknown Year'),
                datasets: [{
                    label: "Students Placed",
                    data: yearWiseData.map(data => data.placed_students || 0),
                    backgroundColor: "#FFCE56",
                    borderColor: '#E3B53B',
                    borderWidth: 1
                }],
            };
        } catch (e) { console.error("Chart Error (Year):", e); return emptyBarData; }
    };
    const yearChartData = getYearWiseOptions();

    const yearWiseChartOptions = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } },
            x: { grid: { display: false } }
        },
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <ProgressSpinner />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Message severity="error" text={`Error loading reports: ${error}`} style={{ width: '100%' }} />
            </Container>
        );
    }

    return (
        <div className="placement-report-page">
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4}}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card title=" Student Placement Details" className="shadow-2 border-round" style={{ width: '100%' }}>
                            <DataTable value={allPlacements} paginator rows={10} emptyMessage="No placement details found." responsiveLayout="scroll"
                                className="p-datatable-sm"
                                scrollable
                                scrollHeight="400px"
                                stripedRows>
                                <Column field="student_name" header="Student Name" sortable filter filterPlaceholder="Search" />
                                <Column field="company_name" header="Company Name" sortable filter filterPlaceholder="Search" />
                                <Column field="position" header="Position" sortable />
                                <Column field="salary" header="Salary (INR)" sortable body={(rowData) => rowData.salary ? parseFloat(rowData.salary).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : 'N/A'} />
                                <Column field="placement_date" header="Placement Date" sortable />
                                <Column field="location" header="Location" sortable filter filterPlaceholder="Search" />
                                <Column field="core_non_core" header="Domain" sortable filter filterPlaceholder="Search" />
                            </DataTable>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} lg={6}>
                        <Card title="Core vs Non-Core" className="shadow-2 border-round" style={{ height: '450px', width: '100%' }}>
                            {coreNonCoreData.length > 0 ? (
                                <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                                    <Chart type="pie" data={coreChartData} options={{ maintainAspectRatio: false, responsive: true }} style={{ width: '90%', height: '85%' }} />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Message severity="info" text="No Core/Non-Core data available." />
                                </div>
                            )}
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6} lg={6}>
                        <Card title="Placements by Year" className="shadow-2 border-round" style={{ height: '450px', width: '100%' }}>
                            {yearWiseData.length > 0 ? (
                                <div style={{ height: '100%', padding: '1rem' }}>
                                    <Chart type="bar" data={yearChartData} options={yearWiseChartOptions} style={{ width: '100%', height: '95%' }} />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Message severity="info" text="No Year-Wise data available." />
                                </div>
                            )}
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={12}>
                        <Card title="Placements by Department" className="shadow-2 border-round" style={{ height: '450px', width: '100%' }}>
                            {departmentWiseData.length > 0 ? (
                                <DataTable value={departmentWiseData} scrollable scrollHeight="380px" emptyMessage="No department data found."
                                    className="p-datatable-sm"
                                    stripedRows>
                                    <Column field="department" header="Department" sortable />
                                    <Column field="placed_students" header="Placed" sortable />
                                </DataTable>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <Message severity="info" text="No Department-Wise data available." />
                                </div>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </div>
    );
};

export default PlacementReport;

// original code

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { Chart } from 'primereact/chart';
// import { Card } from 'primereact/card';
// import { Dropdown } from 'primereact/dropdown';
// import { Container, Paper ,Grid } from '@mui/material';

// const PlacementReport = () => {
//     const [allPlacements, setAllPlacements] = useState([]);
//     const [coreNonCoreData, setCoreNonCoreData] = useState([]);
//     const [yearWiseData, setYearWiseData] = useState([]);
//     const [departmentWiseData, setDepartmentWiseData] = useState([]);

//     useEffect(() => {
//         fetchAllPlacements();
//         fetchCoreNonCoreData();
//         fetchYearWiseData();
//         fetchDepartmentWiseData();
//     }, []);

//     const fetchAllPlacements = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.get('http://localhost:3000/api/placement/getAllPlacementDetails',
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
//                     },
//                 });
//             setAllPlacements(response.data);
//         } catch (error) {
//             console.error('Failed to fetch all placements', error);
//         }
//     };

//     const fetchCoreNonCoreData = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.get('http://localhost:3000/api/placement/getCoreNonCorePlacements',
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
//                     },
//                 });
//             setCoreNonCoreData(response.data);
//         } catch (error) {
//             console.error('Failed to fetch core/non-core data', error);
//         }
//     };

//     const fetchYearWiseData = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.get('http://localhost:3000/api/placement/getStudentsPlacedYearOfStudyWise',
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
//                     },
//                 });
//             setYearWiseData(response.data);
//         } catch (error) {
//             console.error('Failed to fetch year-wise placement data', error);
//         }
//     };

//     const fetchDepartmentWiseData = async () => {
//         try {
//             const token = localStorage.getItem("token");
//             const response = await axios.get('http://localhost:3000/api/placement/getPlacedDepartmentWise',
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
//                     },
//                 });
//             setDepartmentWiseData(response.data);
//         } catch (error) {
//             console.error('Failed to fetch department-wise placement data', error);
//         }
//     };

//     const coreNonCoreOptions = {
//         labels: coreNonCoreData.map(data => data.core_non_core),
//         datasets: [
//             {
//                 data: coreNonCoreData.map(data => data.count),
//                 backgroundColor: ['#42A5F5', '#66BB6A'],
//                 hoverBackgroundColor: ['#64B5F6', '#81C784']
//             }
//         ]
//     };

//     const yearWiseOptions = {
//         labels: yearWiseData.map(data => data.year),
//         datasets: [
//             {
//                 label: 'Number of Students Placed',
//                 data: yearWiseData.map(data => data.placed_students),
//                 backgroundColor: '#ffce56'
//             }
//         ]
//     };

//     return (
//         <Container>
//             <Grid container spacing={3}>
//                 <Grid item xs={12}>
//                     <Card title="Placement Details">
//                         <DataTable value={allPlacements}>
//                             <Column field="student_name" header="Student Name"></Column>
//                             <Column field="company_name" header="Company Name"></Column>
//                             <Column field="position" header="Position"></Column>
//                             <Column field="salary" header="Salary"></Column>
//                             <Column field="placement_date" header="Placement Date"></Column>
//                             <Column field="location" header="Location"></Column>
//                             <Column field="core_non_core" header="Core/Non-Core"></Column>
//                         </DataTable>
//                     </Card>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     <Card title="Core vs Non-Core Placements">
//                         <Chart type="pie" data={coreNonCoreOptions} />
//                     </Card>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                     <Card title="Year of Study Placement Stats">
//                         <Chart type="bar" data={yearWiseOptions} />
//                     </Card>
//                 </Grid>
//                 <Grid item xs={12}>
//                     <Card title="Department Wise Placement Stats">
//                         <DataTable value={departmentWiseData}>
//                             <Column field="department" header="Department"></Column>
//                             <Column field="placed_students" header="Placed Students"></Column>
//                         </DataTable>
//                     </Card>
//                 </Grid>
//             </Grid>
//         </Container>
//     );
// };

// export default PlacementReport;