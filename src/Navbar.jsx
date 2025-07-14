import React, { useState } from 'react';
import './Navbar.css';
import { useNavigate } from 'react-router-dom';
import TransactionPopup from './TransactionPopup';
import BudgetPopup from './BudgetPopup';

const Navbar = ({ userName = 'John Doe', totalBalance = 50000 }) => {
    const navigate = useNavigate();
    const [popupType, setPopupType] = useState(null); // null, 'transaction', 'budget'

    const handleLogout = () => {
        navigate('/login');
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
                    <div className="btn-group">
                        <button type="button" className="btn btn-danger">Action</button>
                        <button type="button" className="btn btn-danger dropdown-toggle dropdown-toggle-split"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span className="sr-only">Toggle Dropdown</span>
                        </button>
                        <div className="dropdown-menu">
                            <a className="dropdown-item" href="#">Action</a>
                            <a className="dropdown-item" href="#">Another action</a>
                            <a className="dropdown-item" href="#">Something else here</a>
                            <div className="dropdown-divider"></div>
                            <a className="dropdown-item" href="#">Separated link</a>
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
