// frontend/src/views/DashboardMechanic.jsx

import React from 'react';
import StatCard from '../components/StatCard';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export default function DashboardMechanic({ stats }) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Πίνακας Μηχανικού</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Προγραμματισμένα"
          value={stats.scheduledAppointments || 0}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="Σε Εξέλιξη"
          value={stats.inProgressAppointments || 0}
          icon={Clock}
          color="yellow"
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
