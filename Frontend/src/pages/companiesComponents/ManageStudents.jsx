import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputNumber } from 'primereact/inputnumber';

const ManageStudents = ({ companyId }) => {
const [selectedStudents, setSelectedStudents] = useState([]);
const [selectedRound, setSelectedRound] = useState(null);
const [globalFilter, setGlobalFilter] = useState('');
const [students, setStudents] = useState([]);
const [filteredStudents, setFilteredStudents] = useState([]);
const [rounds, setRounds] = useState([]);
const [errorMessage, setErrorMessage] = useState('');
const [loading, setLoading] = useState(false);
const fileInputRef = useRef(null);
const [departments, setDepartments] = useState([]);
const [schools, setSchools] = useState([]);
const [placements, setPlacements] = useState([]);
const [selectedRoundToDelete, setSelectedRoundToDelete] = useState(null);
const [studentsInRound, setStudentsInRound] = useState([]);
const [selectedStudentsToDelete, setSelectedStudentsToDelete] = useState([]);
const [filteredStudentsInRound, setFilteredStudentsInRound] = useState([]);
const [globalFilterDelete, setGlobalFilterDelete] = useState('');

const dataTableRef = useRef(null);

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

const fetchStudents = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/student/getAllStudents", {
            headers: { Authorization: `Bearer ${token}` },
        });

        const studentData = response.data;

        const enrichedStudents = studentData.map((student) => {
            const department = departments.find(dep => String(dep.dep_id) === String(student.dep_id));
            const school = schools.find(sch => String(sch.school_id) === String(student.school_id));
            const isPlaced = placements.some(placement => String(placement.student_id) === String(student.student_id));

            return {
                ...student,
                department: department ? { dep_id: department.dep_id, dep_name: department.dep_name } : null,
                school: school ? { school_id: school.school_id, school_name: school.school_name } : null,
                placementStatus: isPlaced ? 'Placed' : 'Unplaced'
            };
        });

        setStudents(enrichedStudents);
        setFilteredStudents(enrichedStudents);
    } catch (error) {
        console.error("Error fetching students:", error);
        setErrorMessage("Failed to fetch student data. Please try again later.");
    } finally {
        setLoading(false);
    }
};

const fetchRounds = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/interviewRound/getByCompanyId/${companyId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setRounds(response.data);
    } catch (error) {
        console.error("Error fetching rounds:", error);
        setErrorMessage("Failed to fetch round data. Please try again later.");
    }
};

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

useEffect(() => {
    const loadInitialData = async () => {
        await fetchDepartments();
        await fetchSchools();
        await fetchRounds();
        await fetchPlacements();
    };
    loadInitialData();
}, [companyId]);

useEffect(() => {
    if (departments.length > 0 && schools.length > 0 && placements.length >= 0) {
        fetchStudents();
    }
}, [departments, schools, companyId, placements]);


const resetTable = () => {
    setGlobalFilter('');
    setFilteredStudents(students);
    setSelectedStudents([]);
    if (dataTableRef.current) {
        dataTableRef.current.reset(); // Clears column filters and global filter
    }
};

const roundOptions = rounds.map((round) => ({
    label: round.round_name,
    value: round.round_id
}));

const departmentOptions = departments.map(dep => ({ label: dep.dep_name, value: dep.dep_name }));
const schoolOptions = schools.map(sch => ({ label: sch.school_name, value: sch.school_name }));
const placementStatusOptions = [{ label: 'Placed', value: 'Placed' }, { label: 'Unplaced', value: 'Unplaced' }];
const optoutStatusOptions = [{ label: "Yes", value: 1 }, { label: "No", value: 0 }];

const onStudentSelect = (e, studentId) => {
    let _selectedStudents = [...selectedStudents];
    if (e.checked) {
        _selectedStudents.push(studentId);
    } else {
        _selectedStudents = _selectedStudents.filter(id => id !== studentId);
    }
    setSelectedStudents(_selectedStudents);
};

