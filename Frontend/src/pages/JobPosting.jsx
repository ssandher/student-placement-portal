// src/pages/JobPosting.jsx
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import { InputNumber } from 'primereact/inputnumber';
import '../pages/JobPosting.css';
import axios from 'axios';

const JobPosting = () => {

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState([]);
    const [students, setStudents] = useState([]);
    const [companyData, setCompanyData] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const dataTableRef = useRef(null);
    const [selectedData, setSelectedData] = useState(null)

    const [emailData, setEmailData] = useState({
        recipients: '',
        subject: 'Job Opportunity',
        body: '',
        attachment: null,
    });

    // State for the application form
    const [applicationForm, setApplicationForm] = useState({
        companyName: '',
        gender: 'all',
        tenth_percentage: '',
        twelfth_percentage: '',
        cpi_after_7th_sem: '',
        no_of_active_backlog: '',
        year_of_study: null, // Changed to null and will be number input
        dep_id: '',
        school_id: ''
    });
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [schoolOptions, setSchoolOptions] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Start loading
            await getDepartments();
            await getSchools();
            await getData();
            setLoading(false); // End loading after all data is fetched
        };
        fetchData();
        getCompanies();
    }, []);

    useEffect(() => {
        if (students.length > 0 && departmentOptions.length > 0 && schoolOptions.length > 0) {
            const enrichedStudents = students.map(student => {
                const department = departmentOptions.find(dep => String(dep.value) === String(student.dep_id));
                const school = schoolOptions.find(sch => String(sch.value) === String(student.school_id));
                return {
                    ...student,
                    dep_name: department ? department.label : 'N/A',
                    school_name: school ? school.label : 'N/A'
                };
            });
            setFilteredStudents(enrichedStudents);
        }
    }, [students, departmentOptions, schoolOptions]);

    async function getData() {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:3000/api/student/getAllStudents", {
                headers: { Authorization: `Bearer ${token}` },
            });
            // console.log("Student API Response:", response.data);
            setStudents(response.data); // ✅ No enrichment here
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    }

    async function getCompanies() {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get(
                "http://localhost:3000/api/company/getAllCompanies",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const companyData = response.data;
            setCompanyData(companyData);
        } catch (error) {
            console.error("Error fetching companies:", error);
        }
    }

    async function getDepartments() {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:3000/api/department/getAllDepartments", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // console.log("Department API Response:", response.data);
            // Correct mapping: use dep.dep_name for label
            const departmentOptions = response.data.map(dep => ({ label: dep.dep_name, value: dep.dep_id }));
            setDepartmentOptions(departmentOptions);
            // console.log("Department Options:", departmentOptions);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    }

    async function getSchools() {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:3000/api/school/getAllSchools", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // console.log("School API Response:", response.data);
            // Correct mapping: use school.school_name for label
            const schoolOptions = response.data.map(school => ({ label: school.school_name, value: school.school_id }));
            setSchoolOptions(schoolOptions);
            // console.log("School Options:", schoolOptions);
        } catch (error) {
            console.error("Error fetching schools:", error);
        }
    }


    const handleExport = () => {
        if (dataTableRef.current) {
            dataTableRef.current.exportCSV();
        }
    };

    const handleCreateApplication = () => {
        let eligibleStudents = students.filter(student => {
            return (
                (applicationForm.gender === 'all' || (student.gender && student.gender.toLowerCase() === applicationForm.gender)) &&
                (student.tenth_percentage || 0) >= parseFloat(applicationForm.tenth_percentage || 0) &&
                (student.twelfth_percentage || 0) >= parseFloat(applicationForm.twelfth_percentage || 0) &&
                (student.cpi_after_7th_sem || 0) >= parseFloat(applicationForm.cpi_after_7th_sem || 0) &&
                (student.no_of_active_backlog !== null && student.no_of_active_backlog <= parseInt(applicationForm.no_of_active_backlog || 0)) &&
                (applicationForm.year_of_study === null || student.year_of_study === applicationForm.year_of_study) &&
                (applicationForm.dep_id === '' || student.dep_id === applicationForm.dep_id) &&
                (applicationForm.school_id === '' || student.school_id === applicationForm.school_id)
            );
        });


        eligibleStudents = eligibleStudents.map(student => {
            const department = departmentOptions.find(dep => String(dep.value) === String(student.dep_id));
            const school = schoolOptions.find(sch => String(sch.value) === String(student.school_id));
            return {
                ...student,
                dep_name: department ? department.label : 'N/A',
                school_name: school ? school.label : 'N/A'
            };
        });

        setFilteredStudents(eligibleStudents);
        setIsDialogOpen(false);

        const newFilters = [];
        if (applicationForm.gender && applicationForm.gender !== 'all') {
            newFilters.push({ type: 'gender', value: applicationForm.gender, label: `Gender: ${applicationForm.gender}` });
        }
        if (applicationForm.tenth_percentage) {
            newFilters.push({ type: 'tenth_percentage', value: applicationForm.tenth_percentage, label: `10th %: ≥${applicationForm.tenth_percentage}%` });
        }
        if (applicationForm.twelfth_percentage) {
            newFilters.push({ type: 'twelfth_percentage', value: applicationForm.twelfth_percentage, label: `12th %: ≥${applicationForm.twelfth_percentage}%` });
        }
        if (applicationForm.cpi_after_7th_sem) {
            newFilters.push({ type: 'cpi_after_7th_sem', value: applicationForm.cpi_after_7th_sem, label: `CPI: ≥${applicationForm.cpi_after_7th_sem}` });
        }
        if (applicationForm.no_of_active_backlog) {
            newFilters.push({ type: 'no_of_active_backlog', value: applicationForm.no_of_active_backlog, label: `Backlogs: ≤${applicationForm.no_of_active_backlog}` });
        }
        if (applicationForm.year_of_study !== null) {
            newFilters.push({ type: 'year_of_study', value: applicationForm.year_of_study, label: `Year of Study: ${applicationForm.year_of_study}` });
        }
        if (applicationForm.dep_id) {
            const selectedDep = departmentOptions.find(dep => dep.value === applicationForm.dep_id);
            newFilters.push({ type: 'dep_id', value: applicationForm.dep_id, label: `Department: ${selectedDep ? selectedDep.label : 'Unknown'}` });
        }
        if (applicationForm.school_id) {
            const selectedSchool = schoolOptions.find(school => school.value === applicationForm.school_id);
            newFilters.push({ type: 'school_id', value: applicationForm.school_id, label: `School: ${selectedSchool ? selectedSchool.label : 'Unknown'}` });
        }

        setActiveFilters(newFilters);
    };

    const removeFilter = (filterToRemove) => {
        const updatedFilters = activeFilters.filter(filter => filter.label !== filterToRemove.label)
        setActiveFilters(updatedFilters);
        resetForm();
        let tempApplicationForm = { ...applicationForm };
        if (filterToRemove.type === 'gender') tempApplicationForm.gender = 'all';
        if (filterToRemove.type === 'tenth_percentage') tempApplicationForm.tenth_percentage = '';
        if (filterToRemove.type === 'twelfth_percentage') tempApplicationForm.twelfth_percentage = '';
        if (filterToRemove.type === 'cpi_after_7th_sem') tempApplicationForm.cpi_after_7th_sem = '';
        if (filterToRemove.type === 'no_of_active_backlog') tempApplicationForm.no_of_active_backlog = '';
        if (filterToRemove.type === 'year_of_study') tempApplicationForm.year_of_study = null;
        if (filterToRemove.type === 'dep_id') tempApplicationForm.dep_id = '';
        if (filterToRemove.type === 'school_id') tempApplicationForm.school_id = '';
        setApplicationForm(tempApplicationForm);


        let eligibleStudents = students;
        updatedFilters.forEach(filter => {
            if (filter.type === 'gender') {
                eligibleStudents = eligibleStudents.filter(student => (filter.value === 'all' || (student.gender && student.gender.toLowerCase() === filter.value)));
            } else if (filter.type === 'tenth_percentage') {
                eligibleStudents = eligibleStudents.filter(student => (student.tenth_percentage || 0) >= parseFloat(filter.value || 0));
            } else if (filter.type === 'twelfth_percentage') {
                eligibleStudents = eligibleStudents.filter(student => (student.twelfth_percentage || 0) >= parseFloat(filter.value || 0));
            } else if (filter.type === 'cpi_after_7th_sem') {
                eligibleStudents = eligibleStudents.filter(student => (student.cpi_after_7th_sem || 0) >= parseFloat(filter.value || 0));
            } else if (filter.type === 'no_of_active_backlog') {
                eligibleStudents = eligibleStudents.filter(student => (student.no_of_active_backlog !== null && student.no_of_active_backlog <= parseInt(filter.value || 0)));
            } else if (filter.type === 'year_of_study') {
                eligibleStudents = eligibleStudents.filter(student => (student.year_of_study === filter.value));
            } else if (filter.type === 'dep_id') {
                eligibleStudents = eligibleStudents.filter(student => (student.dep_id === filter.value));
            } else if (filter.type === 'school_id') {
                eligibleStudents = eligibleStudents.filter(student => (student.school_id === filter.value));
            }
        });

        eligibleStudents = eligibleStudents.map(student => {
            const department = departmentOptions.find(dep => String(dep.value) === String(student.dep_id));
            const school = schoolOptions.find(sch => String(sch.value) === String(student.school_id));
            return {
                ...student,
                dep_name: department ? department.label : 'N/A',
                school_name: school ? school.label : 'N/A'
            };
        });
        setFilteredStudents(eligibleStudents);
    };

    const resetFilters = () => {
        getData();
        setActiveFilters([]);
        resetForm(); // Call resetForm to clear the application form
    };

    const resetForm = () => {
        setApplicationForm({
            companyName: '',
            gender: 'all',
            tenth_percentage: '',
            twelfth_percentage: '',
            cpi_after_7th_sem: '',
            no_of_active_backlog: '',
            year_of_study: null,
            dep_id: '',
            school_id: ''
        });
    };


    const handleFileUpload = (e) => {
        setEmailData({ ...emailData, attachment: e.target.files[0] });
    };

    const handleSendEmail = async () => {
        const recipients = (selectedData && selectedData.length > 0
            ? selectedData.map(student => student.college_email)
            : filteredStudents.map(student => student.college_email)
        );

        if (!recipients.length) {
            alert('No students available to send emails to.');
            return;
        }

        const emailPayload = {
            email: recipients,
            subject: emailData.subject,
            data: `<p>Dear Student,</p>

            <p>We are pleased to inform you about a job opportunity with ${applicationForm.companyName || 'our partner company'}.</p>

            <p>Please find the details below:</p>

            <p><b>Minimum Criteria:</b></p>
            <ul>
                <li><p><b>10th Percentage:</b> ${applicationForm.tenth_percentage || 'N/A'}</p></li>
                <li><p><b>12th Percentage:</b> ${applicationForm.twelfth_percentage || 'N/A'}</p></li>
                <li><p><b>CPI (7th Sem):</b> ${applicationForm.cpi_after_7th_sem || 'N/A'}</p></li>
                <li><p><b>Active Backlogs Allowed:</b> ${applicationForm.no_of_active_backlog || 'N/A'}</p></li>
                <li><p><b>Year of Study:</b> ${applicationForm.year_of_study || 'Any'}</p></li>
                <li><p><b>Department:</b> ${departmentOptions.find(dep => dep.value === applicationForm.dep_id)?.label || 'Any'}</p></li>
                <li><p><b>School:</b> ${schoolOptions.find(school => school.value === applicationForm.school_id)?.label || 'Any'}</p></li>
            </ul>

            <p>We look forward to your participation.</p>

            <p>Best Regards,</p>
            <p>CDC Placement Team, PDEU</p>`
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3000/api/send-email', emailPayload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status !== 200) {
                console.error(`Failed to send email:`, response.data.message);
                alert(`Failed to send email.`);
            } else {
                console.log(`Emails sent successfully`);
                alert('Emails sent to all recipients!');
            }
        } catch (error) {
            console.error(`Error sending email:`, error);
            alert(`An error occurred while sending the email.`);
        }
    };

    const openEmailDialog = () => {
        handleSendEmail();
    };


    return (
        <div className="job-posting-page card">
            <h2>Job Posting</h2>
            <div className="search-filter-container">
                <div className="search-input-wrapper">
                    <InputText
                        type="search"
                        placeholder="Search students..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <i className="search-icon pi pi-search"></i>
                </div>
                <Button label="Create Application" icon="pi pi-plus" className="filter-button" onClick={() => setIsDialogOpen(true)} />
            </div>
            <div className="action-buttons">
                <Button label="Send Email" icon="pi pi-envelope" onClick={openEmailDialog} />
                <Button label="Export" icon="pi pi-upload" onClick={() => handleExport()} />
                <Button label="Reset Table" icon="pi pi-refresh" onClick={resetFilters} className="p-button-secondary" />
            </div>

            {activeFilters.length > 0 && (
                <div className="applied-filters flex flex-wrap gap-2 mb-4">
                    {activeFilters.map((filter, index) => (
                        <Badge key={index} variant="secondary">
                            {filter.label}
                            <button
                                className="ml-2"
                                onClick={() => removeFilter(filter)}
                            >
                                <i className="pi pi-times"></i>
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <DataTable
                ref={dataTableRef}
                value={filteredStudents}
                paginator
                rows={10}
                dataKey='student_id'
                filters={{ 'global': { value: searchQuery, matchMode: 'contains' } }}
                globalFilterFields={['name', 'rollNumber']}
                emptyMessage="No eligible students found."
                selection={selectedData}
                onSelectionChange={(e) => setSelectedData(e.value)}
                exportFilename="Eligible_Students"
                loading={loading} // Enable loading indicator
                className="custom-datatable"
            >
                <Column selectionMode="multiple" exportable={false}></Column>
                <Column field="name" header="Name" body={(rowData) => rowData.name || 'N/A'} sortable />
                <Column field="rollNumber" header="Roll Number" sortable style={{ minWidth: '170px' }}/>
                <Column field="year_of_study" header="Year of Study" sortable style={{ minWidth: '180px' }} />
                <Column field="school_name" header="School" sortable />
                <Column field="dep_name" header="Department" sortable />
                <Column field="gender" header="Gender" sortable />
                <Column field="tenth_percentage" header="10th %" body={(rowData) => `${rowData.tenth_percentage}%`} sortable style={{ minWidth: '120px' }}/>
                <Column field="twelfth_percentage" header="12th %" body={(rowData) => `${rowData.twelfth_percentage}%`} sortable style={{ minWidth: '120px' }}/>
                <Column field="cpi_after_7th_sem" header="CPI 7th Sem" body={(rowData) => rowData.cpi_after_7th_sem} sortable style={{ minWidth: '160px' }}/>
                <Column field="no_of_active_backlog" header="Active Backlogs" sortable style={{ minWidth: '180px' }}/>
            </DataTable>

            <Dialog
                visible={isDialogOpen}
                onHide={() => setIsDialogOpen(false)}
                header="Create New Application"
                style={{ width: '700px' }}
                className="custom-dialog"
            >
                <div className="grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="companyName" className="font-bold block mb-2">Company</label>
                        <Dropdown
                            id="companyName"
                            value={applicationForm.companyName}
                            options={companyData.map(company => ({ label: company.company_name, value: company.company_id }))}
                            onChange={(e) => setApplicationForm({
                                ...applicationForm,
                                companyName: e.value
                            })}
                            placeholder="Select Company"
                            className="w-full"
                            showClear
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="gender" className="font-bold block mb-2">Gender</label>
                        <Dropdown
                            id="gender"
                            value={applicationForm.gender}
                            options={[
                                { label: 'Male', value: 'male' },
                                { label: 'Female', value: 'female' },
                                { label: 'All', value: 'all' }
                            ]}
                            onChange={(e) => setApplicationForm({
                                ...applicationForm,
                                gender: e.value
                            })}
                            placeholder="Select Gender"
                            className="w-full"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="year_of_study" className="font-bold block mb-2">Year of Study</label>
                        <InputNumber
                            id="year_of_study"
                            value={applicationForm.year_of_study}
                            onValueChange={(e) => setApplicationForm({ ...applicationForm, year_of_study: e.value })}
                            placeholder="Enter Year"
                            className="w-full custom-input"
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={0}
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="school_id" className="font-bold block mb-2">School</label>
                        <Dropdown
                            id="school_id"
                            value={applicationForm.school_id}
                            options={schoolOptions}
                            onChange={(e) => setApplicationForm({
                                ...applicationForm,
                                school_id: e.value
                            })}
                            placeholder="Select School"
                            className="w-full"
                            showClear
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="dep_id" className="font-bold block mb-2">Department</label>
                        <Dropdown
                            id="dep_id"
                            value={applicationForm.dep_id}
                            options={departmentOptions}
                            onChange={(e) => setApplicationForm({
                                ...applicationForm,
                                dep_id: e.value
                            })}
                            placeholder="Select Department"
                            className="w-full"
                            showClear
                        />
                    </div>


                    <div className="field col-12 md:col-6">
                        <label htmlFor="tenth_percentage" className="font-bold block mb-2">10th Percentage</label>
                        <InputNumber
                            id="tenth_percentage"
                            value={applicationForm.tenth_percentage}
                            onValueChange={(e) => setApplicationForm({
                                ...applicationForm,
                                tenth_percentage: e.value
                            })}
                            mode="decimal"
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            suffix="%"
                            className="w-full custom-input"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="twelfth_percentage" className="font-bold block mb-2">12th Percentage</label>
                        <InputNumber
                            id="twelfth_percentage"
                            value={applicationForm.twelfth_percentage}
                            onValueChange={(e) => setApplicationForm({
                                ...applicationForm,
                                twelfth_percentage: e.value
                            })}
                            mode="decimal"
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            suffix="%"
                            className="w-full custom-input"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="cpi_after_7th_sem" className="font-bold block mb-2">Minimum CPI</label>
                        <InputNumber
                            id="cpi_after_7th_sem"
                            value={applicationForm.cpi_after_7th_sem}
                            onValueChange={(e) => setApplicationForm({
                                ...applicationForm,
                                cpi_after_7th_sem: e.value
                            })}
                            mode="decimal"
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            className="w-full custom-input"
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="no_of_active_backlog" className="font-bold block mb-2">Number of Backlogs</label>
                        <InputNumber
                            id="no_of_active_backlog"
                            value={applicationForm.no_of_active_backlog}
                            onValueChange={(e) => setApplicationForm({
                                ...applicationForm,
                                no_of_active_backlog: e.value
                            })}
                            mode="decimal"
                            minFractionDigits={0}
                            maxFractionDigits={0}
                            className="w-full custom-input"
                        />
                    </div>
                </div>
                <div className="button-container flex flex-row flex-end" style={{ width: '100%', borderTop: 'solid 1px grey', alignContent: 'end', marginTop: '2rem' }}>
                    <Button label="Cancel" icon="pi pi-times" onClick={() => resetFilters()} outlined className="p-button-danger custom-button" />
                    <Button label="Create" outlined icon="pi pi-check" onClick={handleCreateApplication} className="custom-button" autoFocus />
                </div>
            </Dialog>

        </div>
    );
};

export default JobPosting;