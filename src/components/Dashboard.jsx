// Dashboard.jsx
import React, {useState} from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../css/Dashboard.css'
import DisplayTransaction from "./DisplayTransaction.jsx";

const Dashboard = () => {
    const [filter, setFilter] = useState('');
    const [transactions, setTransactions] = useState([]);
    const handleFilterChange = (e) => {
        if(e.target.value === "current-month")
        {
            console.log("current-month");
            setFilter("1");
        }
        if(e.target.value === "last-year")
        {
            console.log("last-year");
            setFilter("2");
        }
        if(e.target.value === "last-6-months")
        {
            console.log("6 months");
            setFilter("3");
        }

    }
    return (
        <div className="dashboard-container">
            <Navbar totalBalance={120000} />
            <div className="main-section">
                <Sidebar handleFilterChange={handleFilterChange} />
                <div className="content-area">
                    <DisplayTransaction filter={filter} />
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
