// src/pages/Results.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import "./Results.css"; // Ensure you create a Results.css file

const Results = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [interviewRounds, setInterviewRounds] = useState([]);
    const [selectedRound, setSelectedRound] = useState(null);
    const [studentsInRound, setStudentsInRound] = useState([]);
    const [placedStudents, setPlacedStudents] = useState([]);
    const [viewType, setViewType] = useState(null); // 'round' or 'placed'
    const [departments, setDepartments] = useState([]); // State to store departments
    const [schools, setSchools] = useState([]); // State to store schools

    useEffect(() => {
        const token = localStorage.getItem('token'); // Retrieve token from localStorage

        if (!token) {
            console.warn("No token found in localStorage. User might not be logged in.");
            return; // Stop fetching if no token is found
        }

        // Fetch companies
        axios.get('http://localhost:3000/api/company/getAllCompanies', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                setCompanies(res.data);
            })
            .catch(err => {
                console.error("Error fetching companies:", err);
            });

        // Fetch departments
        axios.get('http://localhost:3000/api/department/getAllDepartments', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                setDepartments(res.data);
            })
            .catch(err => {
                console.error("Error fetching departments:", err);
            });

        // Fetch schools
        axios.get('http://localhost:3000/api/school/getAllSchools', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => {
                setSchools(res.data);
            })
            .catch(err => {
                console.error("Error fetching schools:", err);
            });


    }, []);

    useEffect(() => {
        if (selectedCompany) {
            const token = localStorage.getItem('token'); // Retrieve token for subsequent requests
            if (!token) {
                console.warn("No token found in localStorage for fetching interview rounds.");
                return;
            }

            axios.get(`http://localhost:3000/api/interviewRound/getByCompanyId/${selectedCompany.company_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(res => {
                    setInterviewRounds(res.data);
                })
                .catch(err => {
                    console.error("Error fetching interview rounds:", err);
                });
            setStudentsInRound([]); // Clear previous round's students when company changes
            setPlacedStudents([]);     // Clear placed students as well
            setViewType(null);         // Reset view type
            setSelectedRound(null);    // Reset selected round
        } else {
            setInterviewRounds([]);
            setStudentsInRound([]);
            setPlacedStudents([]);
            setViewType(null);
            setSelectedRound(null);
        }
    }, [selectedCompany]);

    const fetchStudentsInRound = () => {
        if (selectedCompany && selectedRound) {
            const token = localStorage.getItem('token'); // Retrieve token for subsequent requests
            if (!token) {
                console.warn("No token found in localStorage for fetching students in round.");
                return;
            }
            //  Correct API endpoint needed to fetch students for a specific round.
            //  Using the correct endpoint from backend routes:
            axios.get(`http://localhost:3000/api/roundParticipation/getStudentsByRoundId/${selectedRound.round_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(res => {
                    // Now, assuming the backend returns students specific to the round
                    setStudentsInRound(res.data);
                    setPlacedStudents([]);
                    setViewType('round');
                })
                .catch(err => {
                    console.error("Error fetching students in round:", err);
                    // If API endpoint is not yet implemented or returns error,
                    // you might want to handle this case, e.g., display a message to the user.
                    setStudentsInRound([]); // Clear students on error as well
                });
        }
    };

    const fetchPlacedStudents = () => {
        if (selectedCompany) {
            const token = localStorage.getItem('token'); // Retrieve token for subsequent requests
            if (!token) {
                console.warn("No token found in localStorage for fetching placed students.");
                return;
            }
            axios.get(`http://localhost:3000/api/placement/getPlacementByCompanyId/${selectedCompany.company_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(res => {
                    setPlacedStudents(res.data);
                    setStudentsInRound([]);
                    setViewType('placed');
                })
                .catch(err => {
                    console.error("Error fetching placed students:", err);
                });
        }
    };

    const companyDropdown = (
        <Dropdown
            value={selectedCompany}
            options={companies}
            onChange={(e) => setSelectedCompany(e.value)}
            optionLabel="company_name"
            placeholder="Select a Company"
            className="w-full md:w-14rem"
        />
    );

    const roundDropdown = (
        <Dropdown
            value={selectedRound}
            options={interviewRounds}
            onChange={(e) => setSelectedRound(e.value)}
            optionLabel="round_name"
            placeholder="Select an Interview Round"
            className="w-full md:w-14rem"
            disabled={!selectedCompany}
        />
    );

    const viewStudentsInRoundButton = (
        <button
            className="p-button p-button-raised p-button-secondary"
            onClick={fetchStudentsInRound}
            disabled={!selectedCompany || !selectedRound}
        >
            View Students in Round
        </button>
    );

    const viewPlacedStudentsButton = (
        <button
            className="p-button p-button-raised p-button-primary"
            onClick={fetchPlacedStudents}
            disabled={!selectedCompany}
        >
            View Placed Students
        </button>
    );

    const formatDate = (value) => {
        if (value) {
            const date = new Date(value);
            return date.toISOString().slice(0, 10); // YYYY-MM-DD format
        }
        return null;
    };

    const getDepartmentName = (dep_id) => {
        const department = departments && departments.find(dep => dep.dep_id === dep_id);
        return department ? department.dep_name : 'N/A';
    };

    const getSchoolName = (school_id) => {
        const school = schools && schools.find(s => s.school_id === school_id);
        return school ? school.school_name : 'N/A';
    };


    const renderRoundStudentsTable = () => {
        return (
            <DataTable value={studentsInRound} responsiveLayout="scroll" className="results-datatable">
                <Column field="name" header="Name" />
                <Column field="rollNumber" header="Roll Number" />
                <Column
                    field="date_of_birth"
                    header="Birth Date"
                    body={(rowData) => formatDate(rowData.date_of_birth)}
                />
                <Column field="phone_number" header="Phone Number" />
                <Column field="personal_email" header="Email" />
                <Column field="year_of_study" header="Year of Study" />
                <Column
                    header="Department"
                    body={(rowData) => getDepartmentName(rowData.dep_id)}
                />
                <Column
                    header="School"
                    body={(rowData) => getSchoolName(rowData.school_id)}
                />
                <Column field="remark" header="Remarks" />
            </DataTable>
        );
    };

    const renderPlacedStudentsTable = () => {
        return (
            <DataTable value={placedStudents} responsiveLayout="scroll" className="results-datatable">
                <Column field="student_name" header="Name" />
                <Column field="rollNumber" header="Roll Number" />
                <Column field="position" header="Position" />
                <Column field="location" header="Location" />
                <Column field="salary" header="Salary (INR)" />
                <Column field="placement_date" header="Placement Date" body={(rowData) => formatDate(rowData.placement_date)} />
                <Column field="offer_type" header="Offer Type" />
                <Column field="core_non_core" header="Domain" />
            </DataTable>
        );
    };


    return (
        <div className="results-page card">
            <h1>Results Page</h1>

            <div className="results-dropdown mb-4">
                <label htmlFor="companyDropdown" className="block text-900 text-xl font-medium mb-2">
                    Select Company
                </label>
                {companyDropdown}
            </div>

            {selectedCompany && (
                <div>
                    <div className="results-dropdown mb-4">
                        <label htmlFor="roundDropdown" className="block text-900 text-xl font-medium mb-2">
                            View Students in Round
                        </label>
                        <div className="flex align-items-center">
                            {roundDropdown}
                            <div className="ml-2">
                                {viewStudentsInRoundButton}
                            </div>
                        </div>
                    </div>

                    <div className="results-button-container mb-4">
                        <label htmlFor="placedStudents" className="block text-900 text-xl font-medium mb-2">
                            View Placed Students
                        </label>
                        <div>
                            {viewPlacedStudentsButton}
                        </div>
                    </div>

                    {viewType === 'round' && studentsInRound.length > 0 && renderRoundStudentsTable()}
                    {viewType === 'placed' && placedStudents.length > 0 && renderPlacedStudentsTable()}
                </div>
            )}
        </div>
    );
};

export default Results;