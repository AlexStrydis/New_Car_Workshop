// frontend/src/views/AppointmentsView.jsx

import React from 'react';

export default function AppointmentsView({
  appointments,
  onAdd,
  onStatusChange,
  onCancel,
  onWork
}) {
  const getStatusText = status => ({
    created: 'Δημιουργημένο',
    in_progress: 'Σε εξέλιξη',
    completed: 'Ολοκληρωμένο',
    cancelled: 'Ακυρωμένο'
  }[status] || status);

  const getStatusColor = status => ({
    created: 'text-blue-600 bg-blue-100',
    in_progress: 'text-yellow-600 bg-yellow-100',
    completed: 'text-green-600 bg-green-100',
    cancelled: 'text-red-600 bg-red-100'
  }[status] || 'text-gray-600 bg-gray-100');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Ραντεβού</h3>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Νέο Ραντεβού
        </button>
      </div>
      <table className="w-full bg-white shadow rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Ημ/νία</th>
            <th className="p-2">Ώρα</th>
            <th className="p-2">Πελάτης</th>
            <th className="p-2">Μηχανικός</th>
            <th className="p-2">Κατάσταση</th>
            <th className="p-2">Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(a => (
            <tr key={a.id}>
              <td className="p-2">{a.appointment_date}</td>
              <td className="p-2">{a.appointment_time}</td>
              <td className="p-2">{a.customer_name}</td>
              <td className="p-2">{a.mechanic_name || '-'}</td>
              <td className={`p-2 rounded ${getStatusColor(a.status)}`}>
                {getStatusText(a.status)}
              </td>
              <td className="p-2 space-x-2">
                {/* Change status buttons for secretary/mechanic */}
                <button
                  onClick={() => onStatusChange(a.id, 'in_progress')}
                  className="px-2 py-1 bg-yellow-200 rounded"
                >
                  Εκκίν.
                </button>
                <button
                  onClick={() => onStatusChange(a.id, 'completed')}
                  className="px-2 py-1 bg-green-200 rounded"
                >
                  Ολοκ.
                </button>

                {/* Cancel if still created */}
                {a.status === 'created' && (
                  <button
                    onClick={() => onCancel(a.id)}
                    className="px-2 py-1 bg-red-200 rounded"
                  >
                    Ακύρ.
                  </button>
                )}

                {/* Works button */}
                <button
                  onClick={() => onWork(a)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  Εργασίες
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
