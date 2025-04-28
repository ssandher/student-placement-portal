import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Companies.css';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import classNames from 'classnames';

const Companies = () => {
    const emptyCompany = {
        company_id: null,
        company_name: '',
        email: '',
        phone_number: '',
        no_of_student_placed: 0
    };

    const [originalCompanies, setOriginalCompanies] = useState([]); // original data
    const [companies, setCompanies] = useState([]);
    const [companyDialog, setCompanyDialog] = useState(false);
    const [filterDialog, setFilterDialog] = useState(false);
    const [filter, setFilter] = useState({
        company_name: '',
        email: '',
        phone_number: '',
        no_of_student_placed: null
    }); // Filter criteria state

    const [deleteCompanyDialog, setDeleteCompanyDialog] = useState(false);
    const [deleteCompaniesDialog, setDeleteCompaniesDialog] = useState(false);
    const [company, setCompany] = useState(emptyCompany);
    const [selectedCompanies, setSelectedCompanies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        getCompanies();
    }, []);

    async function getCompanies() {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            "http://localhost:3000/api/company/getAllCompanies",
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
                },
            }
        )
        const companyData = response.data;
        setCompanies(companyData);
        setOriginalCompanies(companyData); // storing original data
    }

    // 'View Details' navigation 
    const handleViewDetails = (companyId, companyName) => {
        navigate(`/companies/${companyId}/MainCompany?companyName=${encodeURIComponent(companyName)}`);
    };


    // Dialog control methods
    const openNew = () => {
        setCompany(emptyCompany);
        setSubmitted(false);
        setCompanyDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCompanyDialog(false);
    };

    const hideDeleteCompanyDialog = () => setDeleteCompanyDialog(false);

    const hideDeleteCompaniesDialog = () => setDeleteCompaniesDialog(false);

    // CRUD operation
    const saveCompany = async () => {
        setSubmitted(true);

        // validation checks
        if (!company.company_name.trim()) {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Company name is required.",
                life: 3000,
            });
            return;
        }

        console.log("Company Modified", company);

        let _companies = [...companies];
        let _company = { ...company };

        const token = localStorage.getItem("token");
        try {
            if (company.company_id) {
                // Update existing company
                const response = await axios.put(
                    `http://localhost:3000/api/company/updateCompanyById/${company.company_id}`,
                    {
                        company_name: company.company_name,
                        email: company.email,
                        phone_number: company.phone_number,
                        no_of_student_placed: company.no_of_student_placed,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Company Details Updated',
                    life: 3000
                });
            } else {
                const response = await axios.post(
                    "http://localhost:3000/api/company/insertCompany",
                    {
                        company_name: company.company_name,
                        email: company.email,
                        phone_number: company.phone_number,
                        no_of_student_placed: company.no_of_student_placed,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                toast.current.show({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'New Company Added',
                    life: 3000
                });
            }
            getCompanies(); // Refresh company data
            setCompany(emptyCompany);
            setCompanyDialog(false);
            // updateCompanyDialog(false);
        } catch (error) {
            console.log("Error saving/updating company", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to save company.",
                life: 3000,
            });
        }
    };

    const editCompany = (company) => {
        setCompany({ ...company });
        setCompanyDialog(true);
    };

    const confirmDeleteCompany = (company) => {
        setCompany(company);
        setDeleteCompanyDialog(true);
    };

    const deleteCompany = async () => {
        try {
            const token = await localStorage.getItem("token");
            const response = await axios.delete(`http://localhost:3000/api/company/deleteCompanyById/${company.company_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
                },
            });

            if (response.status === 200) {
                // If the deletion is successful, update the UI
                let _companies = companies.filter(
                    (val) => val.company_id !== company.company_id
                );
                setCompanies(_companies);
                setDeleteCompanyDialog(false);
                setCompany(emptyCompany);

                toast.current.show({
                    severity: "success",
                    summary: "Successful",
                    detail: "Company Deleted",
                    life: 3000,
                });
            }
            else {
                // Handle error response
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to delete company",
                    life: 3000,
                });
            }
        } catch (error) {
            // Handle error during API call
            console.error("Error deleting company:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete company",
                life: 3000,
            });
        }
    };

    const exportCSV = () => dt.current.exportCSV();

    const confirmDeleteSelected = () => setDeleteCompaniesDialog(true);

    const deleteSelectedCompanies = async () => {
        try {
            const token = await localStorage.getItem("token");
            for (const company of selectedCompanies) {

                const response = await axios.delete(`http://localhost:3000/api/company/deleteCompanyById/${company.company_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Passing the token in the Authorization header
                    },
                });

                if (response.status !== 200) {
                    // Handle error response
                    console.error(`Error deleting company ${company.company_name}:`, response.data);
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: `Failed to delete company ${company.company_name}`,
                        life: 3000,
                    });
                    continue;
                }
            }
            // After all successful deletions, update the UI
            getCompanies()
            setDeleteCompaniesDialog(false);
            setSelectedCompanies([])

            toast.current.show({
                severity: "success",
                summary: "Successful",
                detail: "Companies Deleted",
                life: 3000,
            });
        } catch (error) {
            console.error("Error deleting company:", error);
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "Failed to delete company",
                life: 3000,
            });
        }
    };

    const onInputChange = (e, name) => {
        const val = e.target.value || '';
        setCompany({ ...company, [name]: val });
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        setCompany({ ...company, [name]: val });
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" outlined onClick={() => editCompany(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" outlined onClick={() => confirmDeleteCompany(rowData)} />
            </React.Fragment>
        );
    };

    const studentDetailsBodyTemplate = (rowData) => {
        return (
            <React.Fragment>
                <Button label="View Details" icon="pi pi-eye" outlined onClick={() => handleViewDetails(rowData.company_id, rowData.company_name)} />
            </React.Fragment>
        );
    };

    const openFilterDialog = () => setFilterDialog(true);
    const hideFilterDialog = () => setFilterDialog(false);

    const header = (
        <div className="table-header">
            <div className="header-buttons">
                <Button label="New" icon="pi pi-plus" className="p-button-success header-button" outlined onClick={openNew} />
                <Button label="Delete" icon="pi pi-trash" className="p-button-danger header-button" outlined onClick={confirmDeleteSelected} disabled={!selectedCompanies || !selectedCompanies.length} />
                <Button label="Export" icon="pi pi-upload" className="p-button-help header-button" outlined onClick={exportCSV} />
            </div>
            <div className="header-search-filter">
                <span className="p-input-icon-left">
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search"> </InputIcon>
                        <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Search..." style={{ width: '500px' }} />
                    </IconField>
                </span>
                <Button label="Filter" icon="pi pi-filter" className="p-button-secondary header-button" outlined onClick={openFilterDialog} style={{ alignItems: 'flex-end' }} />
            </div>
        </div>
    );

    const applyFilter = () => {
        let filteredData = companies.filter((comp) => {
            return (
                (filter.min_no_of_student_placed === null || comp.no_of_student_placed >= filter.min_no_of_student_placed) &&
                (filter.max_no_of_student_placed === null || comp.no_of_student_placed <= filter.max_no_of_student_placed)
            );
        });
        setCompanies(filteredData);
        setFilterDialog(false);
    };

    const filterDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button" outlined onClick={hideFilterDialog} />
            <Button label="Apply" icon="pi pi-check" className="p-button" outlined onClick={applyFilter} />
        </React.Fragment>
    );

    const onFilterInputNumberChange = (e, name) => setFilter({ ...filter, [name]: e.value !== null ? e.value : null });

    const companyDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button" outlined onClick={hideDialog} />
            <Button label="Save" icon="pi pi-check" className="p-button" outlined onClick={saveCompany} />
        </React.Fragment>
    );

    const deleteCompanyDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button" outlined onClick={hideDeleteCompanyDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button" outlined onClick={deleteCompany} />
        </React.Fragment>
    );

    const deleteCompaniesDialogFooter = (
        <React.Fragment>
            <Button label="No" icon="pi pi-times" className="p-button" outlined onClick={hideDeleteCompaniesDialog} />
            <Button label="Yes" icon="pi pi-check" className="p-button" outlined onClick={deleteSelectedCompanies} />
        </React.Fragment>
    );

    return (
        <div className="companies-page">
            <Toast ref={toast} />
            {/* <h2 className="ml-5" >Manage Companies</h2> */}
            <div className="card">
                <h2 className="manage-companies-header">Manage Companies</h2>
                <DataTable
                    ref={dt}
                    value={companies}
                    selection={selectedCompanies}
                    onSelectionChange={(e) => setSelectedCompanies(e.value)}
                    dataKey="company_id" /*identify each row uniquely */
                    paginator
                    rows={5}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} companies"
                    globalFilter={globalFilter}
                    header={header}
                    tableStyle={{ minWidth: '100%', width: '100%' }}
                    size='small'
                    showGridlines
                >
                    <Column selectionMode="multiple" exportable={false}></Column>
                    <Column field="company_name" header="Company Name" sortable style={{ minWidth: '16rem' }}></Column>
                    <Column field="email" header="Email" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="phone_number" header="Phone Number" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column field="no_of_student_placed" header="Students Placed" sortable style={{ minWidth: '12rem' }}></Column>
                    <Column body={studentDetailsBodyTemplate} header="Student Details" style={{ minWidth: '12rem' }} />
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            {/* Add/Edit Company Dialog */}
            <Dialog visible={companyDialog} style={{ width: '450px' }} header="Company Details" modal className="p-fluid" footer={companyDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="company_name">Name</label>
                    <InputText id="company_name" value={company.company_name} onChange={(e) => onInputChange(e, 'company_name')} required autoFocus className={classNames({ 'p-invalid': submitted && !company.company_name })} />
                    {submitted && !company.company_name && <small className="p-error">Name is required.</small>}
                </div>
                <div className="field">
                    <label htmlFor="email">Email</label>
                    <InputText id="email" value={company.email} onChange={(e) => onInputChange(e, 'email')} />
                </div>
                <div className="field">
                    <label htmlFor="phone_number">Phone Number</label>
                    <InputText id="phone_number" value={company.phone_number} onChange={(e) => onInputChange(e, 'phone_number')} />
                </div>
                <div className="field">
                    <label htmlFor="no_of_student_placed">Students Placed</label>
                    <InputNumber id="no_of_student_placed" value={company.no_of_student_placed} onValueChange={(e) => onInputNumberChange(e, 'no_of_student_placed')} />
                </div>
            </Dialog>

            {/* Filter Dialog */}
            <Dialog visible={filterDialog} style={{ width: '450px' }} header="Filter Companies" modal className="p-fluid" footer={filterDialogFooter} onHide={hideFilterDialog}>
                <div className="field">
                    <label htmlFor="filter_min_students_placed">Min Students Placed</label>
                    <InputNumber
                        id="filter_min_students_placed"
                        value={filter.min_no_of_student_placed}
                        onValueChange={(e) => onFilterInputNumberChange(e, 'min_no_of_student_placed')}
                        useGrouping={false}
                    />
                </div>
                <div className="field">
                    <label htmlFor="filter_max_students_placed">Max Students Placed</label>
                    <InputNumber
                        id="filter_max_students_placed"
                        value={filter.max_no_of_student_placed}
                        onValueChange={(e) => onFilterInputNumberChange(e, 'max_no_of_student_placed')}
                        useGrouping={false}
                    />
                </div>
            </Dialog>


            {/* Delete single company dialog */}
            <Dialog visible={deleteCompanyDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompanyDialogFooter} onHide={hideDeleteCompanyDialog}>
                <div className="confirmation-content flex">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {company && <span style={{ color: 'red' }}>Are you sure you want to delete <b>{company.company_name}</b>?</span>}
                </div>
            </Dialog>

            {/* Delete multiple companies dialog */}
            <Dialog visible={deleteCompaniesDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteCompaniesDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {company && <span style={{ color: 'red' }}>Are you sure you want to delete the selected companies?</span>}
                </div>
            </Dialog>

        </div>
    );
}

export default Companies;