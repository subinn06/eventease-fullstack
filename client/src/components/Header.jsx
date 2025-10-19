import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="site-header">
      <div className="header-inner container">
        <div className="left">
          <Link to="/" className="logo">EventEase</Link>
          <nav className="main-nav" aria-label="Primary">
            <Link to="/create" className="nav-link">Create Event</Link>
            <Link to="/bookings" className="nav-link">My Bookings</Link>
            <Link to="/dashboard" className="nav-link">Organizer</Link>
          </nav>
        </div>

        <div className="right">
          {!user && <Link to="/login" className="nav-link">Login</Link>}
          {user && (
            <div className="auth-area">
              <span className="user-pill">
                {user.role === 'ORGANIZER' ? 'Organizer' : user.name}
              </span>
              <button className="btn btn-ghost" onClick={() => logout()}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
