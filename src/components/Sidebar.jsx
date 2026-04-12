import React, { useState } from 'react';
import '../css/Sidebar.css';
import { removeGoalName } from './GoalStorage';
import { getGoalNames } from './GoalStorage';

const Sidebar = ({ handleFilterChange }) => {
    const [selectedFilter, setSelectedFilter] = useState('');

    const handleChange = (e) => {
        console.log("Current goal names after removal:", getGoalNames());
        const value = e.target.value;
        setSelectedFilter(value);
        handleFilterChange(e); 


    };

    return (
        <div className="sidebar">
            {/* Sidebar Title */}
            <h3 className="sidebar-title">📊 Filter Transactions</h3>

            {/* Filter Section */}
            <div className="filter-options">
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="current-month"
                        checked={selectedFilter === 'current-month'}
                        onChange={handleChange}
                    />
                    <span>Current Month</span>
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="last-6-months"
                        checked={selectedFilter === 'last-6-months'}
                        onChange={handleChange}
                    />
                    <span>Last 6 Months</span>
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="last-year"
                        checked={selectedFilter === 'last-year'}
                        onChange={handleChange}
                    />
                    <span>Last Year</span>
                </label>
            </div>

            {/* Divider Line */}
            <hr className="sidebar-divider" />
            <div className='Goal-Section'>
                <h3 className="sidebar-title">🎯 Financial Overview</h3>
                {/* <p>Track your financial goals to stay on top of your finances!</p> */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
   <div className="view-toggle">
  <button
    className={`toggle-btn ${selectedFilter === 'goals' ? "active" : ""}`}
    onClick={() => handleChange({ target: { value: "goals" } })}
  >
    Goals
  </button>

  <button
    className={`toggle-btn ${selectedFilter === 'spendings' ? "active" : ""}`}
    onClick={() => handleChange({ target: { value: "spendings" } })}
  >
    Spendings
  </button>

  <button
    className={`toggle-btn ${selectedFilter === 'savings' ? "active" : ""}`}
    onClick={() => handleChange({ target: { value: "savings" } })}
  >
    Savings
  </button>
</div>
</div>
                <br/>
                {/* <br/> */}
             </div>
            {/* Thought Section */}
            <div className="finance-thought">
                <p>
                    💡 <i>
                    "A great Finance Manager is not just a keeper of numbers,
                    but a strategist who transforms data into decisions,
                    risks into opportunities, and resources into growth."
                </i>
                </p>
            </div>
        </div>
    );
};

export default Sidebar;
