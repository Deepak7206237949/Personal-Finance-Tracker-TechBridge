import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get('/users').then(r => setUsers(r.data)).catch(console.error); }, []);
  return (
    <div style={{padding:20}}>
      <h2>All Users (Admin)</h2>
      <ul>
        {users.map(u => (<li key={u.id}>{u.email} — {u.role}</li>))}
      </ul>
    </div>
  );
}
