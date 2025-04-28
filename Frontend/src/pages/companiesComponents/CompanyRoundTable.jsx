import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import "../../../node_modules/primeflex/primeflex.css";

// Helper function to format date string to YYYY-MM-DD
const formatDate = (value) => {
    if (!value) {
        return ''; // Return empty string if date is null or undefined
    }
    try {
        const date = new Date(value);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
             // If the original value was already YYYY-MM-DD, return it
             if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
             console.warn("Invalid date value received:", value);
             return 'Invalid Date';
        }
        return date.toISOString().split('T')[0]; // Extracts the YYYY-MM-DD part
    } catch (error) {
        console.error("Error formatting date:", value, error);
        return 'Error'; // Return 'Error' or the original value in case of an issue
    }
};


const CompanyRoundTable = ({ companyId }) => {
    const [rounds, setRounds] = useState([]);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [round, setRound] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        if (companyId) { // Ensure companyId is present before fetching
           fetchRounds();
        } else {
            setRounds([]); // Clear rounds if companyId is missing
        }
    }, [companyId]); // Re-run effect when companyId changes

    const fetchRounds = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`http://localhost:3000/api/interviewRound/getByCompanyId/${companyId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Optionally format dates immediately after fetching if needed elsewhere
            // const formattedRounds = response.data.map(r => ({
            //     ...r,
            //     round_date: formatDate(r.round_date) // Apply formatting here too if needed
            // }));
            // setRounds(formattedRounds);
            setRounds(response.data); // Set raw data
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to fetch rounds.', life: 3000 });
            console.error('Error fetching rounds:', error);
        }
    };

    const openNewRoundDialog = () => {
        // Initialize with null for the Calendar component
        setRound({ company_id: companyId, round_name: '', round_date: null, description: '', round_number: null, round_type: '' });
        setIsEditing(false);
        setIsDialogVisible(true);
    };

    const openEditRoundDialog = (roundData) => {
        // Convert the date string/object from data source to a Date object for Calendar
        const dateForCalendar = roundData.round_date ? new Date(roundData.round_date) : null;
        setRound({ ...roundData, round_date: dateForCalendar });
        setIsEditing(true);
        setIsDialogVisible(true);
    };

    const saveRound = async () => {
        // The backend already handles date formatting, so we can send the Date object
        // or the string representation the Calendar provides. The backend's
        // new Date(data.round_date).toISOString().split("T")[0] will handle it.
        try {
            const token = localStorage.getItem("token");
             // Prepare payload, ensure date is handled if necessary (backend does it here)
            const payload = { ...round };

            if (isEditing) {
                await axios.put(`http://localhost:3000/api/interviewRound/update/${payload.round_id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Round updated successfully.', life: 3000 });
            } else {
                 // Ensure company_id is included for new rounds
                payload.company_id = companyId;
                await axios.post(`http://localhost:3000/api/interviewRound/insert`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'New round created successfully.', life: 3000 });
            }
            fetchRounds(); // Refresh data
            setIsDialogVisible(false);
            setRound(null); // Clear the form state
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Failed to save the round.';
            toast.current.show({ severity: 'error', summary: 'Error', detail: errorMsg, life: 3000 });
            console.error('Error saving round:', error.response || error);
        }
    };


    const deleteRound = async (roundId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:3000/api/interviewRound/delete/${roundId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.current.show({ severity: 'success', summary: 'Success', detail: 'Round deleted successfully.', life: 3000 });
            fetchRounds();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete round.', life: 3000 });
            console.error('Error deleting round:', error);
        }
    };

    // const roundTypes = [
    //     { label: 'Pre Placement Talk', value: 'ppt' },
    //     { label: 'Shortlisting', value: 'shortlist' },
    //     { label: 'Online Test', value: 'online_test' },
    //     { label: 'Technical Round', value: 'technical' },
    //     { label: 'HR Round', value: 'hr' },
    //     { label: 'Final Round', value: 'final' },
    //     { label: 'Other', value: 'other' }
    // ];

    const roundTypes = [
        { label: 'Pre Placement Talk', value: 'ppt' },
        { label: 'Shortlisting', value: 'shortlist' },
        { label: 'Final Round', value: 'final' }
    ];

    const onInputNumberChange = (e, name) => {
        const val = e.value;
        setRound((prevRound) => ({ ...prevRound, [name]: val }));
    };


    const onInputChange = (e, name) => {
        // Calendar's event gives value directly in e.value
        // Dropdown also gives value in e.value
        // InputText/InputTextarea give value in e.target.value
        const val = e.target ? e.target.value : e.value;
        setRound((prevRound) => ({ ...prevRound, [name]: val }));
    };

    // --- Template for the Date Column ---
    const dateBodyTemplate = (rowData) => {
        return formatDate(rowData.round_date);
    };
    // --- End Template ---

    const deleteButtonTemplate = (rowData) => {
        return <Button icon="pi pi-trash" rounded text severity="danger" aria-label="Delete" onClick={() => deleteRound(rowData.round_id)} />;
    };

    const editButtonTemplate = (rowData) => {
        return <Button icon="pi pi-pencil" rounded text severity="success" aria-label="Edit" onClick={() => openEditRoundDialog(rowData)} />;
    };

    const dialogFooter = (
        <>
            <Button label="Cancel" icon="pi pi-times" outlined onClick={() => setIsDialogVisible(false)} className="p-button-text"/>
            <Button label="Save" icon="pi pi-check" outlined onClick={saveRound} autoFocus/>
        </>
    );

    return (
        <div className="card"> {/* Added card class for better styling */}
            <Toast ref={toast} />
            <div className="flex justify-content-end mb-3"> {/* Align button to the right */}
                <Button label="Add New Round" size='small' icon="pi pi-plus" outlined onClick={openNewRoundDialog} />
            </div>

            <DataTable value={rounds} emptyMessage="No rounds found for this company" size="small" stripedRows paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}>
                <Column field="round_number" header="Round #" sortable style={{ width: '10%' }}/>
                <Column field="round_name" header="Round Name" sortable filter filterPlaceholder="Search name" style={{ minWidth: '12rem' }} />
                <Column field="round_type" header="Round Type" sortable filter filterPlaceholder="Search type" style={{ minWidth: '10rem' }}/>
                {/* Use body template for date formatting */}
                <Column field="round_date" header="Round Date" body={dateBodyTemplate} sortable style={{ minWidth: '10rem' }}/>
                <Column field="description" header="Description" style={{ minWidth: '15rem' }}/>
                <Column header="Actions" body={editButtonTemplate} exportable={false} style={{ minWidth: '6rem' }} />
                <Column body={deleteButtonTemplate} exportable={false} style={{ minWidth: '6rem' }}/>
            </DataTable>

            <Dialog
                visible={isDialogVisible}
                style={{ width: '32rem' }} // Responsive width
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                header={<span className="p-dialog-title">{isEditing ? 'Edit Round' : 'Create New Round'}</span>} // Use span for title styling
                modal
                className="p-fluid" // Apply fluid grid system
                footer={dialogFooter}
                onHide={() => { setIsDialogVisible(false); setRound(null); }} // Clear form on hide
            >
                {/* Use PrimeFlex grid for layout */}
                <div className="formgrid grid">
                     <div className="field col-12 md:col-6">
                        <label htmlFor="round_number">Round Number *</label>
                        <InputNumber
                            id="round_number"
                            value={round?.round_number}
                            onValueChange={(e) => onInputNumberChange(e, 'round_number')} // Use onValueChange
                            mode="decimal"
                            showButtons
                            min={0}
                            required
                            className={!round?.round_number && round?.round_number !== 0 ? 'p-invalid' : ''} // Basic validation indication
                        />
                    </div>
                     <div className="field col-12 md:col-6">
                        <label htmlFor="round_date">Round Date</label>
                        <Calendar
                            id="round_date"
                            value={round?.round_date} // Value should be a Date object
                            onChange={(e) => onInputChange(e, 'round_date')}
                            dateFormat="yy-mm-dd" // Set display format
                            showIcon
                        />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="round_name">Round Name *</label>
                        <InputText
                            id="round_name"
                            value={round?.round_name || ''}
                            onChange={(e) => onInputChange(e, 'round_name')}
                            required
                            autoFocus
                            className={!round?.round_name ? 'p-invalid' : ''}
                         />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="round_type">Round Type</label>
                        <Dropdown
                            id="round_type"
                            value={round?.round_type}
                            options={roundTypes}
                            onChange={(e) => onInputChange(e, 'round_type')}
                            placeholder="Select a round type"
                            optionLabel="label" // Display the label in the dropdown
                            optionValue="value" // Use the value when selected
                        />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="description">Description</label>
                        <InputTextarea
                            id="description"
                            rows={3}
                            value={round?.description || ''}
                            onChange={(e) => onInputChange(e, 'description')}
                        />
                    </div>
                </div>
                {/* Hidden field for company_id if needed, though it's set on save */}
                {/* <InputText type="hidden" value={round?.company_id || companyId} /> */}
            </Dialog>
        </div>
    );
};

export default CompanyRoundTable;