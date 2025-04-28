import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Tag } from "primereact/tag";
import { Checkbox } from "primereact/checkbox";
import "./Students.css"; // Import custom CSS

const genderOptions = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
];

const categoryOptions = [
    { label: "General", value: "General" },
    { label: "OBC", value: "OBC" },
    { label: "SC", value: "SC" },
    { label: "ST", value: "ST" },
];

const remarks = [
    { label: "Opting out of future studies", value: "Opting out of future studies" },
    { label: "Choosing to join the family business", value: "Choosing to join the family business" },
    { label: "Sitting for placement interviews", value: "Sitting for placement interviews" },
    { label: "Others", value: "Others" },
];

const optoutOptions = [
    { label: "No", value: 0 },
    { label: "Yes", value: 1 },
];

const Students = () => {
    const emptyStudent = {};
    const [students, setStudents] = useState([]);
    const [departments,setDepartments] = useState([])
    const [schools,setSchools] = useState([])
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [originalStudents, setOriginalStudents] = useState([]);
    const [studentDialog, setStudentDialog] = useState(false);
    const [updateDialog, updateStudentDialog] = useState(false);
    const [deleteStudentDialog, setDeleteStudentDialog] = useState(false);
    const [deleteStudentsDialog, setDeleteStudentsDialog] = useState(false);
    const [student, setStudent] = useState(emptyStudent);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");
    const toast = useRef(null);
    const dt = useRef(null);
    const tableContainer = useRef(null);
    const [filterDialog, setFilterDialog] = useState(false);
    const [filters, setFilters] = useState({
        name: "",
        rollNumber: "",
        gender: null,
        category: null,
        city: "",
        state: "",
        minCPI: null,
        maxCPI: null,
        optout: null, // Changed initial value to null
    });

    const [searchValue, setSearchValue] = useState('');

    async function getData() {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            "http://localhost:3000/api/student/getAllStudents",
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
                },
            }
        );
        const studentData = response.data;
        setStudents(studentData);
        setOriginalStudents(studentData); // Store original data
    }

    async function getDepartments() {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            "http://localhost:3000/api/department/getAllDepartments",
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
                },
            }
        );
        setDepartments( response.data)
    }

    async function getSchools() {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            "http://localhost:3000/api/school/getAllSchools",
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
                },
            }
        );
        setSchools( response.data)
    }

    useEffect(() => {
        getData();
        getDepartments();
        getSchools();
    }, []);

    const applyFilters = () => {
        let filteredStudents = originalStudents.filter((student) => {
            // Use originalStudents for filtering
            return (
                (filters.name
                    ? student.name.toLowerCase().includes(filters.name.toLowerCase())
                    : true) &&
                (filters.rollNumber
                    ? student.rollNumber.includes(filters.rollNumber)
                    : true) &&
                (filters.gender ? student.gender === filters.gender : true) &&
                (filters.category ? student.category === filters.category : true) &&
                (filters.city
                    ? student.city.toLowerCase().includes(filters.city.toLowerCase())
                    : true) &&
                (filters.state
                    ? student.state.toLowerCase().includes(filters.state.toLowerCase())
                    : true) &&
                (filters.minCPI ? student.cpi_after_8th_sem >= filters.minCPI : true) &&
                (filters.maxCPI ? student.cpi_after_8th_sem <= filters.maxCPI : true) &&
                (filters.optout !== null ? student.optout === filters.optout : true) // Adjusted filter logic for optout
            );
        });
        setStudents(filteredStudents);
        setFilterDialog(false);
    };

    const resetFilters = () => {
        setFilters({
            name: "",
            rollNumber: "",
            gender: null,
            category: null,
            city: "",
            state: "",
            minCPI: null,
            maxCPI: null,
            optout: null, // Reset optout filter
        });
        setStudents(originalStudents); // Reset to original data
        setFilterDialog(false);
    };

    const saveStudent = async () => {
        setSubmitted(true);
        if (!student.name.trim() || !student.rollNumber.trim()) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Name and Roll Number are required.",
                life: 3000,
            });
            return;
        }

        if (!student.school_id || !student.dep_id) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "School and Department are required.",
                life: 3000,
            });
            return;
        }

        if (
            student.tenth_percentage &&
            (student.tenth_percentage < 0 || student.tenth_percentage > 100)
        ) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "10th Percentage must be between 0 and 100.",
                life: 3000,
            });
            return;
        }

        let _students = [...students];
        let _student = { ...student };

        // Check if roll number already exists
        let data = _students.filter((x) => _student.rollNumber === x.rollNumber && _student.id !== x.id);

        if (data.length > 0) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Student with this roll number already exists.",
                life: 3000,
            });
            return;
        }

        const token = localStorage.getItem("token");

        try {
            if (student.student_id) {
                // Update existing student
                const response = await axios.put(
                    `http://localhost:3000/api/student/updateStudentById/${student.student_id}`,
                    {
                        name: student.name,
                        rollNumber: student.rollNumber,
                        school_id: student.school_id,
                        dep_id: student.dep_id,
                        year_of_study: student.year_of_study,
                        personal_email: student.personal_email,
                        college_email: student.college_email,
                        phone_number: student.phone_number,
                        date_of_birth: student.date_of_birth,
                        gender: student.gender,
                        city: student.city,
                        state: student.state,
                        tenth_percentage: student.tenth_percentage,
                        twelfth_percentage: student.twelfth_percentage,
                        diploma_percentage: student.diploma_percentage,
                        cpi_after_7th_sem: student.cpi_after_7th_sem,
                        cpi_after_8th_sem: student.cpi_after_8th_sem,
                        remark: student.remark,
                        category: student.category,
                        no_of_backlog: student.no_of_backlog,
                        no_of_active_backlog: student.no_of_active_backlog,
                        optout: student.optout, // Sending optout value
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Student updated successfully.",
                    life: 3000,
                });
            } else {
                // Insert new student
                const response = await axios.post(
                    "http://localhost:3000/api/student/insertStudent",
                    {
                        name: student.name,
                        rollNumber: student.rollNumber,
                        school_id: student.school_id,
                        dep_id: student.dep_id,
                        year_of_study: student.year_of_study,
                        personal_email: student.personal_email,
                        college_email: student.college_email,
                        phone_number: student.phone_number,
                        date_of_birth: student.date_of_birth,
                        gender: student.gender,
                        city: student.city,
                        state: student.state,
                        tenth_percentage: student.tenth_percentage,
                        twelfth_percentage: student.twelfth_percentage,
                        diploma_percentage: student.diploma_percentage,
                        cpi_after_7th_sem: student.cpi_after_7th_sem,
                        cpi_after_8th_sem: student.cpi_after_8th_sem,
                        remark: student.remark,
                        category: student.category,
                        no_of_backlog: student.no_of_backlog,
                        no_of_active_backlog: student.no_of_active_backlog,
                        optout: student.optout, // Sending optout value
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.current.show({
                    severity: "success",
                    summary: "Success",
                    detail: "Student added successfully.",
                    life: 3000,
                });
            }

            getData(); // Refresh student list
            setSelectedSchool(null);
            setSelectedDepartment(null);
            setStudent(emptyStudent);
            setStudentDialog(false);

        updateStudentDialog(false);
        } catch (error) {
            console.error("Error saving/updating student:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to save student.",
                life: 3000,
            });
        }
    };

    const confirmDeleteStudent = (student) => {
        setStudent(student);
        setDeleteStudentDialog(true);
    };

    const deleteStudent = async () => {
    try {

        const token = await localStorage.getItem("token");
        const response = await axios.delete(`http://localhost:3000/api/student/deleteStudentById/${student.student_id}`,{
            headers: {
                Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
            },
        });
        if (response.status === 200) {
            // If the deletion is successful, update the UI
            let _students = students.filter(
                (val) => val.student_id !== student.student_id
            );
            setStudents(_students);
            setDeleteStudentDialog(false);
            setStudent(emptyStudent);
            toast.current.show({
                severity: "success",
                summary: "Successful",
                detail: "Student Deleted",
                life: 3000,
            });
        } else {
            // Handle error response
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete student",
                life: 3000,
            });
        }
    } catch (error) {
        // Handle error during API call
        console.error("Error deleting student:", error);
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete student",
            life: 3000,
        });
    }
};

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteStudentsDialog(true);
    };

