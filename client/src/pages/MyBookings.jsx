import React, { useEffect, useState, useContext } from 'react';
import { myBookings } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import './MyBookings.css';

export default function MyBookings() {
  const { user, accessToken } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const res = await myBookings(accessToken);
        setBookings(res || []);
      } catch (err) {
        console.error(err);
        setBookings([]);
      } finally { setLoading(false); }
    })();
  }, [user, accessToken]);

  if (!user) {
    return (
      <div className="bookings-page page-root">
        <div className="container">
          <div className="card" style={{ padding: 20 }}>
            <h3>Please login to view your bookings</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page page-root">
      <div className="container">
        <h2 style={{ marginTop: 0 }}>My bookings</h2>

        {loading ? <p>Loading bookings…</p> : (
          bookings.length === 0 ? <p>You have no bookings yet</p> :
          <div className="booking-grid">
            {bookings.map(b => (
              <div key={b.id} className="booking-card card">
                <img src={b.event?.imageUrl || '/placeholder.jpg'} alt={b.event?.title} />
                <div className="meta">
                  <div style={{ fontWeight: 700 }}>{b.event?.title}</div>
                  <div style={{ color: 'var(--muted)', marginTop: 6 }}>{b.quantity} x {b.ticket?.tierName || 'Ticket'} • ₹{(b.totalCents/100).toFixed(2)}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{new Date(b.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className={`booking-status ${b.status.toLowerCase()}`}>{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
