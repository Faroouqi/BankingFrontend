import React, { useEffect, useState } from 'react';
import '../css/DisplayTransaction.css';

const ITEMS_PER_PAGE = 9;

const DisplayTransaction = ({ filter }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch('http://localhost:8089/transaction', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setTransactions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = transactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    if (loading) return <p className="loading-text">Loading transactions...</p>;
    if (error) return <p className="error-text">Error: {error}</p>;

    return (
        <div className="transactions-container">
            <h2 className="section-title">Transactions ({filter})</h2>
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

            <div className="pagination">
                <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
                {/*<span>Page {currentPage} of {totalPages}</span>*/}
                <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
            </div>
        </div>
    );
};

export default DisplayTransaction;
