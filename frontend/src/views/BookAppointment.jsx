// frontend/src/views/BookAppointment.jsx

import React, { useState } from 'react';

export default function BookAppointment({ cars, onBook }) {
  const [form, setForm] = useState({
    carId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: 'service',
    problemDescription: ''
  });

  const handleSubmit = e => {
    e.preventDefault();
    onBook(form);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Κράτηση Νέου Ραντεβιού</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          required
          value={form.carId}
          onChange={e => setForm({ ...form, carId: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">-- Επιλέξτε Αυτοκίνητο --</option>
          {cars.map(c => (
            <option key={c.id} value={c.id}>
              {c.serial_number} – {c.brand} {c.model}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            required
            value={form.appointmentDate}
            onChange={e => setForm({ ...form, appointmentDate: e.target.value })}
            className="border px-3 py-2 rounded"
          />
          <input
            type="time"
            required
            value={form.appointmentTime}
            onChange={e => setForm({ ...form, appointmentTime: e.target.value })}
            className="border px-3 py-2 rounded"
          />
        </div>
        <select
          value={form.reason}
          onChange={e => setForm({ ...form, reason: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="service">Σέρβις</option>
          <option value="repair">Επισκευή</option>
        </select>
        {form.reason === 'repair' && (
          <textarea
            rows="3"
            placeholder="Περιγραφή Προβλήματος"
            value={form.problemDescription}
            onChange={e => setForm({ ...form, problemDescription: e.target.value })}
            className="w-full border px-3 py-2 rounded"
            required
          />
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Κράτηση
        </button>
      </form>
    </div>
  );
}
