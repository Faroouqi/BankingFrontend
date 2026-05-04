import { useEffect, useState } from 'react';
import '../css/DisplayGoal.css';
import { getGoalNames, removeGoalName } from './GoalStorage';

const ITEMS_PER_PAGE = 6;
const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

const DisplayGoalTransaction = ({ onUpdate }) => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailsView, setDetailsView] = useState('ACTIVE');

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await fetch('http://localhost:8089/goals/get', {
                    credentials: 'include',
                });

                if (!res.ok) throw new Error('Failed to fetch goals');

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

    const handleDelete = async (goalId, goalName, event) => {
        event.stopPropagation();

        const confirmDelete = window.confirm('Delete this goal?');
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:8089/goals/delete/${goalId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Delete failed');

            setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
            setCurrentPage(1);
            removeGoalName(goalName);
            onUpdate(getGoalNames());
        } catch (err) {
            error(`Error deleting goal: ${err.message}`);
        }
    };

    const filteredGoals = goals.filter((goal) =>
        detailsView === 'ACTIVE'
            ? goal.status !== 'ACHIEVED'
            : goal.status === 'ACHIEVED',
    );

    const totalPages = Math.max(1, Math.ceil(filteredGoals.length / ITEMS_PER_PAGE));
    const paginatedGoals = filteredGoals.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    if (loading) return <p className="loading-text">Loading goals...</p>;
    if (error) return <p className="error-text">Error: {error}</p>;

    return (
        <div className="transactions-container">
            <div className="section-header">
                <div>
                    <p className="section-kicker">Goals</p>
                    <h2 className="section-title">My goals</h2>
                </div>
            </div>

            <div className="view-toggle-group goals-toggle-row">
                <button
                    className={`view-toggle ${detailsView === 'ACTIVE' ? 'active' : ''}`}
                    onClick={() => {
                        setDetailsView('ACTIVE');
                        setCurrentPage(1);
                    }}
                    type="button"
                >
                    Active
                </button>

                <button
                    className={`view-toggle ${detailsView === 'ACHIEVED' ? 'active' : ''}`}
                    onClick={() => {
                        setDetailsView('ACHIEVED');
                        setCurrentPage(1);
                    }}
                    type="button"
                >
                    Achieved
                </button>
            </div>

            {!selectedGoal ? (
                filteredGoals.length > 0 ? (
                    <>
                        <div className="goal-grid">
                            {paginatedGoals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className="goal-card"
                                    onClick={() => setSelectedGoal(goal)}
                                >
                                    <div className="goal-card-header">
                                        <h3>{goal.goalName}</h3>
                                        <span className={goal.status === 'ACHIEVED' ? 'status-badge success' : 'status-badge'}>
                                            {goal.status}
                                        </span>
                                    </div>
                                    <p>{currencyFormatter.format(goal.savedAmount || 0)} saved</p>

                                    <button
                                        className="delete-btn"
                                        onClick={(event) => handleDelete(goal.id, goal.goalName, event)}
                                        type="button"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage((page) => page - 1)}
                                    disabled={currentPage === 1}
                                    type="button"
                                >
                                    Previous
                                </button>

                                <span className="page-number">
                                    {currentPage} / {totalPages}
                                </span>

                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage((page) => page + 1)}
                                    disabled={currentPage === totalPages}
                                    type="button"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="no-data">
                        No {detailsView === 'ACTIVE' ? 'active' : 'achieved'} goals found.
                    </p>
                )
            ) : (
                <div>
                    <button
                        className="back-button"
                        style={{ marginBottom: '14px' }}
                        onClick={() => setSelectedGoal(null)}
                        type="button"
                    >
                        Back
                    </button>

                    {(() => {
                        const progress = Math.min(
                            (selectedGoal.savedAmount / selectedGoal.targetAmount) * 100,
                            100,
                        );

                        return (
                            <div className="goal-detail-card">
                                <h3>{selectedGoal.goalName}</h3>
                                <p><strong>Target:</strong> {currencyFormatter.format(selectedGoal.targetAmount)}</p>
                                <p><strong>Saved:</strong> {currencyFormatter.format(selectedGoal.savedAmount)}</p>

                                <div className="goal-progress">
                                    <div
                                        className="goal-progress-bar"
                                        style={{
                                            width: `${progress}%`,
                                            background: progress === 100 ? '#0fb38d' : '#1d66d2',
                                        }}
                                    />
                                </div>

                                <p><strong>Progress:</strong> {progress.toFixed(1)}%</p>
                                <p><strong>Remaining:</strong> {currencyFormatter.format(selectedGoal.targetAmount - selectedGoal.savedAmount)}</p>
                                <p><strong>Target Date:</strong> {new Date(selectedGoal.targetDate).toLocaleDateString()}</p>
                                <p>
                                    <strong>Status:</strong>{' '}
                                    <span className={selectedGoal.status === 'ACHIEVED' ? 'status-badge success' : 'status-badge'}>
                                        {selectedGoal.status}
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
