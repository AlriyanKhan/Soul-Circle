import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthForm.css'; // Import the shared CSS

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      nav(state?.from?.pathname || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-form">
        <h2>Login to Soul-Circle</h2>
        {error && <p className="auth-error">{error}</p>}
        <div className="form-group">
          <input className="form-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <input className="form-input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn auth-button">Login</button>
        <p className="auth-redirect">No account? <Link to="/signup">Create one</Link></p>
      </form>
    </div>
  );
}