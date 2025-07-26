import React, {useEffect, useState} from 'react';
import '../css/Popup.css';
import {redirect} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import {FaTimes} from "react-icons/fa";

const BudgetPopup = ({ onClose}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        month: '',
        year: ''
    });

    const [error, setError] = useState('');
    const [errorm, setErrorm] = useState('');
    const [errory, setErrory] = useState('');
    const [disabled, setDisabled] = useState(true);


    const isValidNumber = (str) => {
        const num = Number(str);
        return Number.isFinite(num);
    };
    const isValidMonth = (value) => {
        if(!isValidNumber(value))
        {
            return false;
        }
        const num = Number(value);
        return Number.isInteger(num) && num >= 1 && num <= 12;
    };

    const isValidYear = (value) => {
        if(!isValidNumber(value))
        {
            return false;
        }
        const num = Number(value);
        return Number.isInteger(num) && num >= 0;
    };


    const handleChange = (e) => {
        const { name, value } = e.target;



        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const { amount, month, year, category } = formData;

        // Amount validation
        const isAmountValid = amount !== '' && isValidNumber(amount);
        const hasAmountError = amount !== '' && !isAmountValid;
        setError(hasAmountError ? 'Enter a valid number' : '');

        // Month validation
        const isMonthValid = month !== '' && isValidMonth(month);
        const hasMonthError = month !== '' && !isMonthValid;
        setErrorm(hasMonthError ? 'Enter a valid month' : '');

        // Year validation
        const isYearValid = year !== '' && isValidYear(year);
        const hasYearError = year !== '' && !isYearValid;
        setErrory(hasYearError ? 'Enter a valid year' : '');

        // Determine if submit should be disabled
        const shouldDisable =
            !amount || !category || !month || !year ||
            hasAmountError || hasMonthError || hasYearError;

        setDisabled(shouldDisable);
    }, [formData]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidNumber(formData.amount)) {
            alert('Please enter a valid amount');
            return;
        }

        const amount = parseFloat(formData.amount);

        try {
            const response = await fetch('http://localhost:8089/budgets/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    category: formData.category,
                    month: formData.month,
                    year: formData.year,
                    budgetAmount: amount,
                    userId: null
                }),
            });
            if (response.status === 401) {
                console.error("User is not authorized.");
                navigate("/");
            }
            if (!response.ok) throw new Error('Budget creation failed');

            alert('Budget added successfully');
            setFormData({ category: '', amount: '', month: '', year: '' });
            onClose();
        } catch (err) {
            alert('Error adding budget: ' + err.message);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <div className="close" onClick={onClose}><FaTimes size={24} /></div>
                <h2>Add Budget</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category:</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Amount:</label>
                            <input
                                type="text"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                            {error && <small className="error">{error}</small>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Month:</label>
                            <input
                                type="text"
                                name="month"
                                placeholder="e.g. 07"
                                value={formData.month}
                                onChange={handleChange}
                                required
                            />
                            {errorm && <small className="error">{errorm}</small>}
                        </div>

                        <div className="form-group">
                            <label>Year:</label>
                            <input
                                type="text"
                                name="year"
                                placeholder="e.g. 2025"
                                value={formData.year}
                                onChange={handleChange}
                                required
                            />
                            {errory && <small className="error">{errory}</small>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button disabled={disabled} type="submit" className="btn-save">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetPopup;
