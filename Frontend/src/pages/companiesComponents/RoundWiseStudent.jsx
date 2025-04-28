import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import axios from 'axios';

const RoundWiseStudent = ({ companyId }) => {
    const [rounds, setRounds] = useState([]);
    const [selectedRound, setSelectedRound] = useState(null);
    const [selectedRoundData, setSelectedRoundData] = useState(null); // To store round details
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]); // State for selected rows in DataTable

    const fetchRounds = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:3000/api/interviewRound/getByCompanyId/${companyId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setRounds(response.data);
        } catch (error) {
            console.error("Error fetching rounds:", error);
        }
    };

    const fetchStudentsByRound = async (roundId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:3000/api/roundParticipation/getStudentsByRoundId/${roundId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setFilteredStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
            setFilteredStudents([]);
        }
    };

    const fetchRoundDetails = async (roundId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:3000/api/interviewRound/getByRoundId/${roundId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSelectedRoundData(response.data);
        } catch (error) {
            console.error("Error fetching round details:", error);
            setSelectedRoundData(null);
        }
    };

    useEffect(() => {
        fetchRounds();
    }, [companyId]);

    useEffect(() => {
        if (selectedRound) {
            fetchStudentsByRound(selectedRound);
            fetchRoundDetails(selectedRound); // Fetch round details when round is selected
        } else {
            setFilteredStudents([]);
            setSelectedRoundData(null);
        }
    }, [selectedRound]);

    const roundOptions = rounds.map((round) => ({
        label: round.round_name,
        value: round.round_id
    }));

    const sendEmail = async () => {
        if (!selectedRoundData) {
            alert("Round details are not loaded. Please select a round.");
            return;
        }
        if (selectedStudents.length === 0) {
            alert("Please select at least one student to send email.");
            return;
        }

        const studentEmails = selectedStudents.map(student => student.college_email).filter(email => email);
        if (studentEmails.length === 0) {
            alert("No college emails available for selected students.");
            return;
        }

        const roundType = selectedRoundData.round_type;
        let emailSubject = "";
        let emailBody = "";

        // Email Templates based on round type
        if (roundType === 'ppt') {
            emailSubject = `Regarding PPT Round - ${selectedRoundData.round_name}`;
            emailBody = `
                <p>Dear Students,</p>
                <p>This is to inform you about the upcoming PPT round for ${selectedRoundData.round_name}.</p>
                <p>Round Name: ${selectedRoundData.round_name}</p>
                <p>Round Date: ${selectedRoundData.round_date}</p>
                <p>Please be prepared for the presentation.</p>
                <p>Best Regards,</p>
                <p>CDC Placement Team, PDEU</p>
            `;
        } else if (roundType === 'shortlist') {
            emailSubject = `Shortlisting for Next Round - ${selectedRoundData.round_name}`;
            emailBody = `
                <p>Dear Students,</p>
                <p>Congratulations! You have been shortlisted for the next round of interviews for ${selectedRoundData.round_name}.</p>
                <p>Round Name: ${selectedRoundData.round_name}</p>
                <p>We will inform you about the next steps shortly.</p>
                <p>Best Regards,</p>
                <p>CDC Placement Team, PDEU</p>
            `;
        } else if (roundType === 'final') {
            emailSubject = `Final Round Announcement - ${selectedRoundData.round_name}`;
            emailBody = `
                <p>Dear Students,</p>
                <p>This is the announcement for the final round of interviews for ${selectedRoundData.round_name}.</p>
                <p>Round Name: ${selectedRoundData.round_name}</p>
                <p>Please prepare well for the final round.</p>
                <p>Best Regards,</p>
                <p>CDC Placement Team, PDEU</p>
            `;
        } else {
            emailSubject = `Regarding Round - ${selectedRoundData.round_name}`;
            emailBody = `<p>Dear Students,</p><p>This is a general announcement regarding the round: ${selectedRoundData.round_name}.</p><p>Best Regards,</p><p>CDC Placement Team, PDEU</p>`;
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


    return (
        <div>
            <div>
                <h2>Select a Round to View Students</h2>
                <Dropdown
                    value={selectedRound}
                    options={roundOptions}
                    onChange={(e) => setSelectedRound(e.value)}
                    placeholder="Select a Round"
                    style={{ marginBottom: '20px', width: '200px' }}
                />
            </div>

            {/* Global Search Input */}
            <div className="p-inputgroup" style={{ marginBottom: '20px' }}>
                <span className="p-inputgroup-addon">
                    <i className="pi pi-search" />
                </span>
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Global Search"
                    style={{ width: '300px' }}
                />
            </div>

            <Button label="Send Email to Selected" icon="pi pi-envelope" onClick={sendEmail} disabled={selectedStudents.length === 0} style={{ marginBottom: '20px' }} />

            {/* DataTable with filtering and selection */}
            <DataTable
                value={filteredStudents}
                paginator
                rows={5}
                globalFilter={globalFilter}
                emptyMessage="No students found for this round"
                responsiveLayout="scroll"
                selectionMode="checkbox" // Enable checkbox selection
                selection={selectedStudents}
                onSelectionChange={(e) => setSelectedStudents(e.value)}
                dataKey="student_id" // Important for controlled selection
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                <Column field="student_id" header="Student ID" filter filterPlaceholder="Search by ID" />
                <Column field="name" header="Name" filter filterPlaceholder="Search by Name" />
                <Column field="rollNumber" header="Roll Number" filter filterPlaceholder="Search by Roll" />
                <Column field="college_email" header="College Email" filter filterPlaceholder="Search by College Email" />
                <Column field="gender" header="Gender" filter filterPlaceholder="Search by Gender" />
                <Column field="phone_number" header="Phone Number" filter filterPlaceholder="Search by Phone" />
            </DataTable>
        </div>
    );
};

export default RoundWiseStudent;