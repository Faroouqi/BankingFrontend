import React, { useState } from 'react';
import '../css/Navbar.css';
import { useNavigate } from 'react-router-dom';
import TransactionPopup from './TransactionPopup';
import BudgetPopup from './BudgetPopup';

const Navbar = ({ userName = 'John Doe', totalBalance = 50000 }) => {
    const navigate = useNavigate();
    const [popupType, setPopupType] = useState(null); // null, 'transaction', 'budget'

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8089/logout', {
                method: 'GET',
                credentials: 'include', // Very important to send JSESSIONID
            });
            if (response.ok) {
                navigate("/");
            }
        } catch (error) {
            throw error;
        }
    };

    const closePopup = () => setPopupType(null);

    return (
        <>
            <nav className={`navbar navbar-expand-lg navbar-light bg-light ${popupType ? 'blurred' : ''}`}>
            <a className="navbar-brand" href="#">💰 Finance Manager</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse"
                        data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                        aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item active">
                            <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => setPopupType('transaction')}>
                                Transaction
                            </span>
                        </li>
                        <li className="nav-item">
                            <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => setPopupType('budget')}>
                                Budget
                            </span>
                        </li>
                    </ul>
                    <h4 className="balance">₹ {totalBalance}</h4>
                    <div className="btn-group">

                        <button type="button" className="btn btn-danger">Action</button>
                        <button type="button" className="btn btn-danger dropdown-toggle dropdown-toggle-split"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span className="sr-only">Toggle Dropdown</span>
                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#">Action</a>
                            <span className="nav-link" style={{ cursor: 'pointer' }} onClick={handleLogout}>
                                Logout
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            {popupType === 'transaction' && <TransactionPopup onClose={closePopup} />}
            {popupType === 'budget' && <BudgetPopup onClose={closePopup} />}
        </>
    );
};

export default Navbar;
