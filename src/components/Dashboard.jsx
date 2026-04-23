import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../css/Dashboard.css';
import DisplayTransaction from './DisplayTransaction.jsx';
import { getGoalNames } from './GoalStorage';

const filterMap = {
    'current-month': '1',
    'last-year': '2',
    'last-6-months': '3',
    goals: '4',
    spendings: '5',
    savings: '6',
};

const Dashboard = () => {
    const [filter, setFilter] = useState('1');
    const [goalNames, setGoalNames] = useState(getGoalNames());

    const handleFilterChange = (event) => {
        const nextFilter = filterMap[event.target.value];
        if (nextFilter) {
            setFilter(nextFilter);
        }
    };

    const refreshGoals = (newValues) => {
        setGoalNames(Array.isArray(newValues) ? newValues : getGoalNames());
    };

    return (
        <div className="dashboard-container">
            <Navbar totalBalance={120000} onUpdate={refreshGoals} Goals={goalNames} />

            <div className="main-section">
                <Sidebar handleFilterChange={handleFilterChange} />

                <main className="content-area">
                    <DisplayTransaction filter={filter} onUpdate={refreshGoals} />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
