// Dashboard.jsx
import React, {useState} from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Dashboard.css'

const Dashboard = () => {
    const [filter, setFilter] = useState('');
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    }
    return (
        <div className="dashboard-container">
            <Navbar userName="Nabeel" totalBalance={120000} />
            <div className="main-section">
                <Sidebar handleFilterChange={handleFilterChange} />
                <div className="content-area">
                    <h1>{filter}</h1>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
