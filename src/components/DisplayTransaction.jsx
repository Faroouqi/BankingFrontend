import React, { useEffect, useState } from "react";
import "../css/DisplayTransaction.css";
import Budgets from "./Budgets.jsx";

const ITEMS_PER_PAGE = 9;

const DisplayTransaction = ({ filter }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("summary"); // summary or details
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState(null);
    const year = new Date().getFullYear();
    let [overBudget,setOverBudget] = useState(0);

    useEffect(() => {
        async function fetchData() {
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
    }, [year]);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            setError(null);

            try {
                let url = "";
                const currentMonth = new Date().getMonth() + 1;
                if (filter === "1") {
                    url = `http://localhost:8089/transactions/search?id=1&date=${currentMonth}`;
                } else if (filter === "2") {
                    url = `http://localhost:8089/transactions/search?id=2`;
                } else if (filter === "3") {
                    url = `http://localhost:8089/transactions/search?id=3&date=1&enddate=12`;
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
                // console.log(data);
                setTransactions(data);
                if (filter === "1") {
                    setViewMode("details");
                    setSelectedMonth(currentMonth - 1); // ✅ make it zero-based
                } else {
                    setViewMode("summary");
                    setSelectedMonth(null);
                }
                setCurrentPage(1);
                // setSelectedMonth(null);
            } catch (err) {
                setError(err.message);
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [filter]);

    // Group transactions by month
    const groupByMonth = () => {
        if (!transactions?.length || !data?.length) return [];

        const groups = {};

        transactions.forEach((txn) => {
            const monthNum = new Date(txn.date).getMonth() + 1; // 1-12
            const year = new Date(txn.date).getFullYear();
            const key = `${year}-${monthNum}`;

            const budgetObj = data.find((b) => Number(b.month) === monthNum);

            if (!groups[key]) {
                groups[key] = {
                    income: 0,
                    expense: 0,
                    balance: 0,
                    month: monthNum,
                    year,
                    budgetAmount: budgetObj ? budgetObj.budgetAmount : 0
                };
            }

            if (txn.type === "INCOME") {
                groups[key].income += txn.amount;
            } else if (txn.type === "EXPENSE") {
                groups[key].expense += txn.amount;
            }

            // Balance = Income - Expense
            groups[key].balance = groups[key].income - groups[key].expense;

            // Compare only expense with budget
            const spent = groups[key].expense;
            const budget = groups[key].budgetAmount;
            groups[key].status = budget > 0
                ? (spent > budget ? "Over Budget" : "Within Budget")
                : "No Budget";
        });

        return Object.values(groups).sort((a, b) => b.month - a.month);
    }


        const filteredTransactions = transactions.filter((txn) => {
        if (selectedMonth === null) return true;
        const month = new Date(txn.date).getMonth();
        return month === selectedMonth;
    });

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    const paginatedTransactions = transactions
        .filter((txn) => {
            if (selectedMonth === null) return true;
            const month = new Date(txn.date).getMonth(); // Match selected month
            return month === selectedMonth;
        })
        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    if (loading) return <p className="loading-text">Loading transactions...</p>;
    if (error) return <p className="error-text">Error: {error}</p>;

    if (viewMode === "summary") {
        const grouped = groupByMonth();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // calculate total spent across months
        const totalSpent = grouped.reduce((sum, g) => sum + g.expense, 0);
        const totalbudget = grouped.reduce((sum, g) => sum + g.budgetAmount, 0);

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

                {/* show overall total spent */}
                {/*<h3 className="overall-total">Total Spent (All Months): ₹{totalSpent}</h3>*/}

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

                {paginatedTransactions?.length > 0 ? (
                    <table className="transactions-table">
                        <thead>
                        <tr>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Amount (₹)</th>
                            <th>Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedTransactions.map((txn, index) => (
                            <tr key={index} className={txn.type.toLowerCase()}>
                                <td className="txn-type">{txn.type}</td>
                                <td>{txn.category}</td>
                                <td>{txn.amount}</td>
                                <td>{txn.date}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-data">No transactions found</p>
                )}

                {filteredTransactions?.length >= ITEMS_PER_PAGE && (
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

};

export default DisplayTransaction;
