import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, createBooking } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import './EventDetails.css';

export default function EventDetails() {
  const { id } = useParams();
  const { user, accessToken } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getEvent(id);
        setEvent(res);
        if (res?.tickets && res.tickets.length) setSelectedTicket(res.tickets[0].id);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    })();
  }, [id]);

  async function handleBook() {
    if (!user || !accessToken) {
      alert('Please login to book tickets');
      return;
    }
    if (!selectedTicket) {
      alert('Select a ticket tier first');
      return;
    }
    setBookingLoading(true);
    try {
      const res = await createBooking({ eventId: id, ticketId: selectedTicket, quantity }, accessToken);
      alert('Booking successful! Booking id: ' + res.id);
    } catch (err) {
      console.error(err);
      alert(err.error || 'Booking failed');
    } finally { setBookingLoading(false); }
  }

  if (loading) return <div className="event-page page-root container"><p>Loading event...</p></div>;
  if (!event) return <div className="event-page page-root container"><p>Event not found</p></div>;

  const cheapest = event.tickets && event.tickets.length ? (event.tickets.reduce((min, t) => t.priceCents < min.priceCents ? t : min, event.tickets[0])) : null;
  
  let imgUrl = event.imageUrl || '/placeholder.jpg';
  if (imgUrl.startsWith('http://')) {
    imgUrl = imgUrl.replace('http://', 'https://');
  }

  return (
    <div className="event-page page-root">
      <div className="container">
        <div className="event-hero-wrap">
          <div className="event-info">
            <img
              className="hero card"
              src={imgUrl}
              alt={event.title}
              onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
            />
            <div style={{ marginTop: 12 }}>
              <h1 style={{ margin: 0 }}>{event.title}</h1>
              <div className="chips" style={{ marginTop: 8 }}>
                <div className="chip">{event.category || 'General'}</div>
                <div className="chip">{new Date(event.startDate).toLocaleString()}</div>
                <div className="chip">{event.location}</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }} className="card" dangerouslySetInnerHTML={{ __html: `<div>${event.description || ''}</div>` }} />
          </div>

          <aside className="booking-panel card">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="small-muted">From</div>
                  <div className="price-tag">₹{(cheapest?.priceCents / 100 || 0).toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{event.organizer?.role === 'ORGANIZER' ? 'Organizer' : event.organizer?.name || 'Organizer'}</div>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div className="small-muted">Select tickets</div>
                <div style={{ marginTop: 8 }}>
                  {event.tickets?.map((t) => {
                    const left = t.quantity - t.sold;
                    const isSelected = selectedTicket === t.id;
                    return (
                      <div
                        key={t.id}
                        className={`ticket ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedTicket(t.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>{t.tierName}</div>
                          <div style={{ color: 'var(--muted)', fontSize: 13 }}>{left} seats left</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700 }}>₹{(t.priceCents / 100).toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div className="small-muted">Quantity</div>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                      style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 8, border: '1px solid #eef2ff' }}
                    />
                  </div>
                </div>

                <button className="book-now" onClick={handleBook} disabled={bookingLoading}>
                  {bookingLoading ? 'Booking…' : `Book now • ₹${((event.tickets.find(t => t.id === selectedTicket)?.priceCents || 0) * quantity / 100).toFixed(2)}`}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
