import { useState } from 'react';
import '../css/Sidebar.css';

const periodFilters = [
    { value: 'current-month', title: 'Current Month', description: 'Review recent transactions and update entries quickly.' },
    { value: 'last-6-months', title: 'Last 6 Months', description: 'Understand medium-term spending and budget movement.' },
    { value: 'last-year', title: 'Last Year', description: 'Compare long-term performance against your annual budget.' },
];

const overviewFilters = [
    { value: 'goals', label: 'Goals' },
    { value: 'spendings', label: 'Spending' },
    { value: 'savings', label: 'Savings' },
    { value: 'compare', label: 'Compare' },
    { value: 'loans', label: 'Loans' },
];

const Sidebar = ({ handleFilterChange }) => {
    const [selectedFilter, setSelectedFilter] = useState('current-month');

    const handleChange = (event) => {
        setSelectedFilter(event.target.value);
        handleFilterChange(event);
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <p className="sidebar-kicker">Workspace</p>
                <h3 className="sidebar-title">Explore your financial story</h3>
                <p className="sidebar-copy">
                    Switch between quick transaction views and broader performance summaries.
                </p>
            </div>

            <div className="sidebar-section">
                <h4 className="sidebar-section-title">Transaction Filters</h4>
                <div className="filter-options">
                    {periodFilters.map((filterOption) => (
                        <label
                            key={filterOption.value}
                            className={selectedFilter === filterOption.value ? 'filter-card active' : 'filter-card'}
                        >
                            <input
                                type="radio"
                                name="filter"
                                value={filterOption.value}
                                checked={selectedFilter === filterOption.value}
                                onChange={handleChange}
                            />
                            <span className="filter-card-title">{filterOption.title}</span>
                            <small>{filterOption.description}</small>
                        </label>
                    ))}
                </div>
            </div>

            <div className="sidebar-section">
                <h4 className="sidebar-section-title">Financial Overview</h4>
                <div className="overview-toggle-group">
                    {overviewFilters.map((filterOption) => (
                        <button
                            key={filterOption.value}
                            type="button"
                            className={selectedFilter === filterOption.value ? 'overview-toggle active' : 'overview-toggle'}
                            onClick={() => handleChange({ target: { value: filterOption.value } })}
                        >
                            {filterOption.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="finance-thought">
                <h4>Focus for this month</h4>
                <p>
                    Strong financial systems come from consistent tracking, realistic budgets, and
                    decisions backed by data.
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
