import { useEffect, useMemo, useRef, useState } from 'react';
import '../css/DisplayTransaction.css';
import Chart from 'chart.js/auto';
import UpdateTransaction from './UpdateTransaction';
import DeleteTransaction from './DeleteTransaction';
import DisplayGoalTransaction from './DisplayGoalTransaction';
import DisplaySpendingChart from './DisplaySpendingChart';
import SmartInsights from './SmartInsights';
import SavingsTrend from './SavingsTrend';
import Compare from './Compare';

const ITEMS_PER_PAGE = 8;
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});
const pieColors = ['#1d66d2', '#0fb38d', '#f3b63c', '#ef7b45', '#7754f6', '#d95763', '#118ab2', '#43aa8b'];

const DisplayTransaction = ({ filter, onUpdate }) => {
    const currentMonthNumber = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('summary');
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [budgets, setBudgets] = useState([]);
    const [detailsView, setDetailsView] = useState('table');
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedTxns, setSelectedTxns] = useState(new Set());
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [searchVal, setSearchVal] = useState("");
    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await fetch(`http://localhost:8089/budgets/${currentMonthNumber}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const json = await response.json();
                setBudgets(Array.isArray(json) ? json : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBudgets();
    }, [currentMonthNumber]);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError(null);
            setSelectionMode(false);
            setSelectedTxns(new Set());

            try {
                let url = '';
                const lastSixMonths = Math.max(1, currentMonthNumber - 5);

                if (filter === '1') {
                    url = `http://localhost:8089/transactions/search?id=1&date=${currentMonthNumber}`;
                } else if (filter === '2') {
                    url = 'http://localhost:8089/transactions/search?id=2';
                } else if (filter === '3') {
                    url = `http://localhost:8089/transactions/search?id=3&date=${lastSixMonths}&enddate=${currentMonthNumber}`;
                } else {
                    setTransactions([]);
                    setLoading(false);
                    return;
                }

                const response = await fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const result = await response.json();
                setTransactions(Array.isArray(result) ? result : []);
                setProducts(transactions);

                if (filter === '1') {
                    setViewMode('details');
                    setSelectedMonth(currentMonthNumber - 1);
                    setDetailsView('table');
                } else {
                    setViewMode('summary');
                    setSelectedMonth(null);
                }

                setCurrentPage(1);
            } catch (err) {
                setError(err.message || 'Unable to load transactions.');
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [currentMonthNumber, filter]);

    function handleSearchClick() {
        setProducts(paginatedTransactions);
        console.log(searchVal);
        if (searchVal === "") { setProducts(products); return; }
        const filterBySearch = products.filter((item) => {
            if (item.category.toLowerCase()
                .includes(searchVal.toLowerCase())) { return item; }
        })
        setProducts(filterBySearch);
    }
    const filteredTransactions = useMemo(
        () =>
            transactions.filter((transaction) => {
                if (selectedMonth === null) return true;
                return new Date(transaction.date).getMonth() === selectedMonth;
            }),
        [transactions, selectedMonth],
    );

    const groupedTransactions = useMemo(() => {
        if (!transactions.length) return [];

        const groups = {};

        transactions.forEach((transaction) => {
            const txDate = new Date(transaction.date);
            const month = txDate.getMonth() + 1;
            const year = txDate.getFullYear();
            const key = `${year}-${month}`;
            const monthBudget = budgets
                .filter((budget) => Number(budget.month) === month)
                .reduce((sum, budget) => sum + Number(budget.budgetAmount || 0), 0);

            if (!groups[key]) {
                groups[key] = {
                    income: 0,
                    expense: 0,
                    goal: 0,
                    month,
                    year,
                    budgetAmount: monthBudget,
                };
            }

            const amount = Number(transaction.amount || 0);
            if (transaction.type === 'INCOME') groups[key].income += amount;
            if (transaction.type === 'EXPENSE') groups[key].expense += amount;
            if (transaction.type === 'GOAL') groups[key].goal += amount;
        });

        return Object.values(groups)
            .map((entry) => ({
                ...entry,
                balance: entry.income - entry.expense,
                status:
                    entry.budgetAmount > 0
                        ? entry.expense > entry.budgetAmount
                            ? 'Over Budget'
                            : 'Within Budget'
                        : 'No Budget',
            }))
            .sort((left, right) => {
                if (left.year !== right.year) return right.year - left.year;
                return right.month - left.month;
            });
    }, [budgets, transactions]);

    const categorySummary = useMemo(() => {
        const summary = {};
        const monthNumber = selectedMonth !== null ? selectedMonth + 1 : null;

        filteredTransactions.forEach((transaction) => {
            const category = transaction.category?.trim() || 'Uncategorized';
            if (!summary[category]) {
                summary[category] = { spent: 0, income: 0, budget: 0 };
            }

            const amount = Number(transaction.amount || 0);
            if (transaction.type === 'INCOME') summary[category].income += amount;
            if (transaction.type === 'EXPENSE' || transaction.type === 'GOAL') {
                summary[category].spent += amount;
            }
        });

        if (monthNumber) {
            budgets.forEach((budget) => {
                if (!budget?.category || Number(budget.month) !== monthNumber) return;
                const category = budget.category.trim() || 'Uncategorized';
                if (!summary[category]) {
                    summary[category] = { spent: 0, income: 0, budget: 0 };
                }
                summary[category].budget += Number(budget.budgetAmount || 0);
            });
        }

        return Object.entries(summary).map(([category, values]) => ({
            category,
            spent: values.spent,
            income: values.income,
            budget: values.budget,
            remaining: values.budget - values.spent,
            status: values.budget > 0 ? (values.spent > values.budget ? 'Over Budget' : 'Within Budget') : 'No Budget',
        }));
    }, [budgets, filteredTransactions, selectedMonth]);

    const chartBreakdown = useMemo(() => {
        const grouped = {};

        filteredTransactions.forEach((transaction) => {
            const key = transaction.category || transaction.type || 'Other';
            grouped[key] = (grouped[key] || 0) + Number(transaction.amount || 0);
        });

        return Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    }, [filteredTransactions]);

    const searchedTransactions = useMemo(() => {
    if (!searchVal.trim()) return filteredTransactions;
    return filteredTransactions.filter(item =>
        item.category?.toLowerCase().includes(searchVal.toLowerCase())
    );
}, [filteredTransactions, searchVal]);

    const totalPages = Math.max(1, Math.ceil(searchedTransactions.length / ITEMS_PER_PAGE));
