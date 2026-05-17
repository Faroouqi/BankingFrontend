import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Loan.css';
import { useAlertContext } from './useAlert';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

const initialForm = {
    personName: '',
    amount: '',
    date: '',
    note: '',
};

const readJsonIfPresent = async (response) => {
    const text = await response.text();
    if (!text.trim()) {
        return null;
    }

    return JSON.parse(text);
};

const Loan = () => {
    const navigate = useNavigate();
    const { success, error } = useAlertContext();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [payingLoanId, setPayingLoanId] = useState(null);
    const [paymentInputs, setPaymentInputs] = useState({});

    const getRemainingAmount = useCallback(
        (loan) => Math.max(Number(loan.amount || 0) - Number(loan.paidAmount || 0), 0),
        [],
    );

    const fetchLoans = useCallback(async () => {
        try {
            setLoading(true);
            setPageError(null);

            const response = await fetch('http://localhost:8089/loan/get', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.status === 401) {
                navigate('/');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch loans');
            }
            console.log('Raw response for loans:', response);
            const text = await response.text();
            const data = text ? JSON.parse(text) : [];
            setLoans(Array.isArray(data) ? data : []);
            setLoans(Array.isArray(data) ? data : []);
            console.log('Fetched loans:', data);
        } catch (err) {
            setPageError(err.message || 'Unable to load loans right now.');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const pendingLoans = useMemo(
        () =>
            loans
                .filter((loan) => loan.status !== 'PAID' && getRemainingAmount(loan) > 0)
                .sort((left, right) => new Date(right.date) - new Date(left.date)),
        [getRemainingAmount, loans],
    );

    const summary = useMemo(
        () => ({
            pendingCount: pendingLoans.length,
            totalLoaned: pendingLoans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0),
            totalOutstanding: pendingLoans.reduce((sum, loan) => sum + getRemainingAmount(loan), 0),
        }),
        [getRemainingAmount, pendingLoans],
    );

    const handleAddChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddLoan = async (event) => {
        event.preventDefault();

        const amount = Number(formData.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
            error('Invalid amount', 'Enter a valid loan amount greater than zero.');
            return;
        }

        try {
            setSubmitting(true);

            const response = await fetch('http://localhost:8089/loan/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    personName: formData.personName.trim(),
                    amount,
                    paidAmount: 0,
                    status: 'PENDING',
                    date: formData.date,
                    note: formData.note.trim(),
                }),
            });

            if (response.status === 401) {
                navigate('/');
                return;
            }

            if (!response.ok) {
                throw new Error('Loan creation failed');
            }

            await fetchLoans();
            setFormData(initialForm);
            success('Loan added', 'The loan has been saved successfully.');
        } catch (err) {
            error('Unable to add loan', err.message || 'Something went wrong while saving.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentChange = (loanId, value) => {
        setPaymentInputs((prev) => ({
            ...prev,
            [loanId]: value,
        }));
    };

    const handlePayLoan = async (loan) => {
        const rawValue = paymentInputs[loan.id] ?? '';
        const amount = Number(rawValue);
        const remainingAmount = getRemainingAmount(loan);

        if (!Number.isFinite(amount) || amount <= 0) {
            error('Invalid payment', 'Enter a valid payment amount greater than zero.');
            return;
        }

        if (amount > remainingAmount) {
            error('Payment too high', `Payment cannot exceed ${currencyFormatter.format(remainingAmount)}.`);
            return;
        }

        try {
            setPayingLoanId(loan.id);

            const response = await fetch(
                `http://localhost:8089/loan/update/${loan.id}?amount=${encodeURIComponent(amount)}`,
                {
                    method: 'PUT',
                    credentials: 'include',
                },
            );

            if (response.status === 401) {
                navigate('/');
                return;
            }

            if (!response.ok) {
                throw new Error('Loan payment update failed');
            }

            const updatedLoan = await readJsonIfPresent(response);
            const nextPaidAmount = Number(updatedLoan?.paidAmount ?? Number(loan.paidAmount || 0) + amount);
            const nextAmount = Number(updatedLoan?.amount ?? (loan.amount || 0));
            const nextRemainingAmount = Math.max(nextAmount - nextPaidAmount, 0);
            const nextStatus = updatedLoan?.status ?? (nextRemainingAmount === 0 ? 'PAID' : 'PARTIAL');

            setLoans((prev) =>
                prev.map((item) =>
                    item.id === loan.id
                        ? {
                            ...item,
                            ...updatedLoan,
                            amount: nextAmount,
                            paidAmount: nextPaidAmount,
                            status: nextStatus,
                        }
                        : item,
                ),
            );
            setPaymentInputs((prev) => ({
                ...prev,
                [loan.id]: '',
            }));
            success('Payment recorded', 'The loan balance has been updated.');
        } catch (err) {
            error('Unable to update payment', err.message || 'Something went wrong while updating.');
        } finally {
            setPayingLoanId(null);
        }
    };

    if (loading) return <p className="loading-text">Loading loans...</p>;
    if (pageError) return <p className="error-text">Error: {pageError}</p>;

    return (
        <div className="transactions-container loan-shell">
            <div className="section-header">
                <div>
                    <p className="section-kicker">Loans</p>
                    <h2 className="section-title">Money you lent</h2>
                </div>
            </div>

            <div className="stat-grid loan-stat-grid">
                <div className="stat-card">
                    <span>Pending Loans</span>
                    <strong>{summary.pendingCount}</strong>
                </div>
                <div className="stat-card">
                    <span>Total Loaned</span>
                    <strong>{currencyFormatter.format(summary.totalLoaned)}</strong>
                </div>
                <div className="stat-card">
                    <span>Outstanding</span>
                    <strong>{currencyFormatter.format(summary.totalOutstanding)}</strong>
                </div>
            </div>

            <div className="loan-form-card">
                <div className="loan-form-header">
                    <h3>Add new loan</h3>
                    <p>Track who owes you money and how much is still pending.</p>
                </div>

                <form className="loan-form" onSubmit={handleAddLoan}>
                    <div className="loan-form-grid">
                        <label className="loan-field">
                            <span>Person name</span>
                            <input
                                type="text"
                                name="personName"
                                value={formData.personName}
                                onChange={handleAddChange}
                                placeholder="e.g. Rahul"
                                required
                            />
                        </label>

                        <label className="loan-field">
                            <span>Amount</span>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleAddChange}
                                min="0.01"
                                step="0.01"
                                placeholder="0.00"
                                required
                            />
                        </label>

                        <label className="loan-field">
                            <span>Date</span>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleAddChange}
                                required
                            />
                        </label>
                    </div>

                    <label className="loan-field">
                        <span>Note</span>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleAddChange}
                            placeholder="Optional reason or reminder"
                        />
                    </label>

                    <div className="loan-form-actions">
                        <button className="btn-save" disabled={submitting} type="submit">
                            {submitting ? 'Saving...' : 'Add Loan'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="section-header loan-list-header">
                <div>
                    <p className="section-kicker">Pending</p>
                    <h3 className="loan-subtitle">Pending loans</h3>
                </div>
            </div>

            {pendingLoans.length ? (
                <div className="table-wrapper">
                    <table className="transactions-table loan-table">
                        <thead>
                            <tr>
                                <th>Person</th>
                                <th>Loaned</th>
                                <th>Paid</th>
                                <th>Remaining</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Note</th>
                                <th>Pay</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingLoans.map((loan) => {
                                const remainingAmount = getRemainingAmount(loan);
                                const paymentValue = paymentInputs[loan.id] ?? '';
                                const paymentNumber = Number(paymentValue);
                                const isPaymentValid =
                                    paymentValue !== '' &&
                                    Number.isFinite(paymentNumber) &&
                                    paymentNumber > 0 &&
                                    paymentNumber <= remainingAmount;

                                return (
                                    <tr key={loan.id}>
                                        <td>
                                            <strong>{loan.personName}</strong>
                                        </td>
                                        <td>{currencyFormatter.format(loan.amount)}</td>
                                        <td>{currencyFormatter.format(loan.paidAmount || 0)}</td>
                                        <td className="loan-remaining">
                                            {currencyFormatter.format(remainingAmount)}
                                        </td>
                                        <td>{new Date(loan.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${loan.status === 'PARTIAL' ? 'warning' : ''}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td className="loan-note-cell">{loan.note || '-'}</td>
                                        <td>
                                            <div className="loan-pay-box">
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    max={remainingAmount}
                                                    value={paymentValue}
                                                    onChange={(event) => handlePaymentChange(loan.id, event.target.value)}
                                                    placeholder="0.00"
                                                />
                                                <button
                                                    className="loan-pay-button"
                                                    disabled={!isPaymentValid || payingLoanId === loan.id}
                                                    onClick={() => handlePayLoan(loan)}
                                                    type="button"
                                                >
                                                    {payingLoanId === loan.id ? 'Saving...' : 'Pay'}
                                                </button>
                                            </div>
                                            {paymentValue !== '' && !isPaymentValid && (
                                                <small className="loan-inline-error">
                                                    Enter an amount up to {currencyFormatter.format(remainingAmount)}.
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="no-data">No pending loans found.</p>
            )}
        </div>
    );
};

export default Loan;
