import React, { useState } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ userName = 'John Doe', totalBalance = 50000 }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h1 className="logo">💰 FinTrack</h1>
            </div>

            <div className="navbar-right">
                <button className="nav-btn" onClick={() => navigate('/add-transaction')}>
                    Transaction
                </button>
                <button className="nav-btn" onClick={() => navigate('/add-budget')}>
                    Budget
                </button>
            </div>

            <div className="navbar-right">
                <span className="balance">₹ {totalBalance.toLocaleString()}</span>
                <div className="profile" onClick={() => setShowDropdown(!showDropdown)}>
                    <img src="/assets/img1.png" alt="User" className="avatar" />
                    {showDropdown && (
                        <div className="dropdown">
                            <div onClick={() => navigate('/profile')}>👤 Profile</div>
                            <div onClick={handleLogout}>🚪 Logout</div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
