import React, { useEffect, useState } from 'react';
import '../css/Popup.css';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';

const TransactionPopup = ({ onClose }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        category: '',
        amount: '',
        date: '',
        note: ''
    });
    const [disabled, setDisabled] = useState(true);
    const [error, setError] = useState('');

    const isValidNumber = (str) => {
        const num = Number(str);
        return Number.isFinite(num);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const isAmountValid = formData.amount !== '' && isValidNumber(formData.amount);
        const hasError = formData.amount !== '' && !isAmountValid;
        const shouldDisable = !formData.amount || !formData.category || hasError;

        if (error !== (hasError ? 'Enter a valid number' : '')) {
            setError(hasError ? 'Enter a valid number' : '');
        }

        if (disabled !== shouldDisable) {
            setDisabled(shouldDisable);
        }
    }, [formData, disabled, error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidNumber(formData.amount)) {
            alert("Please enter a number");
            return;
        }
        const amount = parseFloat(formData.amount);
        try {
            const response = await fetch('http://localhost:8089/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    amount: amount
                }),
                credentials: 'include'
            });

            if (response.status === 401) {
                console.error("User is not authorized.");
                navigate('/');
            }

            if (!response.ok) {
                throw new Error('Transaction failed');
            }

            await response.json();
            alert('Transaction added successfully');
            onClose();
        } catch (err) {
            alert('Error adding transaction: ' + err.message);
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <div className="popup-header">
                    <h2>Add Transaction</h2>
                    <div className="close" onClick={onClose}><FaTimes size={20} /></div>
                </div>

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
                        <button disabled={disabled} type="submit" className="btn-save">💾 Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionPopup;
