import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ handleFilterChange }) => {
    const [selectedFilter, setSelectedFilter] = useState('');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedFilter(value);
        handleFilterChange(e); // Notify parent
    };

    return (
        <div className="sidebar">
            <h3>Filter Transactions</h3>
            <div className="filter-options">
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="current-month"
                        checked={selectedFilter === 'current-month'}
                        onChange={handleChange}
                    />
                    Current Month
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="last-6-months"
                        checked={selectedFilter === 'last-6-months'}
                        onChange={handleChange}
                    />
                    Last 6 Months
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="last-year"
                        checked={selectedFilter === 'last-year'}
                        onChange={handleChange}
                    />
                    Last Year
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="custom"
                        checked={selectedFilter === 'custom'}
                        onChange={handleChange}
                    />
                    Custom Range
                </label>

                {selectedFilter === 'custom' && (
                    <div className="custom-range">
                        <label>
                            From:
                            <input
                                type="month"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                            />
                        </label>
                        <label>
                            To:
                            <input
                                type="month"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
