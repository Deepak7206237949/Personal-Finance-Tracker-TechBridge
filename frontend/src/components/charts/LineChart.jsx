import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

export default function LineChart({ labels, incomes, expenses }) {
  const data = {
    labels,
    datasets: [
      { label: 'Income', data: incomes, fill: false },
      { label: 'Expense', data: expenses, fill: false }
    ]
  };
  return <div><h4>Monthly Trend</h4><Line data={data} /></div>;
}