const deleteSelectedStudents = async () => {
    try {

        const token = await localStorage.getItem("token");
        for (const student of selectedStudents) {
            const response = await axios.delete(`http://localhost:3000/api/student/deleteStudentById/${student.student_id}`,{
                headers: {
                    Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
                },
            });

            if (response.status !== 200) {
                // Handle error response
                console.error(`Error deleting student ${student.name}:`, response.data);
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: `Failed to delete student ${student.name}`,
                    life: 3000,
                });
                continue;
            }
        }

        // After all successful deletions, update the UI
        getData()
        setDeleteStudentsDialog(false);
        setSelectedStudents([]);

        toast.current.show({
            severity: "success",
            summary: "Successful",
            detail: "Students Deleted",
            life: 3000,
        });
    } catch (error) {
        console.error("Error deleting students:", error);
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete students",
            life: 3000,
        });
    }
};

    const onInputChange = (e, name) => {
        let val = e.target.type === "checkbox" ? e.target.checked : e.target.value;

        if (name === 'date_of_birth' && e.value instanceof Date) {
            const formattedDate = e.value.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
            val = formattedDate; // Format date to YYYY-MM-DD
        }
        if (name === 'optout') { // Handle optout dropdown value
            val = parseInt(e.target.value, 10); // Parse to integer (0 or 1)
        }
        setStudent((prevStudent) => ({ ...prevStudent, [name]: val }));
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value;
        setStudent((prevStudent) => ({ ...prevStudent, [name]: val }));
    };

    const openNew = () => {
        setStudent(emptyStudent);
        setSubmitted(false);
        setStudentDialog(true);
    };

    const hideDialog = () => {
        setSelectedSchool(null)
        setSelectedDepartment(null)
        setSubmitted(false);
        setStudentDialog(false);
    };

    const hideUpdateDialog = () => {
        setSelectedSchool(null)
        setSelectedDepartment(null)
        setSubmitted(false);
        updateStudentDialog(false);
    };

    const hideDeleteStudentDialog = () => {
        setDeleteStudentDialog(false);
    };

    const hideDeleteStudentsDialog = () => {
        setDeleteStudentsDialog(false);
    };

    const filterDialogFooter = (
        <>
            <Button label="Apply" icon="pi pi-check" onClick={applyFilters} />
            <Button
                label="Reset"
                icon="pi pi-times"
                onClick={resetFilters}
                className="p-button-secondary"
            />
        </>
    );

    const leftToolbarTemplate = () => {
        return (
            <>
                <Button
                    label="New"
                    icon="pi pi-plus"
                    className="p-button-success mr-2"
                    onClick={openNew}
                />
                <Button
                    label="Delete"
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={confirmDeleteSelected}
                    disabled={!selectedStudents.length}
                />
                <Button
                    label="Export"
                    icon="pi pi-upload"
                    className="p-button-help"
                    onClick={exportCSV}
                />
            </>
        );
    };

    const dobBodyTemplate = (rowData) => {
        if (rowData.date_of_birth) {
            const date = new Date(rowData.date_of_birth);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return 'N/A'; // Or handle null date as needed
    };

    const percentageBodyTemplate = (rowData, field) => {
        return `${rowData[field]}%`;
    };

    const optoutBodyTemplate = (rowData) => {
        return (
            <Tag
                value={rowData.optout === 1 ? "Opted Out" : "Available"} // Updated display logic
                severity={rowData.optout === 1 ? "danger" : "success"} // Updated display logic
            />
        );
    };

    // Use useMemo for efficient lookups
    const schoolMap = useMemo(() =>
        schools.reduce((acc, school) => {
            acc[school.school_id] = school.school_name;
            return acc;
        }, {}), [schools]);

    const departmentMap = useMemo(() =>
        departments.reduce((acc, dept) => {
            acc[dept.dep_id] = dept.dep_name;
            return acc;
        }, {}), [departments]);

    const schoolBodyTemplate = (rowData) => {
        return schoolMap[rowData.school_id] || 'N/A'; // Fallback if ID not found
    };

    const departmentBodyTemplate = (rowData) => {
        return departmentMap[rowData.dep_id] || 'N/A'; // Fallback if ID not found
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-success mr-2"
                    onClick={() => editStudent(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-warning"
                    onClick={() => confirmDeleteStudent(rowData)}
                />
            </>
        );
    };

    const editStudent = (student) => {
        setStudent({ ...student });

        setSelectedSchool(student.school_id);
        setAvailableDepartments(departments.filter(dep => dep.school_id === student.school_id));
        setSelectedDepartment(student.dep_id);
        setStudent((prevStudent) => ({ ...prevStudent, ['school_id']: student.school_id }));
        setStudent((prevStudent) => ({ ...prevStudent, ['dep_id']: student.dep_id }));
        updateStudentDialog(true);

    };

    const onSchoolChange = (e) => {
        const schoolId = parseInt(e.target.value, 10);
        setSelectedSchool(schoolId);
        setAvailableDepartments(departments.filter(dep => dep.school_id === schoolId));
        setSelectedDepartment(null);
        const val = e.target.value;
        setStudent((prevStudent) => ({ ...prevStudent, ['school_id']: val }));
    };

    const onDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
        // console.log(e.target.value);
        const val = e.target.value;
        setStudent((prevStudent) => ({ ...prevStudent, ['dep_id']: val }));
    };

    const studentDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                className="p-button-text"
                onClick={saveStudent}
            />
        </>
    );

    const updateDialogFooter = (
        <>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideUpdateDialog}
            />
            <Button
                label="Update"
                icon="pi pi-check"
                className="p-button-text"
                onClick={saveStudent}
            />
        </>
    );

    const deleteStudentDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-outlined"
                onClick={hideDeleteStudentDialog}
            />

            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-outlined p-button-danger"
                onClick={deleteStudent}
            />
        </>
    );

    const deleteStudentsDialogFooter = (
        <>
            <Button
                label="No"
                icon="pi pi-times"
                className="p-button-outlined"
                onClick={hideDeleteStudentsDialog}
            />
            <Button
                label="Yes"
                icon="pi pi-check"
                className="p-button-outlined p-button-danger"
                onClick={deleteSelectedStudents}
            />
        </>
    );

    const clearSearch = () => {
        setSearchValue('');
        setGlobalFilter('');
    };

    const header = (
        <div className="table-header">
            <div className="actions-search-container">
                <div className="action-buttons">
                    <Button label="Add New Student" icon="pi pi-plus" className="p-button-outlined p-button-success header-button" onClick={openNew} />
                    <Button label="Delete Selected" icon="pi pi-trash" className="p-button-outlined p-button-danger header-button" onClick={confirmDeleteSelected} disabled={!selectedStudents.length} />
                    <Button label="Export CSV" icon="pi pi-upload" className="p-button-outlined p-button-help header-button" onClick={exportCSV} />
                </div>
                <div className="search-filter-container">
                    <div className="search-input-wrapper">
                        <InputText
                            value={searchValue}
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                                setGlobalFilter(e.target.value);
                            }}
                            placeholder="Search students..."
                            className="search-input"
                        />
                        <i className="search-icon pi pi-search"></i>
                    </div>
                    <Button label="Filter" icon="pi pi-filter" className="p-button-outlined p-button-secondary header-button" onClick={() => setFilterDialog(true)} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="students-page">
            <Toast ref={toast} />
            <div className="card">
            <h2 className="manage-students-header">Manage Students</h2>
                {header}
                <div className="table-container">
                    <DataTable
                        ref={dt}
                        value={students}
                        selection={selectedStudents}
                        onSelectionChange={(e) => setSelectedStudents(e.value)}
                        dataKey="student_id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} students"
                        globalFilter={globalFilter}
                        responsiveLayout="scroll"
                        emptyMessage="No students found."
                        className="p-datatable-sm" // Add this class for similar styling
                        scrollable
                        scrollHeight="400px" // Adjusted to match Reports.jsx
                        stripedRows // Add this property for striped rows
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                        <Column field="name" header="Name" style={{ minWidth: '150px' }} />
                        <Column field="rollNumber" header="Roll Number" style={{ minWidth: '120px' }} />
                        <Column field="personal_email" header="Personal Email" style={{ minWidth: '200px' }} />
                        <Column field="college_email" header="College Email" style={{ minWidth: '200px' }} />
                        <Column field="phone_number" header="Phone Number" style={{ minWidth: '150px' }} />
                        <Column field="school_id" header="School" body={schoolBodyTemplate} style={{ minWidth: '150px' }} />
                        <Column field="dep_id" header="Department" body={departmentBodyTemplate} style={{ minWidth: '150px' }} />
                        <Column field="year_of_study" header="Year of Study" body={(rowData) => rowData.year_of_study} style={{ minWidth: '130px' }} />
                        <Column field="date_of_birth" header="Date of Birth" body={dobBodyTemplate} style={{ minWidth: '120px' }} />
                        <Column field="gender" header="Gender" body={(rowData) => rowData.gender} style={{ minWidth: '100px' }} />
                        <Column field="city" header="City" style={{ minWidth: '120px' }} />
                        <Column field="state" header="State" style={{ minWidth: '120px' }} />
                        <Column field="tenth_percentage" header="10th Percentage" body={(rowData) => percentageBodyTemplate(rowData, 'tenth_percentage')} style={{ minWidth: '130px' }} />
                        <Column field="twelfth_percentage" header="12th Percentage" body={(rowData) => percentageBodyTemplate(rowData, 'twelfth_percentage')} style={{ minWidth: '130px' }} />
                        {/* <Column field="cpi_after_7th_sem" header="CPI after 7th Sem" body={(rowData) => percentageBodyTemplate(rowData, 'cpi_after_7th_sem')} style={{ minWidth: '150px' }} /> */}
                        <Column field="cpi_after_7th_sem" header="CPI after 7th Sem" style={{ minWidth: '150px' }} />
                        {/* <Column field="cpi_after_8th_sem" header="Final CPI after 8th Sem" body={(rowData) => percentageBodyTemplate(rowData, 'cpi_after_8th_sem')} style={{ minWidth: '150px' }} /> */}
                        {/* <Column field="cpi_after_8th_sem" header="Final CPI after 8th Sem" style={{ minWidth: '150px' }} />
                        <Column field="category" header="Category" body={(rowData) => rowData.category} style={{ minWidth: '120px' }} /> */}
                        <Column field="no_of_backlog" header="No of Backlogs" body={(rowData) => rowData.no_of_backlog} style={{ minWidth: '130px' }} />
                        <Column field="no_of_active_backlog" header="No of Active Backlogs" body={(rowData) => rowData.no_of_active_backlog} style={{ minWidth: '160px' }} />
                        <Column field="remark" header="Remark" style={{ minWidth: '150px' }} />
                        <Column field="optout" header="Optout" body={optoutBodyTemplate} style={{ minWidth: '100px' }} />
                        <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '120px' }} />
                    </DataTable>
                </div>
            </div>
            <Dialog visible={studentDialog} style={{ width: '40vw' }} header="Student Details" modal footer={studentDialogFooter} onHide={hideDialog}>
                <div className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="name">Name</label>
                        <InputText
                            id="name"
                            value={student.name}
                            onChange={(e) => onInputChange(e, "name")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="rollNumber">Roll Number</label>
                        <InputText
                            id="rollNumber"
                            value={student.rollNumber}
                            onChange={(e) => onInputChange(e, "rollNumber")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="personal_email">Personal Email</label>
                        <InputText
                            id="personal_email"
                            value={student.personal_email}
                            onChange={(e) => onInputChange(e, "personal_email")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="college_email">College Email</label>
                        <InputText
                            id="college_email"
                            value={student.college_email}
                            onChange={(e) => onInputChange(e, "college_email")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="phone_number">Phone Number</label>
                        <InputText
                            id="phone_number"
                            value={student.phone_number}
                            onChange={(e) => onInputChange(e, "phone_number")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="school">School</label>
                        <Dropdown
                            id="school"
                            value={selectedSchool}
                            options={schools.map(school => ({ label: school.school_name, value: school.school_id }))}
                            onChange={(e) => onSchoolChange(e)}
                            placeholder="Select School"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="department">Department</label>
                        <Dropdown
                            id="department"
                            value={selectedDepartment}
                            options={availableDepartments.map(dep => ({ label: dep.dep_name, value: dep.dep_id }))}
                            onChange={(e) => onDepartmentChange(e)}
                            placeholder="Select Department"
                            disabled={!selectedSchool} // Disable until a school is selected
                        />
                    </div>
		    <div className="p-field">
                        <label htmlFor="year_of_study">Year of Study</label>
                        <InputNumber
                            id="year_of_study"
                            value={student.year_of_study}
                            onValueChange={(e) => onInputNumberChange(e, "year_of_study")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="date_of_birth">Date of Birth</label>
                        <Calendar
                            id="date_of_birth"
                            value={student.date_of_birth ? new Date(student.date_of_birth) : null}
                            onChange={(e) => onInputChange(e, "date_of_birth")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="gender">Gender</label>
                        <Dropdown
                            id="gender"
                            value={student.gender}
                            options={genderOptions}
                            onChange={(e) => onInputChange(e, "gender")}
                            placeholder="Select Gender"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="city">City</label>
                        <InputText
                            id="city"
                            value={student.city}
                            onChange={(e) => onInputChange(e, "city")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="state">State</label>
                        <InputText
                            id="state"
                            value={student.state}
                            onChange={(e) => onInputChange(e, "state")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="tenth_percentage">10th Percentage</label>
                        <InputNumber

maxFractionDigits={2}
                            id="tenth_percentage"
                            value={student.tenth_percentage}
                            onValueChange={(e) => onInputNumberChange(e, "tenth_percentage")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="twelfth_percentage">12th Percentage</label>
                        <InputNumber
                        maxFractionDigits={2}
                            id="twelfth_percentage"
                            value={student.twelfth_percentage}
                            onValueChange={(e) =>
                                onInputNumberChange(e, "twelfth_percentage")
                            }
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="cpi_after_7th_sem">CPI after 7th Sem</label>
                        <InputNumber
                        maxFractionDigits={2}
                            id="cpi_after_7th_sem"
                            value={student.cpi_after_7th_sem}
                            onValueChange={(e) => onInputNumberChange(e, "cpi_after_7th_sem")}
                        />
                    </div>
                    {/* <div className="p-field">
                        <label htmlFor="cpi_after_8th_sem">Final CPI after 8th Sem</label>
                        <InputNumber
                        maxFractionDigits={2}
                            id="cpi_after_8th_sem"
                            value={student.cpi_after_8th_sem}
                            onValueChange={(e) => onInputNumberChange(e, "cpi_after_8th_sem")}
                        />
                    </div> */}
                    <div className="p-field">
                        <label htmlFor="category">Category</label>
                        <Dropdown
                            id="category"
                            value={student.category}
                            options={categoryOptions}
                            onChange={(e) => onInputChange(e, "category")}
                            placeholder="Select Category"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="no_of_backlog">No of Backlogs</label>
                        <InputNumber
                            id="no_of_backlog"
                            value={student.no_of_backlog}
                            onValueChange={(e) => onInputNumberChange(e, "no_of_backlog")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="no_of_active_backlog">No of Active Backlogs</label>
                        <InputNumber
                            id="no_of_active_backlog"
                            value={student.no_of_active_backlog}
                            onValueChange={(e) =>
                                onInputNumberChange(e, "no_of_active_backlog")
                            }
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="remark">Remark</label>
                        <Dropdown
                            id="remark"
                            value={student.remark}
                            options={remarks}
                            onChange={(e) => onInputChange(e, "remark")}
                            placeholder="Select Remark"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="optout">Optout</label>
                        <Dropdown
                            id="optout"
                            value={student.optout}
                            options={optoutOptions} // Use optoutOptions here
                            onChange={(e) => onInputChange(e, "optout")}
                            placeholder="Select Optout Status"
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog visible={updateDialog} style={{ width: '40vw' }} header="Student Details" modal footer={updateDialogFooter} onHide={hideUpdateDialog}>
                <div className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="name">Name</label>
                        <InputText
                            id="name"
                            value={student.name}
                            onChange={(e) => onInputChange(e, "name")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="rollNumber">Roll Number</label>
                        <InputText
                            id="rollNumber"
                            value={student.rollNumber}
                            onChange={(e) => onInputChange(e, "rollNumber")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="personal_email">Personal Email</label>
                        <InputText
                            id="personal_email"
                            value={student.personal_email}
                            onChange={(e) => onInputChange(e, "personal_email")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="college_email">College Email</label>
                        <InputText
                            id="college_email"
                            value={student.college_email}
                            onChange={(e) => onInputChange(e, "college_email")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="phone_number">Phone Number</label>
                        <InputText
                            id="phone_number"
                            value={student.phone_number}
                            onChange={(e) => onInputChange(e, "phone_number")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="school">School</label>
                        <Dropdown
                            id="school"
                            value={selectedSchool}
                            options={schools.map(school => ({ label: school.school_name, value: school.school_id }))}
                            onChange={(e) => onSchoolChange(e)}
                            placeholder="Select School"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="department">Department</label>
                        <Dropdown
                            id="department"
                            value={selectedDepartment}
                            options={availableDepartments.map(dep => ({ label: dep.dep_name, value: dep.dep_id }))}
                            onChange={(e) => onDepartmentChange(e)}
                            placeholder="Select Department"
                            disabled={!selectedSchool} // Disable until a school is selected
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="year_of_study">Year of Study</label>
                        <InputNumber
                            id="year_of_study"
                            value={student.year_of_study}
                            onValueChange={(e) => onInputNumberChange(e, "year_of_study")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="date_of_birth">Date of Birth</label>
                        <Calendar
                            id="date_of_birth"
                            value={student.date_of_birth ? new Date(student.date_of_birth) : null}
                            onChange={(e) => onInputChange(e, "date_of_birth")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="gender">Gender</label>
                        <Dropdown
                            id="gender"
                            value={student.gender}
                            options={genderOptions}
                            onChange={(e) => onInputChange(e, "gender")}
                            placeholder="Select Gender"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="city">City</label>
                        <InputText
                            id="city"
                            value={student.city}
                            onChange={(e) => onInputChange(e, "city")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="state">State</label>
                        <InputText
                            id="state"
                            value={student.state}
                            onChange={(e) => onInputChange(e, "state")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="tenth_percentage">10th Percentage</label>
                        <InputNumber
maxFractionDigits={2}
                            id="tenth_percentage"
                            value={student.tenth_percentage}
                            onValueChange={(e) => onInputNumberChange(e, "tenth_percentage")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="twelfth_percentage">12th Percentage</label>
                        <InputNumber
                        maxFractionDigits={2}
                            id="twelfth_percentage"
                            value={student.twelfth_percentage}
                            onValueChange={(e) =>
                                onInputNumberChange(e, "twelfth_percentage")
                            }
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="cpi_after_7th_sem">CPI after 7th Sem</label>
                        <InputNumber
                        maxFractionDigits={2}
                            id="cpi_after_7th_sem"
                            value={student.cpi_after_7th_sem}
                            onValueChange={(e) => onInputNumberChange(e, "cpi_after_7th_sem")}
                        />
                    </div>
                    {/* <div className="p-field">
                        <label htmlFor="cpi_after_8th_sem">Final CPI after 8th Sem</label>
                        <InputNumber
                        maxFractionDigits={2}
                            id="cpi_after_8th_sem"
                            value={student.cpi_after_8th_sem}
                            onValueChange={(e) => onInputNumberChange(e, "cpi_after_8th_sem")}
                        />
                    </div> */}
                    <div className="p-field">
                        <label htmlFor="category">Category</label>
                        <Dropdown
                            id="category"
                            value={student.category}
                            options={categoryOptions}
                            onChange={(e) => onInputChange(e, "category")}
                            placeholder="Select Category"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="no_of_backlog">No of Backlogs</label>
                        <InputNumber
                            id="no_of_backlog"
                            value={student.no_of_backlog}
                            onValueChange={(e) => onInputNumberChange(e, "no_of_backlog")}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="no_of_active_backlog">No of Active Backlogs</label>
                        <InputNumber
                            id="no_of_active_backlog"
                            value={student.no_of_active_backlog}
                            onValueChange={(e) =>
                                onInputNumberChange(e, "no_of_active_backlog")
                            }
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="remark">Remark</label>
                        <Dropdown
                            id="remark"
                            value={student.remark}
                            options={remarks}
                            onChange={(e) => onInputChange(e, "remark")}
                            placeholder="Select Remark"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="optout">Optout</label>
                        <Dropdown
                            id="optout"
                            value={student.optout}
                            options={optoutOptions} // Use optoutOptions here
                            onChange={(e) => onInputChange(e, "optout")}
                            placeholder="Select Optout Status"
                        />
                    </div>
                </div>
            </Dialog>
            <Dialog
                visible={deleteStudentDialog}
                style={{ width: "450px" }}
                header="Confirm"
                modal
                footer={deleteStudentDialogFooter}
                onHide={hideDeleteStudentDialog}
            >
                <div className="flex align-items-center justify-content-center">
                    <i
                        className="pi pi-exclamation-triangle mr-3"
                        style={{ fontSize: "2rem" }}
                    />
                    {student && (
                        <span>
                            Are you sure you want to delete <b>{student.name}</b>?
                        </span>
                    )}
                </div>
            </Dialog>
            <Dialog
                visible={deleteStudentsDialog}
                style={{ width: "450px" }}
                header="Confirm"
                modal
                footer={deleteStudentsDialogFooter}
                onHide={hideDeleteStudentsDialog}
            >
                <div className="flex align-items-center justify-content-center">
                    <i
                        className="pi pi-exclamation-triangle mr-3"
                        style={{ fontSize: "2rem" }}
                    />
                    {selectedStudents.length > 0 && (
                        <span>Are you sure you want to delete the selected students?</span>
                    )}
                </div>
            </Dialog>
            <Dialog
                header="Filter Students"
                visible={filterDialog}
                style={{ width: "30vw" }}
                onHide={() => setFilterDialog(false)}
                footer={filterDialogFooter}
            >
                <div className="p-fluid">
                    <div className="p-field">
                        <label htmlFor="name">Name</label>
                        <InputText
                            id="name"
                            value={filters.name}
                            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="rollNumber">Roll Number</label>
                        <InputText
                            id="rollNumber"
                            value={filters.rollNumber}
                            onChange={(e) =>
                                setFilters({ ...filters, rollNumber: e.target.value })
                            }
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="gender">Gender</label>
                        <Dropdown
                            id="gender"
                            value={filters.gender}
                            options={genderOptions}
                            onChange={(e) => setFilters({ ...filters, gender: e.value })}
                            placeholder="Select Gender"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="category">Category</label>
                        <Dropdown
                            id="category"
                            value={filters.category}
                            options={categoryOptions}
                            onChange={(e) => setFilters({ ...filters, category: e.value })}
                            placeholder="Select Category"
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="city">City</label>
                        <InputText
                            id="city"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="state">State</label>
                        <InputText
                            id="state"
                            value={filters.state}
                            onChange={(e) =>
                                setFilters({ ...filters, state: e.target.value })
                            }
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="minCPI">Minimum CPI</label>
                        <InputNumber
                            id="minCPI"
                            value={filters.minCPI}
                            onValueChange={(e) => setFilters({ ...filters, minCPI: e.value })}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="maxCPI">Maximum CPI</label>
                        <InputNumber
                            id="maxCPI"
                            value={filters.maxCPI}
                            onValueChange={(e) => setFilters({ ...filters, maxCPI: e.value })}
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="optout">Optout</label>
                        <Dropdown
                            id="optout"
                            value={filters.optout}
                            options={optoutOptions} // Use optoutOptions here
                            onChange={(e) => setFilters({ ...filters, optout: e.value })} // Update filter with dropdown value
                            placeholder="Select Optout Status"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Students;