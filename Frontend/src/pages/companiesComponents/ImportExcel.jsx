import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import * as ExcelJS from 'exceljs';
const StudentTable = ({ studentData }) => {
const [filteredStudents, setFilteredStudents] = useState(studentData);
const [errorMessage, setErrorMessage] = useState('');
const fileInputRef = useRef(null); // To reset file input
const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            setErrorMessage('No worksheet found in the Excel file.');
            return;
        }

        const headerRow = worksheet.getRow(1).values;
        const rollNoColumnIndex = headerRow.findIndex(header => String(header).trim().toLowerCase() === 'roll no.');

        if (rollNoColumnIndex === -1) {
            setErrorMessage('The Excel file must contain a column named "Roll No."');
            return;
        }

        const jsonData = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) {
                const rowData = {};
                row.eachCell((cell, colNumber) => {
                    rowData[`Column${colNumber}`] = cell.value;
                });
                jsonData.push(rowData);
            }
        });

        const extractedRollNumbers = jsonData.map((row) =>
            String(row[`Column${rollNoColumnIndex + 1}`]).trim().toLowerCase()
        ).filter(Boolean);

        const matchedStudents = studentData.filter((student) =>
            extractedRollNumbers.includes(String(student.student_id).trim().toLowerCase())
        );

        setFilteredStudents(matchedStudents.length > 0 ? matchedStudents : studentData);
        setErrorMessage('');
        fileInputRef.current.value = ''; // Reset file input

    } catch (error) {
        console.error('Error reading Excel file:', error);
        setErrorMessage('Failed to read the Excel file. Please ensure it is a valid format.');
    }
};

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