import React, { useEffect, useState, useContext } from 'react';
import { listEvents, deleteEvent } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import './OrganizerDashboard.css';

export default function OrganizerDashboard() {
  const { user, accessToken } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await listEvents('', 1, 100);
        const mine = (res.events || []).filter(ev => ev.organizer?.id === user?.id);
        setEvents(mine);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) {
    return (
      <div className="dashboard-page page-root">
        <div className="container">
          <div className="card" style={{ padding: 20 }}>
            <h3>Please login to view organizer dashboard</h3>
          </div>
        </div>
      </div>
    );
  }

  async function handleDelete(evId) {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setActionLoading(true);
    try {
      await deleteEvent(evId, accessToken);
      setEvents(prev => prev.filter(e => e.id !== evId));
      window.alert('Event deleted successfully');
    } catch (err) {
      console.error(err);
      window.alert(err?.error || 'Failed to delete event');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="dashboard-page page-root">
      <div className="container">
        <div className="dashboard-head">
          <div>
            <h2 style={{ margin: 0 }}>Organizer Dashboard</h2>
            <div style={{ color: 'var(--muted)', marginTop: 6 }}>
              Welcome back, <strong>{user.role === 'ORGANIZER' ? 'Organizer' : user.name}</strong>
            </div>
          </div>

          <div className="metrics">
            <div className="metric">
              <div className="num">{events.length}</div>
              <div className="label">Events</div>
            </div>
            <div className="metric">
              <div className="num">—</div>
              <div className="label">Revenue</div>
            </div>
          </div>
        </div>

        <div className="events-list">
          {loading ? (
            <p>Loading your events…</p>
          ) : events.length === 0 ? (
            <p>No events yet. Create one to get started</p>
          ) : (
            events.map(ev => (
              <div key={ev.id} className="event-row card">
                <img src={ev.imageUrl || '/placeholder.jpg'} alt={ev.title} />
                <div className="meta">
                  <div className="event-header">
                    <div className="event-title">{ev.title}</div>
                    <button
                      className="icon-btn delete"
                      onClick={() => handleDelete(ev.id)}
                      disabled={actionLoading}
                      aria-label={`Delete ${ev.title}`}
                      title="Delete event"
                    >
                      X
                    </button>
                  </div>
                  <div className="event-date">
                    {new Date(ev.startDate).toLocaleString()}
                  </div>
                  <div className="event-sub">
                    {ev.tickets?.length || 0} ticket tiers
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
