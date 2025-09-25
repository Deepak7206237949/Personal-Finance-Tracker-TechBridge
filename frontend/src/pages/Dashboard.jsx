import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
const PieChart = React.lazy(() => import('../components/charts/PieChart'));
const LineChart = React.lazy(() => import('../components/charts/LineChart'));
const BarChart = React.lazy(() => import('../components/charts/BarChart'));

export default function Dashboard() {
  const [catData, setCatData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetch() {
      const [catRes, monthsRes, categoriesRes] = await Promise.all([
        api.get('/analytics/category'),
        api.get('/analytics/monthly'),
        api.get('/categories')
      ]);
      setCatData(catRes.data);
      setMonthlyData(monthsRes.data);
      setCategories(categoriesRes.data);
    }
    fetch().catch(console.error);
  }, []);

  const pie = useMemo(() => catData, [catData]);
  const line = useMemo(() => monthlyData, [monthlyData]);

  // Calculate summary stats
  const stats = useMemo(() => {
    if (!monthlyData) return { income: 0, expense: 0, balance: 0, budget: 0 };
    const totalIncome = monthlyData.incomes?.reduce((sum, val) => sum + val, 0) || 0;
    const totalExpense = monthlyData.expenses?.reduce((sum, val) => sum + val, 0) || 0;
    const totalBudget = categories.reduce((sum, cat) => sum + (cat.amount || 0), 0);
    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
      budget: totalBudget
    };
  }, [monthlyData, categories]);

  return (
    <div className="container">
      <div className="dashboard">
        <h1>Financial Dashboard</h1>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card income">
            <div className="stat-value">${stats.income.toLocaleString()}</div>
            <div className="stat-label">Total Income</div>
          </div>
          <div className="stat-card budget" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
            <div className="stat-value">${stats.budget.toLocaleString()}</div>
            <div className="stat-label">Total Budget</div>
          </div>
          <div className="stat-card expense">
            <div className="stat-value">${stats.expense.toLocaleString()}</div>
            <div className="stat-label">Total Expenses</div>
            {stats.budget > 0 && (
              <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>
                {((stats.expense / stats.budget) * 100).toFixed(1)}% of budget
              </div>
            )}
          </div>
          <div className="stat-card balance">
            <div className="stat-value">${stats.balance.toLocaleString()}</div>
            <div className="stat-label">Net Balance</div>
          </div>
        </div>

        {/* Charts */}
        <React.Suspense fallback={<div className="loading"><div className="spinner"></div></div>}>
          <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px'}}>
            <div style={{background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}}>
              {pie && <PieChart labels={pie.labels} values={pie.values} />}
            </div>
            <div style={{background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}}>
              {line && <LineChart labels={line.labels} incomes={line.incomes} expenses={line.expenses} />}
            </div>
            <div style={{background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)'}}>
              {line && <BarChart labels={line.labels} incomes={line.incomes} expenses={line.expenses} />}
            </div>
          </div>
        </React.Suspense>
      </div>
    </div>
  );
}
