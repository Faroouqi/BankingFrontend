import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const MonthlySpendingChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!data) return undefined;

        const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = Object.keys(data).map((month) => monthNames[Number(month)]);
        const values = Object.values(data);

        chartInstance.current?.destroy();
        const context = chartRef.current?.getContext('2d');
        if (!context) return undefined;

        chartInstance.current = new Chart(context, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Monthly Spending',
                        data: values,
                        backgroundColor: '#1d66d2',
                        borderRadius: 10,
                        maxBarThickness: 46,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) =>
                                new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    maximumFractionDigits: 0,
                                }).format(context.raw),
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) =>
                                new Intl.NumberFormat('en-IN', {
                                    notation: 'compact',
                                    maximumFractionDigits: 1,
                                }).format(value),
                        },
                    },
                    x: {
                        grid: {
                            display: false,
                        },
                    },
                },
            },
        });

        return () => {
            chartInstance.current?.destroy();
        };
    }, [data]);

    return (
        <div className="chart-panel" style={{ width: '100%', height: '420px' }}>
            <canvas ref={chartRef} />
        </div>
    );
};

export default MonthlySpendingChart;
