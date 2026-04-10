import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const MonthlySpendingChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (!data) return;

        // Convert object → labels + values
        const monthNames = [
            "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const labels = Object.keys(data).map(m => monthNames[Number(m)]);
        const values = Object.values(data);

        // Destroy old chart
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext("2d");

        chartInstance.current = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Monthly Spending (₹)",
                        data: values,
                        backgroundColor: "#6C63FF"
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `₹ ${context.raw}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);

    return (
        <div style={{ width: "100%", height: "400px" }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default MonthlySpendingChart;