const addStudentsToSelectedRound = async () => {
    if (selectedStudents.length === 0 || !selectedRound) return;

    const token = localStorage.getItem("token");

    try {
        for (const studentId of selectedStudents) {
            const data = { round_id: selectedRound, student_id: studentId };
            await axios.post(`http://localhost:3000/api/roundParticipation/insert`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }

        console.log("All selected students have been added to the round.");
        setSelectedStudents([]);
        fetchStudents();
        setFilteredStudents(students);
    } catch (error) {
        console.error("Error adding students to the round:", error);
        setErrorMessage("Failed to add some or all students to the round. Please try again later.");
    }
};

const numberFilterTemplate = (options) => (
    <InputNumber
        value={options.value}
        onChange={(e) => options.filterApplyCallback(e.value)}
        placeholder="Enter value"
        className="p-column-filter"
    />
);

const betweenFilterTemplate = (options) => (
    <>
        <InputNumber
            value={options.value?.[0]}
            onChange={(e) => {
                const val = [e.value, options.value?.[1]];
                options.filterApplyCallback(val);
            }}
            placeholder="Min"
            className="p-column-filter"
        />
        <InputNumber
            value={options.value?.[1]}
            onChange={(e) => {
                const val = [options.value?.[0], e.value];
                options.filterApplyCallback(val);
            }}
            placeholder="Max"
            className="p-column-filter"
            style={{ marginLeft: '0.5rem' }}
        />
    </>
);

const isAllStudentsSelected = () => {
    return filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
};

const headerCheckbox = (
    <Checkbox
        checked={isAllStudentsSelected()}
        onChange={(e) => {
            if (e.checked) {
                const allStudentIds = filteredStudents.map(student => student.student_id);
                setSelectedStudents(allStudentIds);
            } else {
                setSelectedStudents([]);
            }
        }}
    />
);

const header = (
    <div className="table-header">
        <h2>Manage Students for Round</h2>
        <span className="p-input-icon-left">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." />
            </IconField>
        </span>
        <Button label="Reset Table" icon="pi pi-refresh" className="p-button-outlined" onClick={resetTable} style={{ marginLeft: '10px' }} />
    </div>
);

// Fetch students in round for deletion
const fetchStudentsInRound = async () => {
    if (!selectedRoundToDelete) {
        setStudentsInRound([]);
        setFilteredStudentsInRound([]);
        return;
    }
    setLoading(true);
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/roundParticipation/getStudentsDetailsByRoundId/${selectedRoundToDelete}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const studentDataInRound = response.data;

        const enrichedStudentsInRound = studentDataInRound.map((student) => {
            const department = departments.find(dep => String(dep.dep_id) === String(student.dep_id));
            const school = schools.find(sch => String(sch.school_id) === String(student.school_id));
            const isPlaced = placements.some(placement => String(placement.student_id) === String(student.student_id));

            return {
                ...student,
                department: department ? { dep_id: department.dep_id, dep_name: department.dep_name } : null,
                school: school ? { school_id: school.school_id, school_name: school.school_name } : null,
                placementStatus: isPlaced ? 'Placed' : 'Unplaced'
            };
        });
        setStudentsInRound(enrichedStudentsInRound);
        setFilteredStudentsInRound(enrichedStudentsInRound);


    } catch (error) {
        console.error("Error fetching students in round:", error);
        setErrorMessage("Failed to fetch students in round. Please try again later.");
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    if (selectedRoundToDelete) {
        fetchStudentsInRound();
    } else {
        setStudentsInRound([]);
        setFilteredStudentsInRound([]);
    }
}, [selectedRoundToDelete]);


const onStudentDeleteSelect = (e, studentId) => {
    let _selectedStudentsToDelete = [...selectedStudentsToDelete];
    if (e.checked) {
        _selectedStudentsToDelete.push(studentId);
    } else {
        _selectedStudentsToDelete = _selectedStudentsToDelete.filter(id => id !== studentId);
    }
    setSelectedStudentsToDelete(_selectedStudentsToDelete);
};

const deleteStudentsFromRound = async () => {
    if (selectedStudentsToDelete.length === 0 || !selectedRoundToDelete) return;

    const token = localStorage.getItem("token");

    try {
        for (const studentId of selectedStudentsToDelete) {
            await axios.delete(`http://localhost:3000/api/roundParticipation/deleteByRoundAndStudent`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { round_id: selectedRoundToDelete, student_id: studentId }
            });
        }

        console.log("Selected students have been deleted from the round.");
        setSelectedStudentsToDelete([]);
        fetchStudentsInRound();
    } catch (error) {
        console.error("Error deleting students from the round:", error);
        setErrorMessage("Failed to delete some or all students from the round. Please try again later.");
    }
};