const paginatedTransactions = searchedTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
);
    // const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
    // const paginatedTransactions = filteredTransactions.slice(
    //     (currentPage - 1) * ITEMS_PER_PAGE,
    //     currentPage * ITEMS_PER_PAGE,
    // );

    const summaryMetrics = useMemo(() => ({
        totalSpent: groupedTransactions.reduce((sum, item) => sum + item.expense, 0),
        totalBudget: groupedTransactions.reduce((sum, item) => sum + item.budgetAmount, 0),
        totalIncome: groupedTransactions.reduce((sum, item) => sum + item.income, 0),
    }), [groupedTransactions]);

    const handleRowClick = (transactionId) => {
        if (!selectionMode) {
            setSelectionMode(true);
            setSelectedTxns(new Set([transactionId]));
            return;
        }

        setSelectedTxns((prev) => {
            const updated = new Set(prev);
            if (updated.has(transactionId)) {
                updated.delete(transactionId);
            } else {
                updated.add(transactionId);
            }
            return updated;
        });
    };

    const handleDelete = async () => {
        const deleted = await DeleteTransaction(selectedTxns, setTransactions);
        if (deleted) {
            setSelectionMode(false);
            setSelectedTxns(new Set());
        }
    };

    useEffect(() => {
        if (viewMode !== 'details' || detailsView !== 'chart') {
            chartInstanceRef.current?.destroy();
            chartInstanceRef.current = null;
            return undefined;
        }

        if (!chartBreakdown.length) {
            chartInstanceRef.current?.destroy();
            chartInstanceRef.current = null;
            return undefined;
        }

        chartInstanceRef.current?.destroy();
        const context = chartRef.current?.getContext('2d');
        if (!context) return undefined;

        chartInstanceRef.current = new Chart(context, {
            type: 'doughnut',
            data: {
                labels: chartBreakdown.map(([label]) => label),
                datasets: [
                    {
                        data: chartBreakdown.map(([, value]) => value),
                        backgroundColor: chartBreakdown.map((_, index) => pieColors[index % pieColors.length]),
                        borderColor: '#ffffff',
                        borderWidth: 4,
                    },
                ],
            },
            options: {
                cutout: '64%',
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed ?? 0;
                                const total = chartBreakdown.reduce((sum, [, itemValue]) => sum + itemValue, 0);
                                const share = total ? ((value / total) * 100).toFixed(1) : '0';
                                return `${context.label}: ${currencyFormatter.format(value)} (${share}%)`;
                            },
                        },
                    },
                },
            },
        });

        return () => {
            chartInstanceRef.current?.destroy();
            chartInstanceRef.current = null;
        };
    }, [chartBreakdown, detailsView, viewMode]);

    if (loading) return <p className="loading-text">Loading transactions...</p>;
    if (error) return <p className="error-text">Error: {error}</p>;
    if (filter === '4') return <DisplayGoalTransaction onUpdate={onUpdate} />;
    if (filter === '5') return <DisplaySpendingChart />;
    if (filter === '6') return <SavingsTrend />;
    if (filter === '7') return <Compare />;

    if (viewMode === 'summary') {
        return (
            <div className="transactions-container">
                <div className="section-header">
                    <div>
                        <p className="section-kicker">Overview</p>
                        <h2 className="section-title">Monthly summary</h2>
                    </div>
                </div>

                <div className="stat-grid">
                    <div className="stat-card">
                        <span>Total Income</span>
                        <strong>{currencyFormatter.format(summaryMetrics.totalIncome)}</strong>
                    </div>
                    <div className="stat-card">
                        <span>Total Spent</span>
                        <strong>{currencyFormatter.format(summaryMetrics.totalSpent)}</strong>
                    </div>
                    <div className="stat-card">
                        <span>Total Budget</span>
                        <strong>{currencyFormatter.format(summaryMetrics.totalBudget)}</strong>
                    </div>
                </div>

                {groupedTransactions.length ? (
                    <div className="summary-grid">
                        {groupedTransactions.map((group) => (
                            <button
                                key={`${group.year}-${group.month}`}
                                type="button"
                                className="summary-card"
                                onClick={() => {
                                    setSelectedMonth(group.month - 1);
                                    setViewMode('details');
                                }}
                            >
                                <div className="summary-card-top">
                                    <h3>{monthNames[group.month - 1]} {group.year}</h3>
                                    <span className={group.status === 'Over Budget' ? 'status-badge danger' : 'status-badge success'}>
                                        {group.status}
                                    </span>
                                </div>
                                <div className="summary-metrics">
                                    <p><span>Spent</span><strong>{currencyFormatter.format(group.expense)}</strong></p>
                                    <p><span>Budget</span><strong>{currencyFormatter.format(group.budgetAmount)}</strong></p>
                                    <p><span>Balance</span><strong>{currencyFormatter.format(group.balance)}</strong></p>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No summary data found.</p>
                )}
            </div>
        );
    }

    return (
        <div className="transactions-container">
            <div className="section-header">
                <div>
                    <p className="section-kicker">Transactions</p>
                    <h2 className="section-title">
                        {selectedMonth !== null
                            ? `${monthNames[selectedMonth]} ${currentYear}`
                            : 'Selected Month'}
                    </h2>
                </div>
                <button
                    className="back-button"
                    type="button"
                    onClick={() => {
                        setViewMode('summary');
                        setSelectedMonth(null);
                        setSelectionMode(false);
                        setSelectedTxns(new Set());
                    }}
                >
                    Back to Summary
                </button>
            </div>

            <div className="toolbar">
                <div className="view-toggle-group">
                    <button className={detailsView === 'table' ? 'view-toggle active' : 'view-toggle'} onClick={() => setDetailsView('table')} type="button">
                        Table
                    </button>
                    <button className={detailsView === 'chart' ? 'view-toggle active' : 'view-toggle'} onClick={() => setDetailsView('chart')} type="button">
                        Chart
                    </button>
                    <button className={detailsView === 'category' ? 'view-toggle active' : 'view-toggle'} onClick={() => setDetailsView('category')} type="button">
                        Categories
                    </button>
                    <button className={detailsView === 'insights' ? 'view-toggle active' : 'view-toggle'} onClick={() => setDetailsView('insights')} type="button">
                        Insights
                    </button>
                            {detailsView === 'table' && (
                                <form className="d-flex" role="search" id="searchForm">
                                    <input
                                        className="form-control me-2 border border-dark"
                                        type="search"
                                        placeholder="Search"
                                        aria-label="Search"
    onChange={e => setSearchVal(e.target.value)}
    onKeyDown={e => e.key === "Enter" && handleSearchClick()}
  />
</form>)}
                {/* <BsSearch  /> */}
                </div>

                {selectionMode && selectedTxns.size > 0 && (
                    <button className="delete-button" onClick={handleDelete} type="button">
                        Delete Selected
                    </button>
                )}
            </div>

            {detailsView === 'table' && (
                paginatedTransactions.length ? (
                    <UpdateTransaction setTransactions={setTransactions}>
                        {({ renderCell }) => (
                            <>
                                <div className="table-wrapper">
                                    <table className="transactions-table">
                                        <thead>
                                            <tr>
                                                {selectionMode && (
                                                    <th
                                                        onDoubleClick={() => {
                                                            setSelectionMode(false);
                                                            setSelectedTxns(new Set());
                                                        }}
                                                    >
                                                        Select
                                                    </th>
                                                )}
                                                <th>Category</th>
                                                <th>Amount</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedTransactions.map((transaction) => (
                                                <tr
                                                    key={transaction.id}
                                                    className={`${(transaction.type || '').toLowerCase()} ${selectedTxns.has(transaction.id) ? 'selected-row' : ''}`}
                                                    onClick={() => handleRowClick(transaction.id)}
                                                >
                                                    {selectionMode && (
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTxns.has(transaction.id)}
                                                                onChange={() => handleRowClick(transaction.id)}
                                                                onClick={(event) => event.stopPropagation()}
                                                            />
                                                        </td>
                                                    )}
                                                    <td>{renderCell(transaction, 'category', transaction.category || 'Uncategorized')}</td>
                                                    <td>{renderCell(transaction, 'amount', currencyFormatter.format(Number(transaction.amount || 0)), 'number')}</td>
                                                    <td>{renderCell(transaction, 'date', new Date(transaction.date).toLocaleDateString(), 'date')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {filteredTransactions.length >= ITEMS_PER_PAGE && (
                                    <div className="pagination">
                                        <button className="page-btn" onClick={() => setCurrentPage((prev) => prev - 1)} disabled={currentPage === 1} type="button">
                                            Previous
                                        </button>
                                        <span className="page-number">{currentPage} / {totalPages}</span>
                                        <button className="page-btn" onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage === totalPages} type="button">
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </UpdateTransaction>
                ) : (
                    <p className="no-data">No transactions found for this month.</p>
                )
            )}

            {detailsView === 'chart' && (
                chartBreakdown.length ? (
                    <div className="chart-layout">
                        <div className="chart-panel">
                            <canvas ref={chartRef} />
                        </div>

                        <div className="breakdown-panel">
                            <h3>Breakdown</h3>
                            <ul>
                                {chartBreakdown.map(([label, value], index) => (
                                    <li key={label}>
                                        <div>
                                            <span className="color-dot" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
                                            <strong>{label}</strong>
                                        </div>
                                        <span>{currencyFormatter.format(value)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p className="no-data">No transactions to display in chart view.</p>
                )
            )}

            {detailsView === 'category' && (
                categorySummary.length ? (
                    <div className="table-wrapper">
                        <table className="transactions-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Spent</th>
                                    <th>Budget</th>
                                    <th>Remaining</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categorySummary.map((item) => ( item.income === 0 &&
                                    <tr key={item.category}>
                                        <td>{item.category}</td>
                                        <td>{currencyFormatter.format(item.spent)}</td>
                                        <td>{currencyFormatter.format(item.budget)}</td>
                                        <td>{currencyFormatter.format(item.remaining)}</td>
                                        <td>
                                            <span className={item.status === 'Over Budget' ? 'status-badge danger' : 'status-badge success'}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="no-data">No category data found.</p>
                )
            )}

            {detailsView === 'insights' && (
                <div className="insights-panel">
                    <SmartInsights month={selectedMonth} />
                </div>
            )}
        </div>
    );
};

export default DisplayTransaction;
