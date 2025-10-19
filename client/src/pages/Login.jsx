import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login: contextLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      contextLogin(res);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErr(err?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page page-root">
      <div className="auth-card card">
        <h2>Welcome back</h2>
        <div className="auth-sub">Login to manage bookings and create events</div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" placeholder="you@domain.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" placeholder="your password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {err && <div className="field-error">{err}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="small-row">
            <Link to="/register" style={{textDecoration: 'none'}}>Don't have an account? Register</Link>
            <p style={{ color: 'var(--muted)' }}>Forgot password?</p>
          </div>
        </form>
      </div>
    </div>
  );
}
