// frontend/src/views/CarsView.jsx

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function CarsView({
  cars,
  onImport,
  onAdd,
  onEdit,
  onDelete,
  search,
  onSearch
}) {
  return (
    <div>
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Αναζήτηση αυτοκινήτων…"
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      {/* Header with bulk-import and add button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Αυτοκίνητα</h3>
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
            Νέο Αυτοκίνητο
          </button>
        </div>
      </div>

      {/* Cars table */}
      <table className="w-full bg-white shadow rounded-lg mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Σειριακό</th>
            <th className="p-2">Μάρκα/Μοντέλο</th>
            <th className="p-2">Κυκλ.Πιάτ/Χλμ</th>
            <th className="p-2">Τύπος/Καύσιμο</th>
            <th className="p-2">Ενέργειες</th>
          </tr>
        </thead>
        <tbody>
          {cars
            .filter(c => c.serial_number.includes(search))
            .map(c => (
              <tr key={c.id}>
                <td className="p-2">{c.serial_number}</td>
                <td className="p-2">{c.brand} {c.model}</td>
                <td className="p-2">{c.license_plate || '-'} / {c.mileage} χλμ</td>
                <td className="p-2">{c.car_type}, {c.fuel_type}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => onEdit(c)}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => onDelete(c.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
