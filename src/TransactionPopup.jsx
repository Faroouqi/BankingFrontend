import React, { useState } from 'react';
import './Popup.css';
import {redirect} from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const TransactionPopup = ({ onClose }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        category: '',
        amount: '',
        date: '',
        note: ''
    });
    const [error, setError] = useState('');
    const isValidNumber=(str)=> {
        const num = Number(str);
        return Number.isFinite(num);
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'amount' && value !== '') {
            if (!isValidNumber(value)) {
                setError('Enter a valid number');
            } else {
                setError('');
            }
        }
        else{
            setError("")
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!isValidNumber(formData.amount))
        {
            alert("Please enter a number");
            return;
        }
        const amount = parseFloat(formData.amount);
        try {
            const response = await fetch('http://localhost:8089/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header if needed (e.g. JWT or session cookie)
                },
                body: JSON.stringify({
                    ...formData,
                    amount: amount  // ensure amount is a number
                }),
                credentials: 'include' // to include session cookies
            });
            if (response.status === 401) {
                console.error("User is not authorized.");
                navigate('/');
            }
            if (!response.ok) {
                throw new Error('Transaction failed');
            }

            const result = await response.json();
            alert('Transaction added successfully');
            onClose(); // close popup after success
        } catch (err) {
            alert('Error adding transaction: ' + err.message);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <h2>Add Transaction</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Type:</label>
                            <select name="type" value={formData.type} onChange={handleChange}>
                                <option value="EXPENSE">Expense</option>
                                <option value="INCOME">Income</option>
                            </select>
                        </div>

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
                    </div>

                    <div className="form-row">
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

                        <div className="form-group">
                            <label>Date:</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Note:</label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-save">Save</button>
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );

};

export default TransactionPopup;
