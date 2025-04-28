// src/pages/Communication.jsx
import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import '../pages/Communication.css'; // Import the CSS file

const Communication = () => {
    const [studentStatus, setStudentStatus] = useState(null);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [departments, setDepartments] = useState([]);
    const [schools, setSchools] = useState([]);
    // Add state to store placement data
    const [placements, setPlacements] = useState([]);

    const statusOptions = [
        { label: 'Placed Students', value: 'placed' },
        { label: 'Unplaced Students', value: 'unplaced' },
        { label: 'Opted Out Students', value: 'opted_out' },
    ];

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3000/api/department/getAllDepartments", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(response.data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const fetchSchools = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3000/api/school/getAllSchools", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchools(response.data);
        } catch (error) {
            console.error("Failed to fetch schools", error);
        }
    };

    // Fetch placement data - similar to ManageStudents.js
    const fetchPlacements = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3000/api/placement/getAllPlacementsStudentIds", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPlacements(response.data);
        } catch (error) {
            console.error("Error fetching placements:", error);
        }
    };

    useEffect(() => {
        fetchDepartments();
        fetchSchools();
        fetchPlacements(); // Fetch placements on component mount
    }, []);

    useEffect(() => {
        if (studentStatus) {
            fetchStudentsByStatus(studentStatus);
        } else {
            setStudents([]);
            setFilteredStudents([]);
        }
    }, [studentStatus, placements]); // Re-fetch students when status or placements change (important!)

    const fetchStudentsByStatus = async (status) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:3000/api/student/getAllStudents", { // Use getAllStudents endpoint
                headers: { Authorization: `Bearer ${token}` },
            });

            let allStudents = response.data;

            // Enrich student data with placementStatus - same logic as ManageStudents.js
            const enrichedStudents = allStudents.map((student) => {
                const department = departments.find(dep => String(dep.dep_id) === String(student.dep_id));
                const school = schools.find(sch => String(sch.school_id) === String(student.school_id));
                const isPlaced = placements.some(placement => String(placement.student_id) === String(student.student_id)); // Check against fetched placements

                return {
                    ...student,
                    department: department ? { dep_id: department.dep_id, dep_name: department.dep_name } : null,
                    school: school ? { school_id: school.school_id, school_name: school.school_name } : null,
                    placementStatus: isPlaced ? 'Placed' : 'Unplaced' // Dynamically set placementStatus
                };
            });


            let filteredByStatus = [];

            if (status === 'placed') {
                filteredByStatus = enrichedStudents.filter(student => student.placementStatus === 'Placed'); // Filter based on *dynamic* placementStatus
            } else if (status === 'unplaced') {
                filteredByStatus = enrichedStudents.filter(student => student.placementStatus === 'Unplaced'); // Filter based on *dynamic* placementStatus
            } else if (status === 'opted_out') {
                filteredByStatus = enrichedStudents.filter(student => student.optout === 1); // Opt-out filter remains the same
            }


            setStudents(enrichedStudents); // Store all enriched students (might be useful for caching if needed)
            setFilteredStudents(filteredByStatus); // Set filtered students for display


        } catch (error) {
            console.error("Error fetching students:", error);
            setStudents([]);
            setFilteredStudents([]);
        }
    };

    const sendEmail = async () => {
        if (selectedStudents.length === 0) {
            alert("Please select at least one student to send email.");
            return;
        }

        const studentEmails = selectedStudents.map(student => student.college_email).filter(email => email);
        if (studentEmails.length === 0) {
            alert("No college emails available for selected students.");
            return;
        }

        let emailSubject = "";
        let emailBody = "";

        if (studentStatus === 'placed') {
            emailSubject = "Congratulations on Your Placement!";
            emailBody = `
                <p>Dear Student,</p>
                <p>Congratulations on your successful placement! We are thrilled to inform you about your placement.</p>
                <p>We wish you all the best in your future endeavors.</p>
                <p>Best Regards,</p>
                <p>CDC Placement Team, PDEU</p>
            `;
        } else if (studentStatus === 'unplaced') {
            emailSubject = "Placement Opportunities - Stay Tuned";
            emailBody = `
                <p>Dear Student,</p>
                <p>We understand you are currently unplaced and looking for opportunities. Please stay tuned for upcoming placement drives and opportunities.</p>
                <p>We are here to support you in your placement journey.</p>
                <p>Best Regards,</p>
                <p>CDC Placement Team, PDEU</p>
            `;
        } else if (studentStatus === 'opted_out') {
            emailSubject = "Regarding Your Opt-Out Status";
            emailBody = `
                <p>Dear Student,</p>
                <p>This is regarding your opt-out status from the placement process. If there are any changes or if you wish to reconsider, please let us know.</p>
                <p>Thank you for confirming your decision.</p>
                <p>Best Regards,</p>
                <p>CDC Placement Team, PDEU</p>
            `;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:3000/api/send-email`,
                {
                    email: studentEmails,
                    subject: emailSubject,
                    data: emailBody
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );
            alert("Emails sent successfully!");
        } catch (error) {
            console.error("Error sending emails:", error);
            alert("Failed to send emails.");
        }
    };

    const header = (
        <div className="communication-table-header">
            <h2>{statusOptions.find(opt => opt.value === studentStatus)?.label || 'Students'}</h2>
            <span className="p-input-icon-left">
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Global Search" />
                </IconField>
            </span>
        </div>
    );


    return (
        <div className="communication-page card">
            <h2>Communication with Students</h2>
            <div className="communication-dropdown-container">
                <Dropdown
                    value={studentStatus}
                    options={statusOptions}
                    onChange={(e) => {
                        setStudentStatus(e.value);
                        setFilteredStudents([]);
                        setSelectedStudents([]);
                    }}
                    placeholder="Select Student Status"
                    className="communication-dropdown"
                />
            </div>

            <Button label="Send Email to Selected" icon="pi pi-envelope" onClick={sendEmail} disabled={selectedStudents.length === 0} className="communication-send-email-button" />

            {filteredStudents.length > 0 && (
                <DataTable
                    value={filteredStudents}
                    paginator
                    rows={5}
                    globalFilter={globalFilter}
                    header={header}
                    selectionMode="checkbox"
                    selection={selectedStudents}
                    onSelectionChange={(e) => setSelectedStudents(e.value)}
                    dataKey="student_id"
                    emptyMessage="No students found."
                    responsiveLayout="scroll"
                    className="communication-datatable"
                >
                    <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
                    <Column field="name" header="Name" filter filterPlaceholder="Search by name" />
                    <Column field="rollNumber" header="Roll Number" filter filterPlaceholder="Search by roll number" style={{ minWidth: '150px' }}/>
                    <Column field="college_email" header="College Email" filter filterPlaceholder="Search by college email" />
                    <Column field="phone_number" header="Phone Number" filter filterPlaceholder="Search by phone number" style={{ minWidth: '175px' }}/>
                    <Column header="School" body={(rowData) => rowData.school?.school_name || 'N/A'} filterField="school.school_name" filter filterPlaceholder="Search by school" />
                    <Column header="Department" body={(rowData) => rowData.department?.dep_name || 'N/A'} filterField="department.dep_name" filter filterPlaceholder="Search by department" />
                    <Column field="placementStatus" header="Placement Status" style={{ minWidth: '170px' }}/> {/* Display the dynamic placementStatus */}
                    <Column field="year_of_study" header="Year of Study" filter filterPlaceholder="Search by year" style={{ minWidth: '170px' }}/>
                    <Column field="cpi_after_7th_sem" header="CPI After 7th Sem" filter filterPlaceholder="Search by CPI" style={{ minWidth: '200px' }}/>
                    <Column field="no_of_backlog" header="No. of Backlogs" filter filterPlaceholder="Search by backlogs" style={{ minWidth: '200px' }}/>
                    <Column field="no_of_active_backlog" header="No. of Active Backlogs" filter filterPlaceholder="Search by active backlogs" style={{ minWidth: '200px' }}/>
                    <Column field="optout" header="Opt-Out" body={(rowData) => rowData.optout === 1 ? 'Yes' : 'No'} filter filterPlaceholder="Search by opt-out status" style={{ minWidth: '150px' }}/>
                    {studentStatus === 'placed' && (
                        <>
                            <Column field="company_name" header="Company Name" filter filterPlaceholder="Search by company" />
                            <Column field="salary" header="Salary" filter filterPlaceholder="Search by salary" />
                            <Column field="placement_date" header="Placement Date" filter filterPlaceholder="Search by date" />
                        </>
                    )}
                </DataTable>
            )}
        </div>
    );
};

export default Communication;