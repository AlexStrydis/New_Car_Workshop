// frontend/src/components/Sidebar.jsx

import React from 'react';
import { Settings, Calendar, Users, Car as CarIcon, Plus } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, currentUser }) {
  const menu = {
    secretary: [
      { id: 'dashboard',    label: 'Dashboard',        icon: Settings },
      { id: 'appointments', label: 'Ραντεβού',          icon: Calendar },
      { id: 'customers',    label: 'Χρήστες',          icon: Users },
      { id: 'cars',         label: 'Αυτοκίνητα',       icon: CarIcon }
    ],
    mechanic: [
      { id: 'dashboard',    label: 'Τα Ραντεβού Μου',  icon: Calendar },
      { id: 'appointments', label: 'Όλα τα Ραντεβού',  icon: Settings }
    ],
    customer: [
      { id: 'dashboard',      label: 'Τα Ραντεβού Μου',    icon: Calendar },
      { id: 'cars',           label: 'Τα Αυτοκίνητά Μου',  icon: CarIcon },
      { id: 'book-appointment', label: 'Νέο Ραντεβού',     icon: Plus }
    ]
  }[currentUser.role] || [];

  return (
    <nav className="bg-gray-50 w-64 h-full border-r p-4 space-y-2">
      {menu.map(item => (
        <button
          key={item.id}
          onClick={() => setCurrentView(item.id)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-colors ${
            currentView === item.id
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
