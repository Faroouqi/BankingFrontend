import { useEffect, useState } from 'react';
import '../css/Popup.css';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { useAlertContext } from './useAlert';
const TransactionPopup = ({ onClose, Goals }) => {
    const { success, error } = useAlertContext();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        category: '',
        amount: '',
        date: '',
        note: '',
    });
    const [disabled, setDisabled] = useState(true);
    const [error1, setError1] = useState('');
    const [goals, setGoals] = useState(false);
    const [names, setNames] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setNames(Goals || []);
    }, [Goals]);

    const isValidNumber = (value) => Number.isFinite(Number(value));

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'type') {
            setGoals(value === 'GOAL');
        }
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const filteredGoals = names.filter((name) =>
        name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    useEffect(() => {
        const isAmountValid = formData.amount !== '' && isValidNumber(formData.amount);
        const hasError = formData.amount !== '' && !isAmountValid;
        const shouldDisable = !formData.amount || !formData.category || hasError;

        setError1(hasError ? 'Enter a valid number' : '');
        setDisabled(shouldDisable);
    }, [formData]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isValidNumber(formData.amount)) {
            error1('Please enter a number');
            return;
        }

        try {
            const response = await fetch('http://localhost:8089/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
                credentials: 'include',
            });

            if (response.status === 401) {
                navigate('/');
                return;
            }

            if (!response.ok) {
                throw new Error('Transaction failed');
            }

            await response.json();
            success('Transaction added successfully');
            onClose();
        } catch (err) {
            error('Error adding transaction');
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
                                <option value="GOAL">Goal</option>
                            </select>
                        </div>

                        {goals ? (
                            <div className="form-group">
                                <label>Goal Name:</label>
                                <div className="custom-dropdown">
                                    <input
                                        type="text"
                                        placeholder="Search Goal..."
                                        value={searchTerm}
                                        onChange={(event) => {
                                            setSearchTerm(event.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                    />

                                    {showDropdown && searchTerm && (
                                        <div className="dropdown-list">
                                            {filteredGoals.length > 0 ? (
                                                filteredGoals.map((name) => (
                                                    <div
                                                        key={name}
                                                        className="dropdown-item"
                                                        onClick={() => {
                                                            setFormData((prev) => ({
                                                                ...prev,
                                                                category: name,
                                                            }));
                                                            setSearchTerm(name);
                                                            setShowDropdown(false);
                                                        }}
                                                    >
                                                        {name}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="dropdown-item">No match found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
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
                        )}
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
                            {error1 && <small className="error">{error1}</small>}
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
                        <button disabled={disabled} type="submit" className="btn-save">Save Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionPopup;
