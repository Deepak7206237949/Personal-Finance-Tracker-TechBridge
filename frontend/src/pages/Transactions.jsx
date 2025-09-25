import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import TransactionList from '../components/TransactionList';
import { AuthContext } from '../contexts/AuthContext';

export default function Transactions() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const { isReadOnly } = React.useContext(AuthContext);

  const fetchPage = useCallback(async (p=1) => {
    const res = await api.get('/transactions', { params: { page: p, limit }});
    setData(res.data);
    setPage(p);
  }, [limit]);

  useEffect(() => { fetchPage(1).catch(console.error) }, [fetchPage]);

  const handleDelete = async (id) => {
    if (isReadOnly) return alert('Read-only user cannot delete');
    await api.delete(`/transactions/${id}`);
    fetchPage(page).catch(console.error);
  };

  return (
    <div style={{padding:20}}>
      <h2>Transactions</h2>
      <div style={{marginBottom:10}}>
        <button onClick={() => fetchPage(page)}>Refresh</button>
      </div>
      <TransactionList items={data.items} onDelete={handleDelete} isReadOnly={isReadOnly}/>
      <div style={{marginTop:10}}>
        <button disabled={page<=1} onClick={() => fetchPage(page-1)}>Prev</button>
        <span> Page {page} </span>
        <button disabled={data.items.length < limit} onClick={() => fetchPage(page+1)}>Next</button>
      </div>
    </div>
  );
}
