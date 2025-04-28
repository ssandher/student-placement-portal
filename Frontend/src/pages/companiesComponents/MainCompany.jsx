// MainCompany.jsx
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { useParams, useNavigate , useLocation} from 'react-router-dom';

import PlacedStudentsTable from './PlacedStudentsTable';
import CompanyRoundTable from './CompanyRoundTable';
import RoundWiseStudent from './RoundWiseStudent';
import ManageStudents from './ManageStudents';
import styles from "./MainCompany.module.css";

const MainCompany = () => {

    const [activeTable, setActiveTable] = useState(null); // to render different table according to buttons
    const { companyId } = useParams(); // Get companyId from the URL
    const location = useLocation(); // Get location object
    const queryParams = new URLSearchParams(location.search);
    const companyName = queryParams.get('companyName'); // Extract companyName from query params

    const renderTable = () => {
        switch (activeTable) {
            case 'placedStudentsTable':
                return <PlacedStudentsTable companyId={companyId} companyName={companyName}/>;
            case 'companyRoundTable':
                return <CompanyRoundTable companyId={companyId}/>;
            case 'roundWiseStudent':
                return <RoundWiseStudent companyId={companyId}/>;
            case 'manageStudents':
                return <ManageStudents companyId={companyId}/>;
            default:
                return null;
        }
    };


    const navigate = useNavigate();
    // to navigate to previous page
    const handleBack = () => {
        navigate(-1);
    }

    return (
        <div className={styles.container}>
            <header className={styles.containerHeader}>
                <Button
                    onClick={handleBack}
                    className="p-button-primary m-3 border-round"
                    label="Back"
                    icon="pi pi-arrow-left"
                    size="small"
                    outlined
                />
                <h1 className="mx-auto">{companyName} </h1>
            </header>
            <div className="flex flex-row md:justify-content-start">
                <Button label="Placed Students" size='small'
                    className='mr-2' onClick={() => setActiveTable('placedStudentsTable')} outlined />
                <Button label="Manage Rounds" size='small'
                    className='mr-2' onClick={() => setActiveTable('companyRoundTable')} outlined />
                <Button label="View Students" size='small'
                    className='mr-2' onClick={() => setActiveTable('roundWiseStudent')} outlined />
                <Button label="Manage Students" size='small'
                    className='mr-2' onClick={() => setActiveTable('manageStudents')} outlined />
            </div>
            <div>
                {activeTable === null ? <p>Select a table to view data.</p> : renderTable()}
            </div>
        </div>
    );
};

export default MainCompany;
