import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listEvents } from '../api';
import './Home.css';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(query = '') {
    setLoading(true);
    try {
      const res = await listEvents(query, 1, 30);
      setEvents(res.events || []);
    } catch (err) {
      console.error('Failed to load events', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleSearch = () => load(q);

  return (
    <div className="home-page page-root">
      <div className="container">
        <div className="home-hero fade-up">
          
          <div className="hero-panel card">
            <div className="hero-title">Discover Experiences Near You</div>
            <div className="hero-sub">Music, workshops, meetups, theatre & more - book tickets in seconds</div>

            <div className="search" style={{ marginTop: 16 }}>
              <input
                placeholder="Search events, locations, categories"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="btn" onClick={handleSearch}>Search</button>
            </div> 
          </div>

          <div className="hero-cta">
            <h3>Host an Event</h3>
            <p>Create and manage events, sell tickets and view details in an organizer dashboard</p>
            <button className="btn" style={{ marginTop: 8 }}>Get Started</button>
          </div>
        </div>

        {loading ? (
          <p style={{ marginTop: 18 }}>Loading events…</p>
        ) : (
          <div className="grid">
            {events.map((ev) => (
              <div key={ev.id} className="card event-card">
                <img className="thumb" src={ev.imageUrl || '/placeholder.jpg'} alt={ev.title} />
                <div className="meta">
                  <div className="event-title">{ev.title}</div>
                  <div className="event-sub">{ev.location} • {new Date(ev.startDate).toLocaleString()}</div>
                  <div className="row-badges" style={{ marginTop: 10 }}>
                    <div className="badge">₹{(ev.tickets?.[0]?.priceCents/100 || 0).toFixed(0)}</div>
                    <div className="badge" style={{ background: 'linear-gradient(90deg,#ff8a00,#e52e71)' }}>{ev.category || 'Event'}</div>
                    <div className="badge" style={{ background: 'linear-gradient(90deg,#06b6d4,#2563eb)' }}>{ev.organizer?.name || 'Organizer'}</div>
                  </div>
                  <Link to={`/events/${ev.id}`} style={{ marginTop: 12, display: 'inline-block', textDecoration: 'none' }}>view details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
