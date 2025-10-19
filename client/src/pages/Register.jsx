import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
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
      const res = await register({ name, email, password });
      contextLogin(res);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErr(err?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page page-root">
      <div className="auth-card card">
        <h2>Create account</h2>
        <div className="auth-sub">Join EventEase - attend events or host your own</div>

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="form-row">
            <label htmlFor="name">Full name</label>
            <input id="name" className="input" type="text" placeholder="your full name" required value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" placeholder="you@domain.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" placeholder="choose a secure password" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {err && <div className="field-error">{err}</div>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>

          <div className="small-row" style={{ marginTop: 10 }}>
            <span style={{ color: 'var(--muted)' }}>By creating an account you agree to our Terms & Policies</span>
            <span />
          </div>
        </form>
      </div>
    </div>
  );
}
