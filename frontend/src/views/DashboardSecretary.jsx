// frontend/src/views/DashboardSecretary.jsx

import React from 'react';
import StatCard from '../components/StatCard';
import { Calendar, CheckCircle, Clock, User } from 'lucide-react';

export default function DashboardSecretary({ stats }) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Πίνακας Γραμματείας</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Σημερινά Ραντεβού"
          value={stats.todayAppointments || 0}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          label="Ολοκληρωμένα"
          value={stats.completedAppointments || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Σε Εξέλιξη"
          value={stats.inProgressAppointments || 0}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          label="Συνολικοί Πελάτες"
          value={stats.totalCustomers || 0}
          icon={User}
          color="purple"
        />
      </div>
    </div>
  );
}
