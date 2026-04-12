import React, { useEffect, useState } from "react";
import "../css/SavingsTrend.css";

const SavingsTrend = () => {
  const [savingsTrend, setSavingsTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  useEffect(() => {
    const fetchSavingsTrend = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "http://localhost:8089/transactions/savings",
          { credentials: "include" }
        );

        if (!response.ok) throw new Error("Failed to fetch savings trend");

        const data = await response.json();
        setSavingsTrend(data);
      } catch (err) {
        console.error("Error fetching savings trend:", err);
        setError("Unable to load savings trend right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavingsTrend();
  }, []);

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const monthlySummary = savingsTrend?.monthlySummary || [];
  const currentMonth = monthlySummary[currentMonthIndex];

  const handlePrevious = () => {
    setCurrentMonthIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentMonthIndex((prev) =>
      Math.min(prev + 1, monthlySummary.length - 1)
    );
  };

  return (
    <div className="savings-trend-wrapper">
      <div className="savings-trend-header">
        <h2>Savings Overview</h2>
        <p>Your monthly savings and spending summary</p>
      </div>

      {loading && <div className="summary-card"><p>Loading...</p></div>}

      {error && (
        <div className="summary-card error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && savingsTrend && (
        <>
          <div className="summary-top-card">
            <h3>Total Savings Till Last Month</h3>
            <p>{formatCurrency(savingsTrend.totalSavingsTillLastMonth)}</p>
          </div>

          {currentMonth ? (
            <>
              <div className="month-card single-month-card">
                <h4>{currentMonth.month}</h4>
                <div className="month-row">
                  <span>Income:</span>
                  <span>{formatCurrency(currentMonth.income)}</span>
                </div>
                <div className="month-row">
                  <span>Expense:</span>
                  <span>{formatCurrency(currentMonth.expense)}</span>
                </div>
                <div className="month-row savings-row">
                  <span>Savings:</span>
                  <span>{formatCurrency(currentMonth.savings)}</span>
                </div>
              </div>

              <div className="pagination-controls">
                <button
                  onClick={handlePrevious}
                  disabled={currentMonthIndex === 0}
                >
                  Previous
                </button>

                <span>
                  {currentMonthIndex + 1} / {monthlySummary.length}
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentMonthIndex === monthlySummary.length - 1}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="summary-card info">
              <p>No savings data available yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavingsTrend;
