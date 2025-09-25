import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-brand">
          💰 Finance Tracker
        </Link>
        
        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/transactions" className={isActive('/transactions') ? 'active' : ''}>
              Transactions
            </Link>
          </li>
          <li>
            <Link to="/categories" className={isActive('/categories') ? 'active' : ''}>
              Categories
            </Link>
          </li>
          {user.role === 'ADMIN' && (
            <li>
              <Link to="/users" className={isActive('/users') ? 'active' : ''}>
                Users
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-user">
          <div className="user-info">
            <strong>{user.name || user.email}</strong>
            <br />
            <small>{user.role}</small>
          </div>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
