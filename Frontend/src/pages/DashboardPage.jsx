import React, { useState, useEffect } from 'react';
import { Container, Grid } from '@mui/material';
import SummaryCard from './dashboardComponents/SummaryCard';
import DepartmentWisePlacements from './dashboardComponents/DepartmentWisePlacements'; // Ensure path is correct
import PlacementTrend from './dashboardComponents/PlacementTrend';
import TopCompaniesByCTC from './dashboardComponents/TopCompaniesByCTC';
import CTCStats from './dashboardComponents/CTCStats';
import TopCompaniesByOffers from './dashboardComponents/TopCompaniesByOffers';
import { PrimeIcons } from 'primereact/api';
import axios from 'axios';

const DashboardPage = () => {
  const [summaryData, setSummaryData] = useState({
    studentCount: 0,
    companiesCount: 0,
    jobOffersCount: 0,
    placedStudentsCount: 0,
  });

  const [departmentData, setDepartmentData] = useState([]);
  const [placementTrendData, setPlacementTrendData] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [ctcStats, setCtcStats] = useState({ max: 0, avg: 0, min: 0 });
  const [topCompaniesByOffers, setTopCompaniesByOffers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await localStorage.getItem("token");
        const [placementsRes, studentsRes, departmentsRes, companiesRes] = await Promise.all([
          axios.get("http://localhost:3000/api/placement/getAllPlacements",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          axios.get("http://localhost:3000/api/student/getAllStudents",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          axios.get("http://localhost:3000/api/department/getAllDepartments",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          axios.get("http://localhost:3000/api/company/getAllCompanies",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
        ]);

        const placements = placementsRes.data || [];
        const students = studentsRes.data || [];
        const departments = departmentsRes.data || [];
        const companies = companiesRes.data || [];

        // Map student IDs to their department names for easier lookup
        const studentDepartmentMap = students.reduce((map, student) => {
            const department = departments.find(dep => dep.dep_id === student.dep_id)?.dep_name;
            if (department) {
                map[student.student_id] = department;
            }
            return map;
        }, {});


        // Compute summary data
        const placedStudentIds = new Set(placements.map(p => p.student_id)); // Use Set for unique placed students
        const placedStudentsCount = placedStudentIds.size;
        const companiesCount = companies.length;

        setSummaryData({
          studentCount: students.length,
          companiesCount: companiesCount,
          jobOffersCount: placements.length, // Total offers might be > placed students
          placedStudentsCount: placedStudentsCount,
        });

        // --- FIX FOR DepartmentWisePlacements ---
        // Compute department-wise placements (counting unique placed students per department)
        const placedDepartmentCounts = {};
        placedStudentIds.forEach(studentId => {
            const departmentName = studentDepartmentMap[studentId];
            if (departmentName) {
                placedDepartmentCounts[departmentName] = (placedDepartmentCounts[departmentName] || 0) + 1;
            }
        });

        // Format data for the Pie Chart - only include departments with placed students
        setDepartmentData(
            Object.entries(placedDepartmentCounts)
                .map(([name, value]) => ({ name, value }))
                .filter(entry => entry.value > 0) // Ensure only departments with placements > 0 are included
        );
        // --- END OF FIX ---


        // Compute placement trend data (Placed vs Total Students per Department)
        const placementTrend = departments.map(dep => {
          const studentsInDep = students.filter(student => student.dep_id === dep.dep_id);
          const studentsInDepIds = studentsInDep.map(s => s.student_id);

          // Count unique placed students *within this specific department*
          let placedInDepCount = 0;
          placedStudentIds.forEach(placedId => {
              if (studentsInDepIds.includes(placedId)) {
                  placedInDepCount++;
              }
          });

          return { name: dep.dep_name, Placed: placedInDepCount, Total: studentsInDep.length };
        });
        setPlacementTrendData(placementTrend);


        // Compute top companies by CTC
        const companiesCTC = placements.reduce((acc, p) => {
            const salary = Number(p.salary);
            if (!isNaN(salary)) {
                acc[p.company_id] = Math.max(acc[p.company_id] || 0, salary);
            }
          return acc;
        }, {});
        setTopCompanies(
          companies
            .map(company => ({
              name: company.company_name,
              ctc: companiesCTC[company.company_id] || 0,
            }))
            .sort((a, b) => b.ctc - a.ctc)
            .slice(0, 5)
        );

        // Compute CTC statistics
        const salaries = placements.map(p => Number(p.salary)).filter(s => !isNaN(s) && s > 0);
        const salariesCount = salaries.length;

        setCtcStats({
          max: salariesCount > 0 ? Math.max(...salaries) : 0,
          avg: salariesCount > 0 ? salaries.reduce((sum, salary) => sum + salary, 0) / salariesCount : 0,
          min: salariesCount > 0 ? Math.min(...salaries) : 0,
        });

        // Compute top companies by offers
        const offersCount = placements.reduce((acc, p) => {
          acc[p.company_id] = (acc[p.company_id] || 0) + 1; // Counts total offers per company
          return acc;
        }, {});
        setTopCompaniesByOffers(
          companies
            .map(company => ({
              name: company.company_name,
              offers: offersCount[company.company_id] || 0,
            }))
            .sort((a, b) => b.offers - a.offers)
            .slice(0, 5)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
         setSummaryData({ studentCount: 0, companiesCount: 0, jobOffersCount: 0, placedStudentsCount: 0 });
         setDepartmentData([]);
         setPlacementTrendData([]);
         setTopCompanies([]);
         setCtcStats({ max: 0, avg: 0, min: 0 });
         setTopCompaniesByOffers([]);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <SummaryCard title="Students" count={summaryData.studentCount} icon={PrimeIcons.USERS} />
          <SummaryCard title="Companies" count={summaryData.companiesCount} icon={PrimeIcons.BUILDING} />
          <SummaryCard title="Job Offers" count={summaryData.jobOffersCount} icon={PrimeIcons.BRIEFCASE} />
          <SummaryCard title="Placed Students" count={summaryData.placedStudentsCount} icon={PrimeIcons.CHECK} />
          <DepartmentWisePlacements data={departmentData} /> {/* Pass the filtered data */}
          <PlacementTrend data={placementTrendData} />
          <TopCompaniesByCTC companies={topCompanies} />
          <CTCStats stats={ctcStats} />
          <TopCompaniesByOffers companies={topCompaniesByOffers} />
        </Grid>
      </Container>
    </>
  );
};

export default DashboardPage;

