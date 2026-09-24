import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [currentStore, setCurrentStore] = useState(() => {
    const saved = localStorage.getItem('currentStore');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (role, userData = null) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
    if (userData) {
      setCurrentStore(userData);
      localStorage.setItem('currentStore', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentStore(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentStore');
    localStorage.removeItem('token');
  };

  if (!userRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (userRole === 'admin') {
    return (
      <AdminPanel 
        onLogout={handleLogout} 
        currentAdminEmail={currentStore?.email || 'kasapozgur61@gmail.com'} 
      />
    );
  }

  return <Dashboard onLogout={handleLogout} storeData={currentStore} />;
}