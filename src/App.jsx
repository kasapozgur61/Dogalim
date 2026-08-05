import React, { useState } from 'react';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [userRole, setUserRole] = useState(null); // 'admin', 'seller' veya null

  // Başarılı Giriş Yapıldığında
  const handleLoginSuccess = (role) => {
    setUserRole(role);
  };

  // Çıkış Yapıldığında
  const handleLogout = () => {
    setUserRole(null);
  };

  // 1. KULLANICI GİRİŞ YAPMAMIŞSA -> TERÇİH BUTONLU GİRİŞ EKRANI
  if (!userRole) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. KULLANICI ADMIN İSE -> ADMIN VE SAHA ONAY PANELİ
  if (userRole === 'admin') {
    return <AdminPanel onLogout={handleLogout} />;
  }

  // 3. KULLANICI ŞARKÜTERİ SATICISI İSE -> STANDART ŞARKÜTERİ DASHBOARD
  if (userRole === 'seller') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return null;
}