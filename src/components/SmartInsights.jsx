import { useEffect, useState } from 'react';
import '../css/SmartInsights.css';

const SmartInsights = ({ month }) => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (month === null || month === undefined) return undefined;

        const fetchInsights = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`http://localhost:8089/insights/${month + 1}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch insights');
                }

                const data = await response.json();
                setInsights(data || []);
            } catch (err) {
                console.error('Error fetching insights:', err);
                setError('Unable to load insights right now.');
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
        return undefined;
    }, [month]);

    return (
        <div className="smart-insights-wrapper">
            <div className="smart-insights-header">
                <h2>Smart Insights</h2>
                <p>Your recent spending and savings patterns</p>
            </div>

            {loading && (
                <div className="insights-loading">
                    <div className="insight-icon">INFO</div>
                    <p>Loading insights...</p>
                </div>
            )}

            {error && (
                <div className="insight-card error">
                    <div className="insight-icon">ERROR</div>
                    <div className="insight-content">
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {!loading && !error && insights.length === 0 && (
                <div className="insight-card info">
                    <div className="insight-icon">INFO</div>
                    <div className="insight-content">
                        <p>No insights available yet. Add more transactions to see trends.</p>
                    </div>
                </div>
            )}

            {!loading && !error && insights.length > 0 && (
                <div className="insights-grid">
                    {insights.map((item, index) => (
                        <div
                            key={index}
                            className={`insight-card ${(item.type || 'info').toLowerCase()}`}
                        >
                            <div className="insight-icon">{(item.type || 'info').toUpperCase()}</div>
                            <div className="insight-content">
                                <p>{item.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SmartInsights;
