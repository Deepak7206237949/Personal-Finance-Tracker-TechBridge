import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

export default function PieChart({ labels, values }) {
  const data = {
    labels,
    datasets: [{ data: values, backgroundColor: undefined }]
  };
  return <div><h4>Category Expenses</h4><Pie data={data} /></div>;
}
