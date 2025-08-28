import React, { useState } from 'react';
import '../css/Sidebar.css';

const Sidebar = ({ handleFilterChange }) => {
    const [selectedFilter, setSelectedFilter] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedFilter(value);
        handleFilterChange(e); // Notify parent
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
