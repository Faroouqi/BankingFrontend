import React, { useEffect, useState } from "react";
import "../css/SmartInsights.css";

const SmartInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:8089/insights/`, {
                    credentials: 'include'
                });
        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }

        const data = await response.json();
        setInsights(data || []);
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError("Unable to load insights right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="smart-insights-wrapper">
      <div className="smart-insights-header">
        <h2>Smart Insights</h2>
        <p>Your recent spending and savings patterns</p>
      </div>

      {loading && (
        <div className="insights-loading">
          <p>Loading insights...</p>
        </div>
      )}

      {error && (
        <div className="insight-card error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && insights.length === 0 && (
        <div className="insight-card info">
          <p>No insights available yet. Add more transactions to see trends.</p>
        </div>
      )}

      {!loading && !error && insights.length > 0 && (
        <div className="insights-grid">
          {insights.map((item, index) => (
            <div
              key={index}
              className={`insight-card ${item.type?.toLowerCase() || "info"}`}
            >
              <div className="insight-icon">
                {item.type === "success"
                  ? "✅"
                  : item.type === "warning"
                  ? "⚠️"
                  : "ℹ️"}
              </div>
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
