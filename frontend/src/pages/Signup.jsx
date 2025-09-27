import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthForm.css'; // Import the shared CSS

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { login } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/api/auth/signup', { email, password, name });
      login(res.data.token, res.data.user);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-form">
        <h2>Join Soul-Circle</h2>
        {error && <p className="auth-error">{error}</p>}
        <div className="form-group">
          <input className="form-input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <input className="form-input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <input className="form-input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn auth-button">Create Account</button>
        <p className="auth-redirect">Have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}