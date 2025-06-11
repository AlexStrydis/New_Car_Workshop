// frontend/src/views/UsersView.jsx

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function UsersView({
  users,
  onImport,
  onAdd,
  onEdit,
  onDelete,
  onExport,
  search,
  onSearch
}) {
  return (
    <div>
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Αναζήτηση χρηστών…"
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Header with bulk-import and add button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Χρήστες</h3>
        <div className="flex items-center">
          <input
            type="file"
            accept=".csv"
            onChange={onImport}
            className="mr-2"
          />
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Νέος Χρήστης
          </button>
        </div>
      </div>

      {/* Users table */}
      <table className="w-full bg-white shadow rounded-lg mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Όνομα</th>
            <th className="p-2">Email</th>
            <th className="p-2">Ρόλος</th>
            <th className="p-2">Ενεργός</th>
            <th className="p-2">Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {users
            .filter(u =>
              u.first_name.toLowerCase().includes(search.toLowerCase()) ||
              u.last_name.toLowerCase().includes(search.toLowerCase()) ||
              u.username.toLowerCase().includes(search.toLowerCase())
            )
            .map(u => (
              <tr key={u.id}>
                <td className="p-2">{u.first_name} {u.last_name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  <input type="checkbox" checked={u.is_active} readOnly />
                </td>
                <td className="p-2 space-x-2">
                  <button onClick={() => onEdit(u)}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => onDelete(u.id)}>
                    <Trash2 size={16} />
                  </button>
                  {u.role === 'customer' && u.customer_id && (
                    <button
                      onClick={() => onExport(u.customer_id)}
                      className="px-2 py-1 bg-gray-200 rounded text-sm"
                    >
                      Εκ. Ιστορ.
                    </button>
                  )}
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
