import React from 'react';

export default function TransactionList({ items, onDelete, isReadOnly }) {
  return (
    <div className="transaction-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
      {items.map((t, index) => (
        <div key={t.id || index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px',
          borderBottom: '1px solid #eee'
        }}>
          <div>
            <div><strong>{t.type}</strong> ${t.amount}</div>
            <div style={{fontSize: 12}}>
              {t.category?.name || 'Uncategorized'} — {new Date(t.date).toLocaleDateString()}
            </div>
          </div>
          <div>
            <button
              disabled={isReadOnly}
              onClick={() => onDelete(t.id)}
              style={{
                padding: '4px 8px',
                backgroundColor: isReadOnly ? '#ccc' : '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isReadOnly ? 'not-allowed' : 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
