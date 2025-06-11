// frontend/src/components/StatCard.jsx

import React from 'react';

export default function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white p-4 rounded shadow flex items-center space-x-4">
      <Icon size={32} className={`text-${color}-500`} />
      <div>
        <div className="text-gray-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
