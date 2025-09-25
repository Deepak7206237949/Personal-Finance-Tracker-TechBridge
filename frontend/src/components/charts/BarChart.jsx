import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChart({ labels, incomes, expenses }) {
  const data = {
    labels,
    datasets: [
      { label: 'Income', data: incomes },
      { label: 'Expense', data: expenses }
    ]
  };
  return <div><h4>Income vs Expense</h4><Bar data={data} /></div>;
}
