// Dashboard.jsx
import React, {useState} from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../css/Dashboard.css'
import DisplayTransaction from "./DisplayTransaction.jsx";
import { removeGoalName } from './GoalStorage';
import { getGoalNames } from './GoalStorage';



const Dashboard = () => {
    const [filter, setFilter] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [goalNames, setGoalNames] = useState(getGoalNames());
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
        if(e.target.value === "goals"){
            console.log("goals");
            setFilter("4");
        }
        if(e.target.value === "spendings"){
            console.log("spendings");
            setFilter("5");
        }
        if(e.target.value === "savings"){
            console.log("savings");
            setFilter("6");
        }

    }

    const refreshGoals =  (newValues) => {
        setGoalNames(newValues);
    }

    

    return (
        <div className="dashboard-container">
            <Navbar totalBalance={120000} onUpdate = {refreshGoals} Goals = {goalNames} />
            <div className="main-section">
                <Sidebar handleFilterChange={handleFilterChange} />
                <div className="content-area">
                    <DisplayTransaction filter={filter} onUpdate = {refreshGoals}/>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
