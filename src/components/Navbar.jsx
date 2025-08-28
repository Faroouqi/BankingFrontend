import React, { useState } from 'react';
import '../css/Navbar.css';
import { useNavigate } from 'react-router-dom';
import TransactionPopup from './TransactionPopup';
import BudgetPopup from './BudgetPopup';

const Navbar = ({ userName = 'John Doe', totalBalance = 50000 }) => {
    const navigate = useNavigate();
    const [popupType, setPopupType] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8089/logout', {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                navigate("/");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const closePopup = () => setPopupType(null);

    return (
        <>
            <nav className={`navbar ${popupType ? 'blurred' : ''}`}>
                {/* Logo */}
                <div className="logo">💰 Finance Manager</div>

                {/* Center menu */}
                <div className="navbar-center">
                    <div className="tooltip-container">
                        <span className="nav-btn" onClick={() => setPopupType('transaction')}>
                             Transaction
                        </span>
                        <span className="tooltip-text">Add new transaction</span>
                    </div>
                    <div className="tooltip-container">
                        <span className="nav-btn" onClick={() => setPopupType('budget')}>
                             Budget
                        </span>
                        <span className="tooltip-text">Set monthly budget</span>
                    </div>
                </div>

                {/* Right section */}
                <div className="navbar-right">
                    <h4 className="balance">₹ {totalBalance.toLocaleString()}</h4>
                    <div
                        className="profile"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <img
                            src={`https://ui-avatars.com/api/?name=${userName}&background=00b894&color=fff`}
                            alt="avatar"
                            className="avatar"
                        />
                        {showDropdown && (
                            <div className="dropdown">
                                <div>{userName}</div>
                                <div onClick={handleLogout}>Logout</div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {popupType === 'transaction' && <TransactionPopup onClose={closePopup} />}
            {popupType === 'budget' && <BudgetPopup onClose={closePopup} />}
        </>
    );
};

export default Navbar;
