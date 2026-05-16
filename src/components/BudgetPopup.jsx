import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../css/Popup.css';
import { useNavigate } from 'react-router-dom';
import {FaTimes} from "react-icons/fa";
import { useAlertContext } from './useAlert';

const monthLabels = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const BudgetPopup = ({ onClose}) => {
    const { success, error } = useAlertContext();
    const navigate = useNavigate();
    const [budgets, setBudgets] = useState([{ category: '', amount: '', month: '', year: '' }]);
    const [errors, setErrors] = useState([{ amount: '', month: '', year: '' }]);
    const [disabled, setDisabled] = useState(true);
    const currentMonth = new Date().getMonth() + 1;

    const monthOptions = useMemo(
        () =>
            Array.from({ length: currentMonth }, (_, index) => ({
                value: index + 1,
                label: monthLabels[index],
            })),
        [currentMonth],
    );

    const isValidNumber = useCallback((str) => {
        const num = Number(str);
        return Number.isFinite(num);
    }, []);
    const isValidMonth = useCallback((value) => {
        if(!isValidNumber(value))
        {
            return false;
        }
        const num = Number(value);
        return Number.isInteger(num) && num >= 1 && num <= 12;
    }, [isValidNumber]);

    const isValidYear = useCallback((value) => {
        if(!isValidNumber(value))
        {
            return false;
        }
        const num = Number(value);
        return Number.isInteger(num) && num >= 0;
    }, [isValidNumber]);

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        setBudgets(prev => prev.map((budget, i) => i === index ? { ...budget, [name]: value } : budget));
    };

    const addRow = () => {
        setBudgets(prev => [...prev, { category: '', amount: '', month: '', year: '' }]);
        setErrors(prev => [...prev, { amount: '', month: '', year: '' }]);
    };

    const removeRow = (index) => {
        if (budgets.length > 1) {
            setBudgets(prev => prev.filter((_, i) => i !== index));
            setErrors(prev => prev.filter((_, i) => i !== index));
        }
    };

    useEffect(() => {
        let allValid = true;
        const newErrors = budgets.map(budget => {
            const { amount, month, year, category } = budget;
            const amountError = amount !== '' && !isValidNumber(amount) ? 'Enter a valid number' : '';
            const monthError = month !== '' && !isValidMonth(month) ? 'Enter a valid month' : '';
            const yearError = year !== '' && !isValidYear(year) ? 'Enter a valid year' : '';
            if (!category || !amount || !month || !year || amountError || monthError || yearError) {
                allValid = false;
            }
            return { amount: amountError, month: monthError, year: yearError };
        });
        setErrors(newErrors);
        setDisabled(!allValid);
    }, [budgets, isValidNumber, isValidMonth, isValidYear]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        for (const budget of budgets) {
            const amount = parseFloat(budget.amount);
            try {
                const response = await fetch('http://localhost:8089/budgets/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        category: budget.category,
                        month: Number(budget.month),
                        year: Number(budget.year),
                        budgetAmount: amount,
                        userId: null
                    }),
                });
                if (response.status === 401) {
                    console.error("User is not authorized.");
                    navigate("/");
                    return;
                }
                if (!response.ok) throw new Error('Budget creation failed');
            } catch (err) {
                error('Error adding budget: ' + err.message);
                return;
            }
        }
        success('Budgets added successfully');
        setBudgets([{ category: '', amount: '', month: '', year: '' }]);
        onClose();
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <div className="close" onClick={onClose}><FaTimes size={24} /></div>
                <h2>Add Budgets</h2>
                <form onSubmit={handleSubmit}>
                    <table className="budget-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Month</th>
                                <th>Year</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map((budget, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            name="category"
                                            value={budget.category}
                                            onChange={(e) => handleChange(index, e)}
                                            required
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="amount"
                                            value={budget.amount}
                                            onChange={(e) => handleChange(index, e)}
                                            required
                                        />
                                        {errors[index].amount && <small className="error">{errors[index].amount}</small>}
                                    </td>
                                    <td>
                                        <select
                                            name="month"
                                            value={budget.month}
                                            onChange={(e) => handleChange(index, e)}
                                            required
                                        >
                                            <option value="">Select month</option>
                                            {monthOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors[index].month && <small className="error">{errors[index].month}</small>}
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            name="year"
                                            placeholder="e.g. 2025"
                                            value={budget.year}
                                            onChange={(e) => handleChange(index, e)}
                                            required
                                        />
                                        {errors[index].year && <small className="error">{errors[index].year}</small>}
                                    </td>
                                    <td>
                                        <button type="button" onClick={() => removeRow(index)} disabled={budgets.length === 1}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button type="button" className="btn-add" onClick={addRow}>Add Row</button>
                    <div className="form-actions">
                        <button disabled={disabled} type="submit" className="btn-save">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetPopup;
