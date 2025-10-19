import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api';
import { AuthContext } from '../contexts/AuthContext';
import './CreateEvent.css';

export default function CreateEvent() {
  const { user, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    startDate: '',
    endDate: '',
    capacity: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // tickets state. starts with one default General tier
  const [tickets, setTickets] = useState([
    { tierName: 'General', price: '50', quantity: '100' }
  ]);

  if (!user || user.role !== 'ORGANIZER') {
    return (
      <div className="create-page page-root">
        <div className="container">
          <div className="unauthorized card fade-up">
            <h2>Organizer access only</h2>
            <p>Login with an organizer account to create events</p>
          </div>
        </div>
      </div>
    );
  }

  function addTicketRow() {
    setTickets(prev => [...prev, { tierName: '', price: '', quantity: '' }]);
  }
  function removeTicketRow(idx) {
    setTickets(prev => prev.filter((_, i) => i !== idx));
  }
  function updateTicket(idx, key, value) {
    setTickets(prev => prev.map((t, i) => i === idx ? { ...t, [key]: value } : t));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation. title and startDate already required in markup
      const ticketsPayload = tickets
        .filter(t => t.tierName && t.price !== '' && t.quantity !== '')
        .map(t => ({
          tierName: t.tierName.trim(),
          priceCents: Math.round(Number(t.price || 0) * 100),
          quantity: Number(t.quantity || 0)
        }))
        .filter(t => t.tierName && !Number.isNaN(t.priceCents) && t.quantity > 0);

      // Build FormData
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      if (image) fd.append('image', image);
      if (ticketsPayload.length) fd.append('tickets', JSON.stringify(ticketsPayload));

      // Call API (createEvent expects formData and token)
      const res = await createEvent(fd, accessToken);
      alert('Event created successfully!');
      navigate(`/events/${res.id}`);
    } catch (err) {
      console.error('Create event failed:', err);
      alert(err?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-page page-root">
      <div className="container fade-up">
        <h1 className="create-title">Create a New Event</h1>
        <p className="create-sub">Add event details, upload an image, and publish it instantly</p>

        <div className="create-grid">
          <div className="create-form card">
            <form onSubmit={submit} className="form-fields">
              <div className="form-row">
                <label>Event Title</label>
                <input
                  placeholder="enter an event title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Description</label>
                <textarea
                  rows={5}
                  placeholder="describe your event, highlights, or guest performers"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-double">
                <div>
                  <label>Location</label>
                  <input
                    placeholder="city, venue, or address"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Category</label>
                  <input
                    placeholder="music / workshop / theatre"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-double">
                <div>
                  <label>Start Date</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>End Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Capacity (optional)</label>
                <input
                  type="number"
                  placeholder="total seats"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  min="1"
                />
              </div>

              <div className="form-row">
                <label>Ticket tiers</label>

                <div className="ticket-rows">
                  {tickets.map((t, idx) => (
                    <div key={idx} className="ticket-row">
                      <input
                        className="tier-name"
                        placeholder="tier name"
                        value={t.tierName}
                        onChange={e => updateTicket(idx, 'tierName', e.target.value)}
                        required={idx === 0}
                      />
                      <input
                        className="tier-price"
                        placeholder="price"
                        value={t.price}
                        onChange={e => updateTicket(idx, 'price', e.target.value)}
                        type="number"
                        min="0"
                      />
                      <input
                        className="tier-qty"
                        placeholder="quantity"
                        value={t.quantity}
                        onChange={e => updateTicket(idx, 'quantity', e.target.value)}
                        type="number"
                        min="1"
                      />
                      <button
                        type="button"
                        className="remove-btn"
                        aria-label={`Remove ticket tier ${t.tierName || idx + 1}`}
                        onClick={() => removeTicketRow(idx)}
                      >
                        —
                      </button>
                    </div>
                  ))}

                  <div className="add-ticket-row-wrap">
                    <button
                      type="button"
                      className="add-ticket-btn"
                      onClick={addTicketRow}
                      aria-label="Add ticket tier"
                    >
                      Add ticket tier
                    </button>
                  </div>

                  <div className="ticket-note">Add multiple tiers - General, VIP, to sell different seat types</div>
                </div>
              </div>

              <button className="btn-gradient" type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create Event'}
              </button>
            </form>
          </div>

          <div className="create-image card">
            <h3>Event Image</h3>
            <div
              className={`image-drop ${image ? 'has-image' : ''}`}
              onClick={() => document.getElementById('image-input').click()}
            >
              {image ? (
                <img src={URL.createObjectURL(image)} alt="preview" />
              ) : (
                <div className="drop-text">
                  <p>Drop or select an image</p>
                </div>
              )}
            </div>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
