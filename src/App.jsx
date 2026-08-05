import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase Oturum Durumunu Dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Yüklenme Aşaması
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}>🍃</div>
        <p style={{ color: '#64748b', fontWeight: 'bold' }}>Doğalım Şarküteri Panel Yükleniyor...</p>
      </div>
    );
  }

  // Oturum Durumuna Göre Yönlendirme
  return (
    <div>
      {user ? <Dashboard /> : <Login />}
    </div>
  );
}

const styles = {
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif"
  },
  spinner: {
    fontSize: '3rem',
    marginBottom: '1rem',
    animation: 'pulse 1.5s infinite'
  }
};