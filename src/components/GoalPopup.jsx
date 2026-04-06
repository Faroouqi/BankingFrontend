import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from "react-icons/fa";

const GoalPopup = ({ onClose }) => {
    const navigate = useNavigate();

    const [goals, setGoals] = useState([{ name: '', amount: '', date: '' }]);
    const [errors, setErrors] = useState([{ amount: '' }]);
    const [disabled, setDisabled] = useState(true);

    const isValidNumber = useCallback((str) => {
        const num = Number(str);
        return Number.isFinite(num);
    }, []);

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        setGoals(prev =>
            prev.map((goal, i) =>
                i === index ? { ...goal, [name]: value } : goal
            )
        );
    };

    const addRow = () => {
        setGoals(prev => [...prev, { name: '', amount: '', date: '' }]);
        setErrors(prev => [...prev, { amount: '' }]);
    };

    const removeRow = (index) => {
        if (goals.length > 1) {
            setGoals(prev => prev.filter((_, i) => i !== index));
            setErrors(prev => prev.filter((_, i) => i !== index));
        }
    };

    useEffect(() => {
        let allValid = true;

        const newErrors = goals.map(goal => {
            const { amount, name } = goal;

            const amountError =
                amount !== '' && !isValidNumber(amount)
                    ? 'Enter a valid number'
                    : '';

            if (!name || !amount || amountError) {
                allValid = false;
            }

            return { amount: amountError };
        });

        setErrors(newErrors);
        setDisabled(!allValid);
    }, [goals, isValidNumber]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        for (const goal of goals) {
            const amount = parseFloat(goal.amount);

            try {
                const response = await fetch('http://localhost:8089/goals/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        goalName: goal.name,
                        targetAmount: amount,
                        targetDate: goal.date,
                        userId: null
                    }),
                });

                if (response.status === 401) {
                    navigate("/");
                    return;
                }

                if (!response.ok) throw new Error('Goal creation failed');

            } catch (err) {
                alert('Error adding goal: ' + err.message);
                return;
            }
        }

        alert('Goals added successfully');
        setGoals([{ name: '', amount: '', date: '' }]);
        onClose();
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <div className="close" onClick={onClose}>
                    <FaTimes size={24} />
                </div>

                <h2>Add Goals</h2>

                <form onSubmit={handleSubmit}>
                    <table className="budget-table">
                        <thead>
                            <tr>
                                <th>Goal Name</th>
                                <th>Target Amount</th>
                                <th>Target Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {goals.map((goal, index) => (
                                <tr key={index}>
                                    <td>
                                        <input
                                            type="text"
                                            name="name"
                                            value={goal.name}
                                            onChange={(e) => handleChange(index, e)}
                                            required
                                        />
                                    </td>

                                    <td>
                                        <input
                                            type="text"
                                            name="amount"
                                            value={goal.amount}
                                            onChange={(e) => handleChange(index, e)}
                                            required
                                        />
                                        {errors[index].amount && (
                                            <small className="error">
                                                {errors[index].amount}
                                            </small>
                                        )}
                                    </td>

                                    <td>
                                        <input
                                            type="date"
                                            name="date"
                                            value={goal.date}
                                            onChange={(e) => handleChange(index, e)}
                                            required
                                        />
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            disabled={goals.length === 1}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button type="button" className="btn-add" onClick={addRow}>
                        Add Row
                    </button>

                    <div className="form-actions">
                        <button disabled={disabled} type="submit" className="btn-save">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoalPopup;