// frontend/src/views/DashboardCustomer.jsx

import React from 'react';
import StatCard from '../components/StatCard';
import { Calendar, Car, CheckCircle } from 'lucide-react';

export default function DashboardCustomer({ stats }) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Πίνακας Πελάτη</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Επόμενα Ραντεβού"
          value={stats.nextAppointments || 0}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="Τα Αυτοκίνητά Μου"
          value={stats.totalCars || 0}
          icon={Car}
          color="purple"
        />
        <StatCard
          label="Ολοκληρωμένα"
          value={stats.completedAppointments || 0}
          icon={CheckCircle}
          color="green"
        />
      </div>
    </div>
  );
}
