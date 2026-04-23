import { useEffect, useMemo, useRef, useState } from 'react';
import '../css/Navbar.css';
import { useNavigate } from 'react-router-dom';
import { FaArrowRightFromBracket, FaBullseye, FaPlus, FaWallet } from 'react-icons/fa6';
import { HiOutlineCreditCard } from 'react-icons/hi2';
import TransactionPopup from './TransactionPopup';
import BudgetPopup from './BudgetPopup';
import GoalPopup from './GoalPopup';

const Navbar = ({ totalBalance = 50000, onUpdate, Goals }) => {
    const navigate = useNavigate();
    const profileRef = useRef(null);
    const [popupType, setPopupType] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('http://localhost:8089/me', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Not logged in');
                }

                setUserName(await response.text());
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const initials = useMemo(() => {
        const name = userName.trim();
        if (!name) return 'FM';
        return name
            .split(' ')
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('');
    }, [userName]);

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8089/logout', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const closePopup = () => setPopupType(null);

    return (
        <>
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="navbar-brand-icon">
                        <FaWallet />
                    </div>
                    <div>
                        <strong>Finance Manager</strong>
                        <span>Budget smarter every month</span>
                    </div>
                </div>

                <div className="navbar-center">
                    <button className="navbar-action" onClick={() => setPopupType('transaction')} type="button">
                        <HiOutlineCreditCard />
                        <span>Add Transaction</span>
                    </button>
                    <button className="navbar-action" onClick={() => setPopupType('budget')} type="button">
                        <FaPlus />
                        <span>New Budget</span>
                    </button>
                    <button className="navbar-action" onClick={() => setPopupType('goal')} type="button">
                        <FaBullseye />
                        <span>Add Goal</span>
                    </button>
                </div>

                <div className="navbar-right">
                    <div className="balance-pill">
                        <span>Total Balance</span>
                        <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalBalance)}</strong>
                    </div>

                    <div className="profile" ref={profileRef}>
                        <button
                            className="profile-trigger"
                            type="button"
                            onClick={() => setShowDropdown((prev) => !prev)}
                        >
                            <div className="avatar">{initials}</div>
                        </button>

                        {showDropdown && (
                            <div className="dropdown">
                                <div className="dropdown-user">
                                    <strong>{userName || 'Finance User'}</strong>
                                    <span>Manage your account</span>
                                </div>
                                <button className="dropdown-item" onClick={handleLogout} type="button">
                                    <FaArrowRightFromBracket />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {popupType === 'transaction' && <TransactionPopup onClose={closePopup} Goals={Goals} />}
            {popupType === 'budget' && <BudgetPopup onClose={closePopup} />}
            {popupType === 'goal' && <GoalPopup onClose={closePopup} onUpdate={onUpdate} />}
        </>
    );
};

export default Navbar;
