import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert("Hata: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      alert("Google Giriş Hatası: " + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '2.5rem' }}>🍃</span>
          <h2 style={styles.title}>DOĞALİM ESNAF PANELİ</h2>
          <p style={styles.subtitle}>Giriş yapın ve mağazanızı yönetin</p>
        </div>

        <form onSubmit={handleAuth} style={styles.form}>
          <input
            type="email"
            placeholder="E-posta Adresi"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" style={styles.primaryBtn}>
            {isRegister ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </form>

        <div style={styles.divider}>
          <span>veya</span>
        </div>

        <button type="button" onClick={handleGoogleLogin} style={styles.googleBtn}>
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google" 
            style={{ width: '18px', marginRight: '10px' }} 
          />
          Google ile Devam Et
        </button>

        <p style={styles.toggleText}>
          {isRegister ? "Zaten hesabınız var mı?" : "Hesabınız yok mu?"}{' '}
          <span 
            onClick={() => setIsRegister(!isRegister)} 
            style={styles.toggleLink}
          >
            {isRegister ? "Giriş Yapın" : "Kayıt Olun"}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    fontFamily: "'Inter', sans-serif"
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '380px'
  },
  title: { margin: '8px 0 0 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 'bold' },
  subtitle: { margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' },
  form: { display: 'flex', flexDirection: 'column' },
  input: {
    padding: '12px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem'
  },
  primaryBtn: {
    padding: '12px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginTop: '4px'
  },
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    color: '#334155'
  },
  divider: { textAlign: 'center', margin: '16px 0', color: '#94a3b8', fontSize: '0.85rem' },
  toggleText: { marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' },
  toggleLink: { color: '#10b981', cursor: 'pointer', fontWeight: 'bold' }
};