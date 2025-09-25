import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'amount', 'transactions', 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Filter and sort categories based on current settings
  const filteredAndSortedCategories = React.useMemo(() => {
    // First filter by search term
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'amount':
          aValue = a.totalAmount || 0;
          bValue = b.totalAmount || 0;
          break;
        case 'transactions':
          aValue = a.transactionCount || 0;
          bValue = b.transactionCount || 0;
          break;
        case 'date':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [categories, sortBy, sortOrder, searchTerm]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      setError('Category name cannot be empty');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Category name must be at least 2 characters long');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);
      setSuccess(null);

      const categoryData = {
        name: trimmedName,
        amount: parseFloat(newCategoryAmount) || 0
      };

      await api.post('/categories', categoryData);
      setNewCategoryName('');
      setNewCategoryAmount('');
      setSuccess('Category added successfully!');
      await fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Error adding category:', err);
      if (err.response?.status === 400) {
        setError(err.response.data?.error || 'Category already exists or invalid data');
      } else {
        setError('Failed to add category. Please try again.');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await api.delete(`/categories/${categoryId}`);
      setSuccess('Category deleted successfully!');
      await fetchCategories(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category.id);
    setEditName(category.name);
    setEditAmount(category.amount?.toString() || '');
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const updateData = {
        name: editName.trim(),
        amount: parseFloat(editAmount) || 0
      };

      await api.put(`/categories/${editingCategory}`, updateData);
      setEditingCategory(null);
      setEditName('');
      setEditAmount('');
      setSuccess('Category updated successfully!');
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update category');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditAmount('');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="form-container">
        <h1>Categories Management</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            {success}
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e1e5e9',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#007bff'}
            onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
          />
        </div>

        {/* Add New Category Form - Only for Admin */}
        {user?.role === 'ADMIN' && (
          <form onSubmit={handleAddCategory} style={{ marginBottom: '30px' }}>
            <div className="form-row">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Initial Amount / Budget</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newCategoryAmount}
                  onChange={(e) => setNewCategoryAmount(e.target.value)}
                  placeholder="Enter amount (optional)"
                />
              </div>
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isAdding}
              >
                {isAdding ? 'Adding...' : 'Add Category'}
              </button>
            </div>
          </form>
        )}

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
              {searchTerm ? 'Filtered Categories' : 'Total Categories'}
            </h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {searchTerm ? filteredAndSortedCategories.length : categories.length}
              {searchTerm && <span style={{ fontSize: '14px', opacity: 0.8 }}> of {categories.length}</span>}
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
              {searchTerm ? 'Filtered Budget' : 'Total Budget'}
            </h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              ${(searchTerm ? filteredAndSortedCategories : categories).reduce((sum, cat) => sum + (cat.amount || 0), 0).toFixed(2)}
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
              {searchTerm ? 'Filtered Expenses' : 'Total Expenses'}
            </h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              ${(searchTerm ? filteredAndSortedCategories : categories).reduce((sum, cat) => sum + (cat.totalAmount || 0), 0).toFixed(2)}
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
              {searchTerm ? 'Filtered Transactions' : 'Total Transactions'}
            </h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {(searchTerm ? filteredAndSortedCategories : categories).reduce((sum, cat) => sum + (cat.transactionCount || 0), 0)}
            </p>
          </div>
        </div>

        {/* Categories List */}
        <div className="table-container">
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('name')}
                  title="Click to sort by name"
                >
                  Category Name {getSortIcon('name')}
                </th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('amount')}
                  title="Click to sort by initial amount"
                >
                  Initial Amount {getSortIcon('amount')}
                </th>
                <th>Total Spent</th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('transactions')}
                  title="Click to sort by transaction count"
                >
                  Transactions {getSortIcon('transactions')}
                </th>
                <th
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('date')}
                  title="Click to sort by creation date"
                >
                  Created Date {getSortIcon('date')}
                </th>
                {user?.role === 'ADMIN' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'ADMIN' ? 6 : 5} style={{ textAlign: 'center', padding: '40px' }}>
                    No categories found
                  </td>
                </tr>
              ) : (
                filteredAndSortedCategories.map((category) => {
                  const maxAmount = Math.max(...filteredAndSortedCategories.map(c => c.totalAmount || 0));
                  const isHighSpending = category.totalAmount > maxAmount * 0.7 && category.totalAmount > 0;
                  const isEditing = editingCategory === category.id;

                  return (
                  <tr key={category.id} style={{
                    backgroundColor: isHighSpending ? '#fff5f5' : 'transparent',
                    borderLeft: isHighSpending ? '4px solid #dc3545' : 'none'
                  }}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      ) : (
                        <>
                          <strong>{category.name}</strong>
                          {isHighSpending && <span style={{
                            marginLeft: '8px',
                            fontSize: '12px',
                            background: '#dc3545',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '10px'
                          }}>HIGH</span>}
                        </>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          style={{ width: '100%', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                      ) : (
                        <span style={{
                          color: category.amount > 0 ? '#28a745' : '#6c757d',
                          fontWeight: category.amount > 0 ? 'bold' : 'normal'
                        }}>
                          ${category.amount?.toFixed(2) || '0.00'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{
                        color: category.totalAmount > 0 ? '#dc3545' : '#6c757d',
                        fontWeight: category.totalAmount > 0 ? 'bold' : 'normal'
                      }}>
                        ${category.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                      {category.amount > 0 && category.totalAmount > 0 && (
                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                          {((category.totalAmount / category.amount) * 100).toFixed(1)}% of budget
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ color: '#6c757d' }}>
                        {category.transactionCount || 0} transactions
                      </span>
                    </td>
                    <td>
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className="btn btn-success"
                              onClick={handleSaveEdit}
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={handleCancelEdit}
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleEditCategory(category)}
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDeleteCategory(category.id)}
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                              disabled={category.transactionCount > 0}
                              title={category.transactionCount > 0 ? 'Cannot delete category with transactions' : 'Delete category'}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Info for non-admin users */}
        {user?.role !== 'ADMIN' && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#f0f8ff', 
            borderRadius: '10px',
            color: '#666',
            textAlign: 'center'
          }}>
            <p>Categories are managed by administrators. You can view and use these categories when creating transactions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
