import { useEffect, useState } from 'react';
import '../css/SavingsTrend.css';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const SavingsTrend = () => {
    const [savingsTrend, setSavingsTrend] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

    useEffect(() => {
        const fetchSavingsTrend = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('http://localhost:8089/transactions/savings', {
                    credentials: 'include',
                });

                if (!response.ok) throw new Error('Failed to fetch savings trend');

                const data = await response.json();
                setSavingsTrend(data);
            } catch (err) {
                console.error('Error fetching savings trend:', err);
                setError('Unable to load savings trend right now.');
            } finally {
                setLoading(false);
            }
        };

        fetchSavingsTrend();
    }, []);

    const monthlySummary = savingsTrend?.monthlySummary || [];
    const currentMonth = monthlySummary[currentMonthIndex];

    return (
        <div className="transactions-container savings-trend-wrapper">
            <div className="section-header">
                <div>
                    <p className="section-kicker">Savings</p>
                    <h2 className="section-title">Savings overview</h2>
                </div>
            </div>

            {loading && <div className="summary-card"><p>Loading...</p></div>}

            {error && (
                <div className="summary-card error">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && savingsTrend && (
                <>
                    <div className="summary-top-card">
                        <h3>Total Savings Till Last Month</h3>
                        <p>{formatCurrency(savingsTrend.totalSavingsTillLastMonth)}</p>
                    </div>

                    {currentMonth ? (
                        <>
                            <div className="month-card single-month-card">
                                <h4>{currentMonth.month}</h4>
                                <div className="month-row">
                                    <span>Income:</span>
                                    <span>{formatCurrency(currentMonth.income)}</span>
                                </div>
                                <div className="month-row">
                                    <span>Expense:</span>
                                    <span>{formatCurrency(currentMonth.expense)}</span>
                                </div>
                                <div className="month-row savings-row">
                                    <span>Savings:</span>
                                    <span>{formatCurrency(currentMonth.savings)}</span>
                                </div>
                            </div>

                            <div className="pagination-controls">
                                <button
                                    onClick={() => setCurrentMonthIndex((prev) => Math.max(prev - 1, 0))}
                                    disabled={currentMonthIndex === 0}
                                    type="button"
                                >
                                    Previous
                                </button>

                                <span>
                                    {currentMonthIndex + 1} / {monthlySummary.length}
                                </span>

                                <button
                                    onClick={() => setCurrentMonthIndex((prev) => Math.min(prev + 1, monthlySummary.length - 1))}
                                    disabled={currentMonthIndex === monthlySummary.length - 1}
                                    type="button"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="summary-card info">
                            <p>No savings data available yet.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SavingsTrend;
