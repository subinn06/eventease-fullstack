const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';
export { API_BASE };

async function request(path, { method = 'GET', body, token, isFormData = false } = {}) {
  const headers = {};
  if (body && !isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body && !isFormData ? JSON.stringify(body) : body
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

// Auth
export async function register(payload) { return request('/auth/register', { method: 'POST', body: payload }); }
export async function login(payload) { return request('/auth/login', { method: 'POST', body: payload }); }
export async function refresh() { return request('/auth/refresh', { method: 'POST' }); }
export async function logout() { return request('/auth/logout', { method: 'POST' }); }

// Events
export async function listEvents(q = '', page = 1, limit = 10) {
  const qstr = new URLSearchParams({ q, page, limit }).toString();
  return request(`/events?${qstr}`);
}
export async function getEvent(id) { return request(`/events/${id}`); }
export async function createEvent(formData, token) {
  // formData should be FormData, set isFormData to true so we don't JSON.stringify
  return request('/events', { method: 'POST', body: formData, token, isFormData: true });
}

// Bookings
export async function createBooking(payload, token) {
  return request('/bookings', { method: 'POST', body: payload, token });
}
export async function myBookings(token) {
  return request('/bookings', { method: 'GET', token });
}

// Delete event
export async function deleteEvent(id, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/events/${id}`, {
    method: 'DELETE',
    headers,
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}