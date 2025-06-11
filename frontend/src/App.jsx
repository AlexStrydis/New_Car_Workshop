// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { api } from './api';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Alert from './components/Alert';

import Home from './views/Home';
import LoginComponent from './views/LoginComponent';
import Register from './views/Register';
import DashboardSecretary from './views/DashboardSecretary';
import DashboardMechanic from './views/DashboardMechanic';
import DashboardCustomer from './views/DashboardCustomer';
import UsersView from './views/UsersView';
import CarsView from './views/CarsView';
import AppointmentsView from './views/AppointmentsView';
import BookAppointment from './views/BookAppointment';
import WorksModal from './components/WorksModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');

  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});

  const [alert, setAlert] = useState(null);
  const notify = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const [userSearch, setUserSearch] = useState('');
  const [carSearch, setCarSearch] = useState('');
  const [showWorks, setShowWorks] = useState(false);
  const [worksApptId, setWorksApptId] = useState(null);

  // Sync view with browser history so back/forward buttons work
  useEffect(() => {
    const initial = window.location.hash.replace('#', '');
    if (initial) {
      setCurrentView(initial);
    }
    const onPop = (e) => {
      const view = e.state?.view || window.location.hash.replace('#', '') || 'home';
      setCurrentView(view);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    window.history.pushState({ view: currentView }, '', `#${currentView}`);
  }, [currentView]);

  // Load dashboard stats & lists when view or user changes
  useEffect(() => {
    if (!currentUser) return;

    api.getStats().then(setStats).catch(console.error);

    if (currentView === 'customers') {
      const fetchUsers = userSearch
        ? api.searchUsers({ username: userSearch })
        : api.getUsers();
      fetchUsers.then(setUsers).catch(e => notify(e.message, 'error'));
    }

    if (currentView === 'cars') {
      const fetchCars = carSearch
        ? api.searchCars({ serialNumber: carSearch })
        : api.getCars();
      fetchCars.then(setCars).catch(e => notify(e.message, 'error'));
    }

    if (currentView === 'appointments') {
      api.getAppointments().then(setAppointments).catch(e => notify(e.message, 'error'));
    }
  }, [currentUser, currentView, userSearch, carSearch]);

  const handleLogout = () => {
    api.logout().then(() => setCurrentUser(null));
  };

  const renderContent = () => {
    if (!currentUser) {
      if (currentView === 'register') {
        return (
          <Register
            onSuccess={() => setCurrentView('login')}
            onCancel={() => setCurrentView('home')}
          />
        );
      }
      if (currentView === 'login') {
        return <LoginComponent onLogin={user => { setCurrentUser(user); setCurrentView('dashboard'); }} />;
      }
      return <Home onLogin={() => setCurrentView('login')} onRegister={() => setCurrentView('register')} />;
    }

    switch (currentView) {
      case 'dashboard':
        if (currentUser.role === 'secretary') return <DashboardSecretary stats={stats} />;
        if (currentUser.role === 'mechanic') return <DashboardMechanic stats={stats} />;
        return <DashboardCustomer stats={stats} />;

      case 'customers':
        return (
          <UsersView
            users={users}
            onImport={e =>
              api
                .importUsers(e.target.files[0])
                .then(r => { notify(`Επ:${r.results.length}, Σφ:${r.errors.length}`); return api.getUsers(); })
                .then(setUsers)
                .catch(e => notify(e.message, 'error'))
            }
            onAdd={() => setCurrentView('register')}
            onEdit={u => {
              setCurrentView('register');
              // you can pass editingUser via context or extra state
            }}
            onDelete={id =>
              api.deleteUser(id).then(() => { notify('Διαγράφηκε'); return api.getUsers(); }).then(setUsers)
            }
            onExport={id => window.open(`/api/customers/${id}/history`, '_blank')}
            search={userSearch}
            onSearch={setUserSearch}
          />
        );

      case 'cars':
        return (
          <CarsView
            cars={cars}
            onImport={e =>
              api
                .importCars(e.target.files[0])
                .then(r => { notify(`Επ:${r.results.length}, Σφ:${r.errors.length}`); return api.getCars(); })
                .then(setCars)
                .catch(e => notify(e.message, 'error'))
            }
            onAdd={() => {/* open car form */}}
            onEdit={c => {/* open car form with c */}}
            onDelete={id =>
              api.deleteCar(id).then(() => { notify('Διαγράφηκε'); return api.getCars(); }).then(setCars)
            }
            search={carSearch}
            onSearch={setCarSearch}
          />
        );

      case 'appointments':
        return (
          <>
            <AppointmentsView
              appointments={appointments}
              onAdd={() => {/* open appointment form */}}
              onStatusChange={(id, st) =>
                api.updateAppointment(id, { status: st })
                  .then(() => { notify('Ενημερώθηκε'); return api.getAppointments(); })
                  .then(setAppointments)
              }
              onCancel={id =>
                api.cancelAppointment(id)
                  .then(() => { notify('Ακυρώθηκε'); return api.getAppointments(); })
                  .then(setAppointments)
              }
              onWork={a => { setWorksApptId(a.id); setShowWorks(true); }}
            />
            <WorksModal
              appointmentId={worksApptId}
              isOpen={showWorks}
              onRequestClose={() => setShowWorks(false)}
            />
          </>
        );

      case 'book-appointment':
        return (
          <BookAppointment
            cars={cars}
            onBook={data =>
              api.createAppointment(data)
                .then(() => { notify('Κρατήθηκε'); return api.getAppointments(); })
                .then(setAppointments)
            }
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex flex-1">
        {currentUser && (
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            currentUser={currentUser}
          />
        )}
        <main className="flex-1 bg-gray-100 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
      {alert && <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />}
    </div>
  );
}
