// frontend/src/components/WorksModal.jsx

import React, { useState, useEffect } from 'react';
import FormModal from './FormModal';
import { api } from '../api';

export default function WorksModal({ appointmentId, isOpen, onRequestClose }) {
  const [works, setWorks] = useState([]);
  const [form, setForm] = useState({
    description: '',
    materials: '',
    completionHours: '',
    cost: ''
  });

  // Φόρτωση εργασιών όταν ανοίγει το modal
  const loadWorks = async () => {
    try {
      const data = await api.getWorks(appointmentId);
      setWorks(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWorks();
      setForm({ description: '', materials: '', completionHours: '', cost: '' });
    }
  }, [isOpen, appointmentId]);

  const handleSave = async () => {
    const { description, materials, completionHours, cost } = form;
    if (!description || !materials || !completionHours || !cost) {
      alert('Όλα τα πεδία είναι υποχρεωτικά');
      return;
    }
    if (isNaN(completionHours) || isNaN(cost)) {
      alert('Ώρες και Κόστος πρέπει να είναι αριθμοί');
      return;
    }
    try {
      await api.addWork(appointmentId, {
        description,
        materials,
        completionHours,
        cost
      });
      await loadWorks();
      setForm({ description: '', materials: '', completionHours: '', cost: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={`Εργασίες για Ραντεβού #${appointmentId}`}
      onSave={handleSave}
    >
      <div className="mb-4">
        <ul className="max-h-48 overflow-auto space-y-2">
          {works.map(w => (
            <li key={w.id} className="p-2 bg-gray-100 rounded">
              <p><strong>{w.description}</strong></p>
              <p>Υλικά: {w.materials}</p>
              <p>Ώρες: {w.completion_hours}, Κόστος: {w.cost}€</p>
            </li>
          ))}
          {works.length === 0 && (
            <p className="text-gray-500">Δεν υπάρχουν εργασίες</p>
          )}
        </ul>
      </div>
      <div className="space-y-2">
        <textarea
          rows={2}
          placeholder="Περιγραφή"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Υλικά"
          value={form.materials}
          onChange={e => setForm({ ...form, materials: e.target.value })}
          className="w-full border px-3 py-2 rounded"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Ώρες"
            value={form.completionHours}
            onChange={e => setForm({ ...form, completionHours: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Κόστος (€)"
            value={form.cost}
            onChange={e => setForm({ ...form, cost: e.target.value })}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>
    </FormModal>
  );
}
