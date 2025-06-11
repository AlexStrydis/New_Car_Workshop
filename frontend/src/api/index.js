// frontend/src/api/index.js

const API_URL = 'http://localhost:5000/api';

async function request(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...opts
  });
  const contentType = res.headers.get('Content-Type') || '';
  if (!res.ok) {
    const error = contentType.includes('application/json')
      ? (await res.json()).error
      : res.statusText;
    throw new Error(error || 'Request failed');
  }
  return contentType.includes('application/json') ? res.json() : null;
}

export const api = {
  // Auth
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  createUser: data =>
    request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  // Users
  getUsers: () => request('/users'),
  importUsers: file => {
    const fd = new FormData();
    fd.append('file', file);
    return request('/users/import', { method: 'POST', body: fd });
  },
  updateUser: (id, data) =>
    request(`/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  deleteUser: id => request(`/users/${id}`, { method: 'DELETE' }),
  searchUsers: params =>
    request(`/users/search?${new URLSearchParams(params)}`),

  // Cars
  getCars: () => request('/cars'),
  importCars: file => {
    const fd = new FormData();
    fd.append('file', file);
    return request('/cars/import', { method: 'POST', body: fd });
  },
  createCar: data =>
    request('/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  updateCar: (id, data) =>
    request(`/cars/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  deleteCar: id => request(`/cars/${id}`, { method: 'DELETE' }),
  searchCars: params =>
    request(`/cars/search?${new URLSearchParams(params)}`),

  // Appointments
  getAppointments: () => request('/appointments'),
  createAppointment: data =>
    request('/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  updateAppointment: (id, data) =>
    request(`/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),
  cancelAppointment: id =>
    request(`/appointments/${id}/cancel`, { method: 'POST' }),

  // Works
  getWorks: appointmentId =>
    request(`/appointments/${appointmentId}/works`),
  addWork: (appointmentId, data) =>
    request(`/appointments/${appointmentId}/works`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  // Stats
  getStats: () => request('/stats/dashboard')
};
