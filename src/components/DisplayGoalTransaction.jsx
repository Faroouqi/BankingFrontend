import React, { useEffect, useState } from "react";
import "../css/DisplayGoal.css";

const ITEMS_PER_PAGE = 6;

const DisplayGoalTransaction = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailsView, setDetailsView] = useState('ACTIVE'); // ACTIVE / ACHIEVED

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await fetch("http://localhost:8089/goals/get", {
                    credentials: "include"
                });

                if (!res.ok) throw new Error("Failed to fetch goals");

                const data = await res.json();
                setGoals(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, []);

    // ✅ Delete handler
    const handleDelete = async (goalId, e) => {
        e.stopPropagation();

        const confirmDelete = window.confirm("Delete this goal?");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:8089/goals/delete/${goalId}`, {
                method: "DELETE",
                credentials: "include"
            });

            if (!res.ok) throw new Error("Delete failed");

            const updated = goals.filter(g => g.id !== goalId);
            setGoals(updated);

            setCurrentPage(1); // reset page

        } catch (err) {
            alert("Error deleting goal: " + err.message);
        }
    };

    const filteredGoals = goals.filter(goal =>
        detailsView === "ACTIVE"
            ? goal.status !== "ACHIEVED"
            : goal.status === "ACHIEVED"
    );

    // ✅ Pagination
    const totalPages = Math.ceil(filteredGoals.length / ITEMS_PER_PAGE);

    const paginatedGoals = filteredGoals.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) return <p className="loading-text">Loading goals...</p>;
    if (error) return <p className="error-text">Error: {error}</p>;

    return (
        <div className="transactions-container">
            <h2 className="section-title">🎯 My Goals</h2>
            <br />

            {/* 🔥 Toggle Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button
                    className={`view-toggle ${detailsView === 'ACTIVE' ? 'active' : ''}`}
                    onClick={() => {
                        setDetailsView('ACTIVE');
                        setCurrentPage(1);
                    }}
                >
                    Active
                </button>

                <button
                    className={`view-toggle ${detailsView === 'ACHIEVED' ? 'active' : ''}`}
                    onClick={() => {
                        setDetailsView('ACHIEVED');
                        setCurrentPage(1);
                    }}
                >
                    Achieved
                </button>
            </div>

            {/* 🔹 LIST VIEW */}
            {!selectedGoal ? (
                filteredGoals.length > 0 ? (
                    <>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "12px"
                            }}
                        >
                            {paginatedGoals.map((goal, index) => (
                                <div
                                    key={index}
                                    className="goal-card"
                                    onClick={() => setSelectedGoal(goal)}
                                >
                                    <h3>{goal.goalName}</h3>

                                    {/* 🗑 Delete */}
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => handleDelete(goal.id, e)}
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* ✅ Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage(p => p - 1)}
                                    disabled={currentPage === 1}
                                >
                                    ⬅ Prev
                                </button>

                                <span>
                                    {currentPage} / {totalPages}
                                </span>

                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next ➡
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="no-data">
                        No {detailsView === "ACTIVE" ? "active" : "achieved"} goals found
                    </p>
                )
            ) : (
                /* 🔹 DETAIL VIEW */
                <div>
                    <button
                        style={{ marginBottom: "10px" }}
                        onClick={() => setSelectedGoal(null)}
                    >
                        ⬅ Back
                    </button>

                    {(() => {
                        const goal = selectedGoal;
                        const progress = Math.min(
                            (goal.savedAmount / goal.targetAmount) * 100,
                            100
                        );

                        return (
                            <div
                                className="transaction-card"
                                style={{
                                    padding: "16px",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    background: "#fff"
                                }}
                            >
                                <h3>{goal.goalName}</h3>

                                <p><strong>Target:</strong> ₹ {goal.targetAmount}</p>
                                <p><strong>Saved:</strong> ₹ {goal.savedAmount}</p>

                                {/* Progress */}
                                <div style={{
                                    height: "10px",
                                    background: "#eee",
                                    borderRadius: "5px",
                                    overflow: "hidden",
                                    margin: "8px 0"
                                }}>
                                    <div style={{
                                        width: `${progress}%`,
                                        background: progress === 100 ? "#2ecc71" : "#6C63FF",
                                        height: "100%"
                                    }} />
                                </div>

                                <p><strong>Progress:</strong> {progress.toFixed(1)}%</p>

                                <p>
                                    <strong>Remaining:</strong> ₹ {goal.targetAmount - goal.savedAmount}
                                </p>

                                <p>
                                    <strong>Target Date:</strong>{" "}
                                    {new Date(goal.targetDate).toLocaleDateString()}
                                </p>

                                <p>
                                    <strong>Status:</strong>{" "}
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                        background: goal.status === "ACHIEVED" ? "#e6ffed" : "#fff4e6",
                                        color: goal.status === "ACHIEVED" ? "green" : "orange",
                                        fontWeight: "bold"
                                    }}>
                                        {goal.status}
                                    </span>
                                </p>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default DisplayGoalTransaction;