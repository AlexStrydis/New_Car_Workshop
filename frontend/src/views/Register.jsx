// frontend/src/views/Register.jsx

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function Register({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    identityNumber: '',
    role: 'customer',
    vatNumber: '',
    address: '',
    phone: '',
    specialty: ''
  });
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    // Front-end validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^(\+30|0)?[0-9]{10}$/;
    if (!emailRe.test(form.email)) {
      setError('Μη έγκυρο email');
      return;
    }
    if (form.phone && !phoneRe.test(form.phone.replace(/[\s-]/g, ''))) {
      setError('Μη έγκυρος τηλεφωνικός αριθμός');
      return;
    }
    if (!form.username || !form.password || !form.firstName || !form.lastName || !form.identityNumber) {
      setError('Συμπλήρωσε όλα τα υποχρεωτικά πεδία');
      return;
    }
    if (form.role === 'customer' && (!form.vatNumber || !form.address)) {
      setError('Συμπλήρωσε ΑΦΜ & Διεύθυνση');
      return;
    }
    if (form.role === 'mechanic' && !form.specialty) {
      setError('Συμπλήρωσε ειδικότητα');
      return;
    }
    try {
      await api.createUser(form);
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow max-w-lg w-full">
        <h3 className="text-2xl font-bold mb-4 text-center">Εγγραφή Χρήστη</h3>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center space-x-2">
            <AlertCircle size={20} /> <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="border px-3 py-2 rounded w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="border px-3 py-2 rounded w-full"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Όνομα"
              value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
              className="border px-3 py-2 rounded w-full"
              required
            />
            <input
              type="text"
              placeholder="Επίθετο"
              value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })}
              className="border px-3 py-2 rounded w-full"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Αριθμός Ταυτότητας"
            value={form.identityNumber}
            onChange={e => setForm({ ...form, identityNumber: e.target.value })}
            className="border px-3 py-2 rounded w-full"
            required
          />
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="customer">Πελάτης</option>
            <option value="mechanic">Μηχανικός</option>
          </select>
          {form.role === 'customer' && (
            <>
              <input
                type="text"
                placeholder="ΑΦΜ"
                value={form.vatNumber}
                onChange={e => setForm({ ...form, vatNumber: e.target.value })}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="text"
                placeholder="Διεύθυνση"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="tel"
                placeholder="Τηλέφωνο"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
            </>
          )}
          {form.role === 'mechanic' && (
            <>
              <input
                type="text"
                placeholder="Ειδικότητα"
                value={form.specialty}
                onChange={e => setForm({ ...form, specialty: e.target.value })}
                className="border px-3 py-2 rounded w-full"
                required
              />
              <input
                type="tel"
                placeholder="Τηλέφωνο"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="border px-3 py-2 rounded w-full"
              />
            </>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Ακύρωση
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Εγγραφή
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
