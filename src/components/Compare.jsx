import { useEffect, useMemo, useState } from 'react';
import '../css/Compare.css';

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

const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

const buildSummary = (transactions) => {
    const summary = {
        income: 0,
        expense: 0,
        goals: 0,
        balance: 0,
        transactionsCount: transactions.length,
    };

    transactions.forEach((transaction) => {
        const amount = Number(transaction.amount || 0);

        if (transaction.type === 'INCOME') summary.income += amount;
        if (transaction.type === 'EXPENSE') summary.expense += amount;
        if (transaction.type === 'GOAL') summary.goals += amount;
    });

    summary.balance = summary.income - summary.expense - summary.goals;
    return summary;
};

const groupByCategory = (transactions) => {
    const grouped = {};

    transactions.forEach((transaction) => {
        const category = transaction.category?.trim() || 'Uncategorized';
        grouped[category] = (grouped[category] || 0) + Number(transaction.amount || 0);
    });

    return grouped;
};

const Compare = () => {
    const currentMonth = new Date().getMonth() + 1;
    const initialPreviousMonth = currentMonth > 1 ? currentMonth - 1 : currentMonth;
    const [transactions1, setTransactions1] = useState([]);
    const [transactions2, setTransactions2] = useState([]);
    const [month1, setMonth1] = useState(initialPreviousMonth);
    const [month2, setMonth2] = useState(currentMonth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const monthOptions = useMemo(
        () =>
            Array.from({ length: currentMonth }, (_, index) => ({
                value: index + 1,
                label: monthLabels[index],
            })),
        [currentMonth],
    );

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError(null);
            setTransactions1([]);
            setTransactions2([]);

            try {
                const [response1, response2] = await Promise.all([
                    fetch(`http://localhost:8089/transactions/search?id=1&date=${month1}`, {
                        method: 'GET',
                        credentials: 'include',
                    }),
                    fetch(`http://localhost:8089/transactions/search?id=1&date=${month2}`, {
                        method: 'GET',
                        credentials: 'include',
                    }),
                ]);

                if (!response1.ok) {
                    throw new Error(await response1.text());
                }

                if (!response2.ok) {
                    throw new Error(await response2.text());
                }

                const [result1, result2] = await Promise.all([
                    response1.json(),
                    response2.json(),
                ]);

                setTransactions1(Array.isArray(result1) ? result1 : []);
                setTransactions2(Array.isArray(result2) ? result2 : []);
            } catch (err) {
                setError(err.message || 'Unable to load comparison data.');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [month1, month2]);

    const summary1 = useMemo(() => buildSummary(transactions1), [transactions1]);
    const summary2 = useMemo(() => buildSummary(transactions2), [transactions2]);

    const categoryRows = useMemo(() => {
        const categories1 = groupByCategory(transactions1);
        const categories2 = groupByCategory(transactions2);
        const allCategories = Array.from(
            new Set([...Object.keys(categories1), ...Object.keys(categories2)]),
        );

        return allCategories
            .map((category) => {
                const amount1 = categories1[category] || 0;
                const amount2 = categories2[category] || 0;

                return {
                    category,
                    amount1,
                    amount2,
                    difference: amount2 - amount1,
                };
            })
            .sort((left, right) => Math.abs(right.difference) - Math.abs(left.difference));
    }, [transactions1, transactions2]);

    const comparisonCards = [
        {
            title: 'Income',
            firstValue: summary1.income,
            secondValue: summary2.income,
        },
        {
            title: 'Expense',
            firstValue: summary1.expense,
            secondValue: summary2.expense,
        },
        {
            title: 'Goal Savings',
            firstValue: summary1.goals,
            secondValue: summary2.goals,
        },
        {
            title: 'Net Balance',
            firstValue: summary1.balance,
            secondValue: summary2.balance,
        },
        {
            title: 'Transactions',
            firstValue: summary1.transactionsCount,
            secondValue: summary2.transactionsCount,
            isCount: true,
        },
    ];

    return (
        <div className="transactions-container compare-shell">
            <div className="section-header">
                <div>
                    <p className="section-kicker">Comparison</p>
                    <h2 className="section-title">Month vs month comparison</h2>
                </div>
            </div>

            <div className="compare-controls">
                <div className="compare-control-card">
                    <label htmlFor="month-one">First month</label>
                    <select
                        id="month-one"
                        value={month1}
                        onChange={(event) => setMonth1(Number(event.target.value))}
                    >
                        {monthOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="compare-control-card">
                    <label htmlFor="month-two">Second month</label>
                    <select
                        id="month-two"
                        value={month2}
                        onChange={(event) => setMonth2(Number(event.target.value))}
                    >
                        {monthOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <p className="loading-text">Loading comparison...</p>}
            {error && <p className="error-text">Error: {error}</p>}

            {!loading && !error && (
                <>
                    <div className="compare-grid">
                        {comparisonCards.map((card) => {
                            const difference = card.secondValue - card.firstValue;
                            const secondMonthBetter = difference > 0;

                            return (
                                <div key={card.title} className="compare-card">
                                    <div className="compare-card-header">
                                        <h3>{card.title}</h3>
                                        <span className={difference === 0 ? 'compare-chip neutral' : secondMonthBetter ? 'compare-chip positive' : 'compare-chip negative'}>
                                            {difference === 0
                                                ? 'No change'
                                                : `${secondMonthBetter ? '+' : ''}${card.isCount ? difference : currencyFormatter.format(difference)}`}
                                        </span>
                                    </div>

                                    <div className="compare-card-values">
                                        <div>
                                            <span>{monthLabels[month1 - 1]}</span>
                                            <strong>{card.isCount ? card.firstValue : currencyFormatter.format(card.firstValue)}</strong>
                                        </div>
                                        <div>
                                            <span>{monthLabels[month2 - 1]}</span>
                                            <strong>{card.isCount ? card.secondValue : currencyFormatter.format(card.secondValue)}</strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="compare-table-card">
                        <div className="compare-table-header">
                            <h3>Category comparison</h3>
                            <p>
                                Compare category totals between {monthLabels[month1 - 1]} and {monthLabels[month2 - 1]}.
                            </p>
                        </div>

                        {categoryRows.length ? (
                            <div className="table-wrapper">
                                <table className="transactions-table compare-table">
                                    <thead>
                                        <tr>
                                            <th>Category</th>
                                            <th>{monthLabels[month1 - 1]}</th>
                                            <th>{monthLabels[month2 - 1]}</th>
                                            <th>Difference</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryRows.map((row) => (
                                            <tr key={row.category}>
                                                <td>{row.category}</td>
                                                <td>{currencyFormatter.format(row.amount1)}</td>
                                                <td>{currencyFormatter.format(row.amount2)}</td>
                                                <td className={row.difference === 0 ? '' : row.difference > 0 ? 'compare-up' : 'compare-down'}>
                                                    {row.difference > 0 ? '+' : ''}
                                                    {currencyFormatter.format(row.difference)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="no-data">No transactions available for the selected months.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Compare;
