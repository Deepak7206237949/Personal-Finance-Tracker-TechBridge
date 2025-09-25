import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const location = useLocation();
  const [err, setErr] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  const handle = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Personal Finance Tracker</h2>
        {successMessage && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            {successMessage}
          </div>
        )}
        {err && <div className="error-message">{err}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button className="btn-primary" type="submit">
            Sign In
          </button>
        </form>
        <div className="demo-credentials">
          <strong>Demo Accounts:</strong><br/>
          <small>
            Admin: admin@finance.com / SecureAdmin2024!<br/>
            User: user@demo.com / UserPass123!<br/>
            Read Only: readonly@demo.com / ReadOnly123
          </small>
        </div>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <p style={{ color: '#666' }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
