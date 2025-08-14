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
    const [overBudget,setOverBudget] = useState("Savings")
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
                setTransactions(data);
                setViewMode("summary");
                setCurrentPage(1);
                setSelectedMonth(null);
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
        const groups = {};

        transactions.forEach((txn) => {
            const monthNum = new Date(txn.date).getMonth() + 1; // 1-12
            const year = new Date(txn.date).getFullYear();
            const key = `${year}-${monthNum}`;

            // Now safe to compare as numbers
            const budgetObj = data.find((b) => Number(b.month) === monthNum);

            if (!groups[key]) {
                groups[key] = {
                    total: 0,
                    month: monthNum,
                    year,
                    budgetAmount: budgetObj ? budgetObj.budgetAmount : 0
                };
            }

            groups[key].total += txn.amount;
            const spent = groups[key].total;
            const budget = groups[key].budgetAmount;
            groups[key].status = budget > 0
                ? (spent > budget ? "Over Budget" : "Within Budget")
                : "No Budget";
        });
        return Object.values(groups).sort((a, b) => b.month - a.month);
    };


    // Pagination for detail mode
    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
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

    // Render Summary Mode:
    if (viewMode === "summary") {
        const grouped = groupByMonth();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return (
            <div className="transactions-container">
                <h2 className="section-title">Monthly Summary</h2>
                <div className="transactions-list">
                    {grouped.map((g, idx) => (
                        <div
                            key={idx}
                            className="transaction-card summary-card"
                            onClick={() => {
                                setSelectedMonth(g.month);
                                setViewMode("details");
                            }}
                        >
                            <h3>{monthNames[g.month]} {g.year}</h3>
                            <p>Total Spent: ₹ {g.total}</p>
                            <p>Budget: ₹ {g.budgetAmount}</p>
                            <p>{g.status}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Render Detail Mode:
    if (viewMode === "details") {
        return (
            <div className="transactions-container">
                {/*<button onClick={() => setViewMode("summary")}>⬅ Back to Summary</button>*/}
                <h2 className="section-title">
                    Transactions for {new Date(2023, selectedMonth).toLocaleString("default", { month: "long" })}
                </h2>
                <div className="transactions-list">
                    {paginatedTransactions.map((txn, index) => (
                        <div className={`transaction-card ${txn.type.toLowerCase()}`} key={index}>
                            <div className="txn-info-row">
                                <span className={`txn-type ${txn.type.toLowerCase()}`}>{txn.type}</span>
                            </div>
                            <div className="txn-info-row">
                                <span className="txn-category">{txn.category}</span>
                                <span className="txn-separator"> - </span>
                                <span className="txn-amount">₹ {txn.amount}</span>
                            </div>
                            <div className="txn-date">{txn.date}</div>
                        </div>
                    ))}
                </div>
                {console.log("no of pages",paginatedTransactions.length)}
                {paginatedTransactions.length <= ITEMS_PER_PAGE && (
                    <div className="pagination">
                        <button onClick={handlePrev} disabled={currentPage === 1}>
                            Prev
                        </button>
                        <span> {currentPage}</span>
                        <button onClick={handleNext} disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                )}
            </div>
        );
    }
};

export default DisplayTransaction;
