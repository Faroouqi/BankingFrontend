import { useEffect, useState } from 'react';
import MonthlySpendingChart from './MonthlySpendingChart';

const DisplaySpendingChart = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8089/transaction/spendings', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const result = await response.json();
                setData(result);
            } catch (err) {
                console.error('Error fetching spending data:', err);
                setError(err.message);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="transactions-container">
            <div className="section-header">
                <div>
                    <p className="section-kicker">Spending</p>
                    <h2 className="section-title">Monthly spending</h2>
                </div>
            </div>

            {error && <p className="error-text">Error: {error}</p>}
            {!data && !error && <p className="no-data">Loading...</p>}
            {data && <MonthlySpendingChart data={data} />}
        </div>
    );
};

export default DisplaySpendingChart;