const isAllStudentsToDeleteSelected = () => {
    return filteredStudentsInRound.length > 0 && selectedStudentsToDelete.length === filteredStudentsInRound.length;
};

const deleteHeaderCheckbox = (
    <Checkbox
        checked={isAllStudentsToDeleteSelected()}
        onChange={(e) => {
            if (e.checked) {
                const allStudentIds = filteredStudentsInRound.map(student => student.student_id);
                setSelectedStudentsToDelete(allStudentIds);
            } else {
                setSelectedStudentsToDelete([]);
            }
        }}
    />
);


const deleteTableHeader = (
    <div className="table-header">
        <h2>Students in Round</h2>
        <span className="p-input-icon-left">
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText type="search" value={globalFilterDelete} onChange={(e) => setGlobalFilterDelete(e.target.value)} placeholder="Search..." />
            </IconField>
        </span>
    </div>
);


return (
    <div>
        <h2>Add Students to Round</h2>
        <div style={{ marginBottom: '20px' }}>
            <Dropdown
                value={selectedRound}
                options={roundOptions}
                onChange={(e) => setSelectedRound(e.value)}
                placeholder="Select a Round to Add Students"
                style={{ width: '300px', marginRight: '20px' }}
            />
            <Button
                label="Add Selected Students to Round"
                onClick={addStudentsToSelectedRound}
                disabled={selectedStudents.length === 0 || !selectedRound}
                style={{ marginTop: '0px' }}
            />
        </div>

        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

        {selectedRound != null && (
            <>
                {/* <DataTable value={filteredStudents} header={header} globalFilter={globalFilter} paginator rows={5} filterDisplay="menu"> */}
                <DataTable
    ref={dataTableRef}
    value={filteredStudents}
    header={header}
    globalFilter={globalFilter}
    paginator
    rows={5}
    filterDisplay="menu"
>
                    <Column
                        header={headerCheckbox}
                        body={(rowData) => (
                            <Checkbox onChange={(e) => onStudentSelect(e, rowData.student_id)} checked={selectedStudents.includes(rowData.student_id)} />
                        )}
                        style={{ width: '50px' }}
                    />
                    <Column field="rollNumber" header="Student ID" filter filterPlaceholder="Search by ID" />
                    <Column field="name" header="Student Name" filter filterPlaceholder="Search by Name" />
                    <Column field="phone_number" header="Phone Number" filter />
                    <Column field="college_email" header="Email" filter />
                    <Column field="year_of_study" header="Year of Study" filter />

                    <Column
                        header="Department"
                        body={(rowData) => rowData.department?.dep_name ?? 'N/A'}
                        filterField="department.dep_name"
                        filter
                        filterElement={(options) => (
                            <Dropdown value={options.value} options={departmentOptions} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Select Department" showClear />
                        )}
                    />

                    <Column
                        header="School"
                        body={(rowData) => rowData.school?.school_name ?? 'N/A'}
                        filterField="school.school_name"
                        filter
                        filterElement={(options) => (
                            <Dropdown value={options.value} options={schoolOptions} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Select School" showClear />
                        )}
                    />

                    <Column
                        field="placementStatus"
                        header="Placement Status"
                        body={(rowData) => rowData.placementStatus}
                        filter
                        filterElement={(options) => (
                            <Dropdown value={options.value} options={placementStatusOptions} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Select Status" showClear />
                        )}
                    />

                    <Column
                        field="cpi_after_7th_sem"
                        header="CPI After 7th Sem"
                        filter
                        dataType="numeric"
                        filterMatchMode="between"
                        filterElement={betweenFilterTemplate}
                    />

                    <Column
                        field="no_of_backlog"
                        header="No. of Backlogs"
                        filter
                        dataType="numeric"
                        filterMatchMode="gt"
                        filterElement={numberFilterTemplate}
                    />

                    <Column
                        field="no_of_active_backlog"
                        header="No. of Active Backlogs"
                        filter
                        dataType="numeric"
                        filterMatchMode="gt"
                        filterElement={numberFilterTemplate}
                    />

                    <Column
                        field="optout"
                        header="Opt-Out Status"
                        filter
                        body={(rowData) => (rowData.optout === 1 ? "Yes" : "No")}
                        filterElement={(options) => (
                            <Dropdown value={options.value} options={optoutStatusOptions} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Select" showClear />
                        )}
                        filterMatchMode="equals"
                    />
                </DataTable>
            </>
        )}

        <h2 style={{ marginTop: '40px' }}>Delete Students from Round</h2>
        <div style={{ marginBottom: '20px' }}>
            <Dropdown
                value={selectedRoundToDelete}
                options={roundOptions}
                onChange={(e) => setSelectedRoundToDelete(e.value)}
                placeholder="Select a Round to Delete Students"
                style={{ width: '300px', marginRight: '20px' }}
            />
            <Button
                label="Delete Selected Students from Round"
                onClick={deleteStudentsFromRound}
                disabled={selectedStudentsToDelete.length === 0 || !selectedRoundToDelete}
                style={{ marginTop: '0px' }}
            />
        </div>

        {selectedRoundToDelete != null && (
            <>
                <DataTable value={filteredStudentsInRound} header={deleteTableHeader} globalFilter={globalFilterDelete} paginator rows={5} filterDisplay="menu">
                    <Column
                        header={deleteHeaderCheckbox}
                        body={(rowData) => (
                            <Checkbox onChange={(e) => onStudentDeleteSelect(e, rowData.student_id)} checked={selectedStudentsToDelete.includes(rowData.student_id)} />
                        )}
                        style={{ width: '50px' }}
                    />
                    <Column field="rollNumber" header="Student ID" filter filterPlaceholder="Search by ID" />
                    <Column field="name" header="Student Name" filter filterPlaceholder="Search by Name" />
                    <Column field="phone_number" header="Phone Number" filter />
                    <Column field="college_email" header="Email" filter />
                    <Column field="year_of_study" header="Year of Study" filter />

                    <Column
                        header="Department"
                        body={(rowData) => rowData.department?.dep_name ?? 'N/A'}
                        filterField="department.dep_name"
                        filter
                        filterElement={(options) => (
                            <Dropdown value={options.value} options={departmentOptions} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Select Department" showClear />
                        )}
                    />

                    <Column
                        header="School"
                        body={(rowData) => rowData.school?.school_name ?? 'N/A'}
                        filterField="school.school_name"
                        filter
                        filterElement={(options) => (
                            <Dropdown value={options.value} options={schoolOptions} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Select School" showClear />
                        )}
                    />

                    <Column
                        field="placementStatus"
                        header="Placement Status"
                        body={(rowData) => rowData.placementStatus}
                        filter
                        filterElement={(options) => (
                            <Dropdown value={options.value} options={placementStatusOptions} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Select Status" showClear />
                        )}
                    />

                    <Column
                        field="cpi_after_7th_sem"
                        header="CPI After 7th Sem"
                        filter
                        dataType="numeric"
                        filterMatchMode="between"
                        filterElement={betweenFilterTemplate}
                    />

                    <Column
                        field="no_of_backlog"
                        header="No. of Backlogs"
                        filter
                        dataType="numeric"
                        filterMatchMode="gt"
                        filterElement={numberFilterTemplate}
                    />

                    <Column
                        field="no_of_active_backlog"
                        header="No. of Active Backlogs"
                        filter
                        dataType="numeric"
                        filterMatchMode="gt"
                        filterElement={numberFilterTemplate}
                    />

                    <Column
                        field="optout"
                        header="Opt-Out Status"
                        filter
                        body={(rowData) => (rowData.optout === 1 ? "Yes" : "No")}
                        filterElement={(options) => (
                            <Dropdown value={options.value} options={optoutStatusOptions} onChange={(e) => options.filterApplyCallback(e.value)} placeholder="Select" showClear />
                        )}
                        filterMatchMode="equals"
                    />
                </DataTable>
            </>
        )}
    </div>
);

};
export default ManageStudents;