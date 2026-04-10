import React, { useEffect, useState, useRef } from "react";
import "../css/DisplayTransaction.css";
import Chart from "chart.js/auto";
import UpdateTransaction from './UpdateTransaction';
import DeleteTransaction from './DeleteTransaction';
import DisplayGoalTransaction from "./DisplayGoalTransaction";
import DisplaySpendingChart from "./DisplaySpendingChart";

const ITEMS_PER_PAGE = 8;

const DisplayTransaction = ({ filter, onUpdate }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("summary");
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState(null);
    const year = new Date().getMonth() + 1;

    const [detailsView, setDetailsView] = useState("table");
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    // ADD these states at top
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedTxns, setSelectedTxns] = useState(new Set());

    // Fetch budgets for the current month
    const handleRowClick = (txnId) => {
    if (!selectionMode) {
        setSelectionMode(true);
        setSelectedTxns(new Set([txnId]));
    } else {
        toggleSelection(txnId);
    }
};

const toggleSelection = (txnId) => {
    setSelectedTxns(prev => {
        const updated = new Set(prev);
        if (updated.has(txnId)) {
            updated.delete(txnId);
        } else {
            updated.add(txnId);
        }
        return updated;
    });
};
const handleDelete = async () => {
    console.log("Deleting transactions with IDs:", Array.from(selectedTxns));

    await DeleteTransaction(selectedTxns, setTransactions , onUpdate);
};
    useEffect(() => {
        async function fetchData() {
            console.log("Fetching budget data for month:", year);
            try {
                const res = await fetch(`http://localhost:8089/budgets/${year}`, {
                    credentials: 'include'
                });
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Fetch transactions depending on filter
    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError(null);

            try {
                let url = "";
                const currentMonth = new Date().getMonth() + 1;
                const lastSixMonths = Math.max(1, currentMonth - 5);
                if (filter === "1") {
                    url = `http://localhost:8089/transactions/search?id=1&date=${currentMonth}`;
                } else if (filter === "2") {
                    url = `http://localhost:8089/transactions/search?id=2`;
                } else if (filter === "3") {
                    url = `http://localhost:8089/transactions/search?id=3&date=${lastSixMonths}&enddate=${currentMonth}`;
                } else {
                    setTransactions([]);
                    setLoading(false);
                    return;
                }

                const response = await fetch(url, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`HTTP error! Status: ${response.status} - ${text}`);
                }

                const data = await response.json();
                setTransactions(Array.isArray(data) ? data : []);
                if (filter === "1") {
                    setViewMode("details");
                    setSelectedMonth(currentMonth - 1);
                    setDetailsView("table");
                } else {
                    setViewMode("summary");
                    setSelectedMonth(null);
                }
                setCurrentPage(1);
            } catch (err) {
                setError(err.message);
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [filter]);

    // Group transactions by month for summary view
    const groupByMonth = () => {
        if (!transactions?.length || !data?.length) return [];

        const groups = {};

        transactions.forEach((txn) => {
            const monthNum = new Date(txn.date).getMonth() + 1;
            const txYear = new Date(txn.date).getFullYear();
            const key = `${txYear}-${monthNum}`;
            // console.log("Processing transaction for grouping:", txn.amount,"name:", txn.category);
            const budgetObjs = data.filter((b) => Number(b.month) === monthNum);
            const totalBudgetAmount = budgetObjs.reduce((sum, b) => sum + (Number(b.budgetAmount) || 0), 0);

            if (!groups[key]) {
                groups[key] = {
                    income: 0,
                    expense: 0,
                    goal: 0,
                    balance: 0,
                    month: monthNum,
                    year: txYear,
                    budgetAmount: totalBudgetAmount
                };
            }

            if (txn.type === "INCOME") {
                groups[key].income += Number(txn.amount ?? 0);
            } else if (txn.type === "EXPENSE"){
                groups[key].expense += Number(txn.amount ?? 0);
            }else{
                groups[key].goal += Number(txn.amount ?? 0);
            }
            
            groups[key].balance = groups[key].income - groups[key].expense;

            const spent = groups[key].expense;
            const budget = groups[key].budgetAmount;
            groups[key].status = budget > 0
                ? (spent > budget ? "Over Budget" : "Within Budget")
                : "No Budget";
        });

        return Object.values(groups).sort((a, b) => b.month - a.month);
    };

    const filteredTransactions = React.useMemo(() => 
        transactions.filter((txn) => {
            if (selectedMonth === null) return true;
            const month = new Date(txn.date).getMonth();
            return month === selectedMonth;
        }), 
    [transactions, selectedMonth]);

    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));

    const paginatedTransactions = filteredTransactions
        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getCategorySummary = () => {
        const summary = {};
        const monthNumber = selectedMonth !== null ? selectedMonth + 1 : null;
        filteredTransactions.forEach((txn) => {
            const cat = txn.category?.trim() || 'Uncategorized';
            if (!summary[cat]) {
                summary[cat] = { spent: 0, income: 0, budget: 0 };
            }
            const amt = Number(txn.amount ?? 0);
            if (txn.type === 'GOAL') summary[cat].spent += amt;
            if (txn.type === 'EXPENSE') summary[cat].spent += amt;
            if (txn.type === 'INCOME') summary[cat].income += amt;
        });

        if (Array.isArray(data) && monthNumber) {
            data.forEach((budget) => {
                if (!budget || !budget.category || Number(budget.month) !== monthNumber) return;

                const cat = budget.category?.trim() || 'Uncategorized';
                if (!summary[cat]) summary[cat] = { spent: 0, income: 0, budget: 0 };
                summary[cat].budget += Number(budget.budgetAmount ?? 0);
            });
        }

        return Object.entries(summary).map(([category, values]) => {
            const saved = Math.max(values.budget - values.spent, 0);
            return {
                category,
                spent: values.spent,
                income: values.income,
                budget: values.budget,
                saved: saved,
                status: values.budget > 0 ? (values.spent > values.budget ? 'Over Budget' : 'Within Budget') : 'No Budget'
            };
        });
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    // Chart effect
    useEffect(() => {
        if (viewMode !== "details" || detailsView !== "chart") {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
            return;
        }

        const txns = filteredTransactions || [];
        const grouped = {};
        txns.forEach(tx => {
            const key = tx.category || tx.type || "Other";
            const amount = Number(tx.amount ?? tx.value ?? 0);
            grouped[key] = (grouped[key] || 0) + (isNaN(amount) ? 0 : amount);
        });

        const labels = Object.keys(grouped);
        const dataVals = labels.map(l => grouped[l]);

        if (!labels.length) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
            return;
        }

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
            chartInstanceRef.current = null;
        }

        const colors = [
            '#6C63FF', '#FF6584', '#43E97B', '#FFD86E', '#3A8DFF', '#FFB366',
            '#8E44AD', '#2ECC71', '#E67E22', '#3498DB'
        ];

        const ctx = chartRef.current?.getContext('2d');
        if (!ctx) return;

        chartInstanceRef.current = new Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data: dataVals,
                    backgroundColor: labels.map((_, i) => colors[i % colors.length]),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12 } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const val = ctx.parsed ?? 0;
                                const total = dataVals.reduce((a, b) => a + b, 0);
                                const pct = total ? ((val / total) * 100).toFixed(1) : 0;
                                return `${ctx.label}: ₹${val} (${pct}%)`;
                            }
                        }
                    }
                },
                maintainAspectRatio: false
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [detailsView, filteredTransactions, viewMode]);

    if (loading) return <p className="loading-text">Loading transactions...</p>;
    if (error) return <p className="error-text">Error: {error}</p>;
    if (filter === "4") {
    return <DisplayGoalTransaction  onUpdate={onUpdate}/>;
}
    if (filter === "5") {
    return <DisplaySpendingChart  onUpdate={onUpdate}/>;
    }
    if (viewMode === "summary") {
        const grouped = groupByMonth();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const totalSpent = grouped.reduce((sum, g) => sum + (g.expense || 0), 0);
        const totalbudget = grouped.reduce((sum, g) => sum + (g.budgetAmount || 0), 0);

        return (
            <div className="transactions-container">
                <h2 className="section-titles">Monthly Summary</h2>
                {grouped?.length > 0 ? (
                    <div className="transactions-list">
                        {grouped.map((g, idx) => (
                            <div
                                key={idx}
                                className="transaction-card summary-card"
                                onClick={() => {
                                    setSelectedMonth(g.month - 1);
                                    setViewMode("details");
                                }}
                            >
                                <h3 className="month-title">
                                    {monthNames[g.month - 1]} {g.year}
                                </h3>
                                <div className="summary-details">
                                    <p>Total Spent: ₹ {g.expense}</p>
                                    <p>Budget: ₹ {g.budgetAmount}</p>
                                    <p>{g.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No summary data found</p>
                )}

                {filter === "3" && (
                    <div className="total-spending-summary">
                        <h3>Total Spending in the Last 6 Months:</h3>
                        <span>₹{totalSpent}</span>
                    </div>
                )}
                {filter === "2" && (
                    <div className="total-spending-summary">
                        <h3>Total Budget for This Year:</h3>
                        <span>₹{totalbudget}</span>
                    </div>
                )}
                {filter === "3" && (
                    <div className="total-spending-summary">
                        <h3>Total Budget the Last 6 Months:</h3>
                        <span>₹{totalbudget}</span>
                    </div>
                )}
                {filter === "2" && (
                    <div className="total-spending-summary">
                        <h3>Total Spending for This Year:</h3>
                        <span>₹{totalSpent}</span>
                    </div>
                )}
            </div>
        );
    }

    if (viewMode === "details") {
        return (
            <div className="transactions-container">
                <h2 className="section-title">
                    Transactions for{" "}
                    {selectedMonth !== null
                        ? new Date(year, selectedMonth).toLocaleString("default", {
                            month: "long",
                        })
                        : "Selected Month"}
                </h2>

                <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                    <button
                        className={`view-toggle ${detailsView === 'table' ? 'active' : ''}`}
                        onClick={() => setDetailsView('table')}
                    >
                        Table
                    </button>
                    <button
                        className={`view-toggle ${detailsView === 'chart' ? 'active' : ''}`}
                        onClick={() => setDetailsView('chart')}
                    >
                        Pie Chart
                    </button>
                    <button
                        className={`view-toggle ${detailsView === 'category' ? 'active' : ''}`}
                        onClick={() => setDetailsView('category')}
                    >
                        Category Summary
                    </button>
                    {selectionMode && selectedTxns.size > 0 && (
                        <button onClick={handleDelete}> 🗑 Delete </button>
                    )}
                </div>

                {detailsView === 'table' ? (
                    paginatedTransactions?.length > 0 ? (
                        <UpdateTransaction transactions={transactions} setTransactions={setTransactions}>
                            {({ renderCell }) => (
                                <>
                                    <table className="transactions-table">
                                        <thead>
                                            <tr>
                                                {selectionMode && <th
                                                onDoubleClick={()=>{
                                                    setSelectionMode(false);
                                                    setSelectedTxns(new Set());
                                                }}> Select </th>}
                                                <th>Category</th>
                                                <th>Amount (₹)</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
    {paginatedTransactions.map((txn) => (
        <tr
            key={txn.id}
            className={`${(txn.type || "").toLowerCase()} ${
                selectedTxns.has(txn.id) ? "selected-row" : ""
            }`}
            onClick={() => handleRowClick(txn.id)}
        >
            {selectionMode && (
                <td>
                    <input
                        type="checkbox"
                        checked={selectedTxns.has(txn.id)}
                        onChange={() => toggleSelection(txn.id)}
                        onClick={(e) => e.stopPropagation()}
                        
                    />
                </td>
            )}

            <td>{renderCell(txn, 'category', txn.category)}</td>
            <td>{renderCell(txn, 'amount', `₹${txn.amount}`, 'number')}</td>
            <td>{renderCell(txn, 'date', new Date(txn.date).toLocaleDateString(), 'date')}</td>
        </tr>
    ))}
</tbody>
                                    </table>
                                </>
                            )}
                        </UpdateTransaction>
                    ) : (
                        <h1 className="no-data">No transactions found</h1>
                    )
                ) : detailsView === 'chart' ? (
                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                        {filteredTransactions.length === 0 ? (
                            <div className="no-data">No transactions to display in chart</div>
                        ) : (
                            <>
                                <div style={{ flex: 1, minHeight: 320 }}>
                                    <canvas ref={chartRef} />
                                </div>
                                <div style={{ width: 260 }}>
                                    <h3 style={{ marginTop: 0 }}>Breakdown</h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {(() => {
                                            const grouped = {};
                                            filteredTransactions.forEach(tx => {
                                                const key = tx.category || tx.type || 'Other';
                                                const amount = Number(tx.amount ?? tx.value ?? 0);
                                                grouped[key] = (grouped[key] || 0) + (isNaN(amount) ? 0 : amount);
                                            });
                                            const items = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
                                            const colors = [
                                                '#6C63FF', '#FF6584', '#43E97B', '#FFD86E', '#3A8DFF', '#FFB366',
                                                '#8E44AD', '#2ECC71', '#E67E22', '#3498DB'
                                            ];
                                            return items.map(([k, v], i) => (
                                                <li key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <span style={{
                                                            width: 12, height: 12, borderRadius: 3,
                                                            background: colors[i % colors.length], display: 'inline-block'
                                                        }} />
                                                        <span style={{ fontWeight: 600 }}>{k}</span>
                                                    </div>
                                                    <div>₹{v}</div>
                                                </li>
                                            ));
                                        })()}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    (() => {
                        const categorySummary = getCategorySummary();
                        return categorySummary.length ? (
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Spent (₹)</th>
                                        <th>Budget (₹)</th>
                                        <th>Remaining Budget (₹)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categorySummary.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.category}</td>
                                            <td>{item.spent.toFixed(2)}</td>
                                            <td>{item.budget.toFixed(2)}</td>
                                            <td>{(item.budget - item.spent).toFixed(2)}</td>
                                            <td>{item.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <h1 className="no-data">No category data found</h1>
                        );
                    })()
                )}

                {detailsView === 'table' && filteredTransactions?.length >= ITEMS_PER_PAGE && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                        >
                            ⬅ Prev
                        </button>
                        <span className="page-number">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            className="page-btn"
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                        >
                            Next ➡
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default DisplayTransaction;