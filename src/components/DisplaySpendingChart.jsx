import React, { useEffect, useState } from "react";
import MonthlySpendingChart from "./MonthlySpendingChart";

const DisplaySpendingChart = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = "http://localhost:8089/transaction/spendings";

                const response = await fetch(url, {
                    method: "GET",
                    credentials: "include",
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`HTTP error! Status: ${response.status} - ${text}`);
                }

                const result = await response.json();
                setData(result);

            } catch (err) {
                console.error("Error fetching spending data:", err);
                setError(err.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h2>📊 Monthly Spending</h2>

            {error && <p style={{ color: "red" }}>Error: {error}</p>}

            {!data && !error && <p>Loading...</p>}

            {data && <MonthlySpendingChart data={data} />}
        </div>
    );
};

export default DisplaySpendingChart;