// ImportExcel.jsx
import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import * as XLSX from 'xlsx';

const StudentTable = ({ studentData }) => {
    const [filteredStudents, setFilteredStudents] = useState(studentData);
    const [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef(null); // To reset file input

    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (!jsonData[0] || !jsonData[0]['Roll No.']) {
                setErrorMessage('The Excel file must contain a column named "Roll No."');
                return;
            }

            // Extract and normalize roll numbers
            const extractedRollNumbers = jsonData.map((row) =>
                String(row['Roll No.']).trim().toLowerCase()
            ).filter(Boolean);

            // Filter studentData based on the roll numbers
            const matchedStudents = studentData.filter((student) =>
                extractedRollNumbers.includes(String(student.student_id).trim().toLowerCase())
            );

            // Show matched students or reset to all students if no match
            setFilteredStudents(matchedStudents.length > 0 ? matchedStudents : studentData);
            setErrorMessage('');

            // Reset file input to allow re-upload
            fileInputRef.current.value = '';
        };

        reader.readAsBinaryString(file);
    };

    // Reset the table and the file input
    const resetTable = () => {
        setFilteredStudents(studentData);
        setErrorMessage('');
        fileInputRef.current.value = ''; // Reset file input
    };

    return (
        <div>
            <h3>Student Data</h3>

            {/* Import and Reset Buttons */}
            <div style={{ marginBottom: '10px' }}>
                <Button label="Import Excel" icon="pi pi-upload" className="p-button-outlined">
                    <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        style={{ opacity: 0, position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }} 
                        onChange={handleFileUpload} 
                        ref={fileInputRef}
                    />
                </Button>
                <Button label="Reset Table" icon="pi pi-refresh" className="p-button-outlined" onClick={resetTable} style={{ marginLeft: '10px' }} />
            </div>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {/* DataTable for displaying students */}
            <DataTable value={filteredStudents} paginator rows={5}>
                <Column field="student_id" header="Student ID"></Column>
                <Column field="name" header="Name"></Column>
            </DataTable>
        </div>
    );
};

export default StudentTable;
