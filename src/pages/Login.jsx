import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Türkçe Firebase Hata Mesajları Dönüştürücü
  const getFriendlyErrorMessage = (code) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'E-posta adresi veya şifre hatalı!';
      case 'auth/invalid-email':
        return 'Geçersiz bir e-posta adresi girdiniz.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda.';
      case 'auth/weak-password':
        return 'Şifreniz en az 6 karakter olmalıdır.';
      case 'auth/too-many-requests':
        return 'Çok fazla hatalı deneme yaptınız. Lütfen biraz bekleyin.';
      case 'auth/popup-closed-by-user':
        return 'Google ile giriş penceresi kapatıldı.';
      default:
        return 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
    }
  };

  // E-Posta & Şifre ile Giriş / Kayıt
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Başarılı girişte state otomatik güncelleneceği için loading kalabilir
    } catch (error) {
      console.error("Giriş Hatası:", error.code);
      setErrorMsg(getFriendlyErrorMessage(error.code));
      setLoading(false); // HATA ANINDA BUTONU RE-ENABLE ET! (Kilitlenmeyi önler)
    }
  };

  // Google ile Giriş
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Giriş Hatası:", error.code);
      setErrorMsg(getFriendlyErrorMessage(error.code));
      setLoading(false); // HATA ANINDA BUTONU RE-ENABLE ET!
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={{ fontSize: '3rem' }}>🍃</span>
          <h2 style={styles.title}>DOĞALİM ŞARKÜTERİ</h2>
          <p style={styles.subtitle}>Satıcı & Tezgah Yönetim Paneli</p>
        </div>

        {/* HATA MESAJI BARI */}
        {errorMsg && (
          <div style={styles.errorBox}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>E-Posta Adresi</label>

            <input 
              type="email" 
              placeholder="ornek@dogalim.com" 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg(''); // Kullanıcı yazmaya başlayınca hatayı temizle
              }}
              style={styles.input} 
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Şifre</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(''); // Kullanıcı yazmaya başlayınca hatayı temizle
              }}
              style={styles.input} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              ...styles.submitBtn, 
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'İşleniyor...' : (isRegister ? 'Kayıt Ol' : 'Giriş Yap')}
          </button>
        </form>

        <div style={styles.divider}>veya</div>

        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading} 
          style={{
            ...styles.googleBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🌐 Google ile Devam Et
        </button>

        <div style={styles.footer}>
          <span>{isRegister ? 'Zaten hesabınız var mı?' : 'Hesabınız yok mu?'}</span>
          <button 
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }} 
            style={styles.toggleBtn}
          >
            {isRegister ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyIn: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    fontFamily: "'Inter', sans-serif",
    padding: '20px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  title: {
    margin: '8px 0 0 0',
    color: '#0f172a',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    letterSpacing: '0.5px'
  },
  subtitle: {
    margin: '4px 0 0 0',
    color: '#64748b',
    fontSize: '0.85rem'
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center',
    animation: 'shake 0.2s ease-in-out'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 'bold',
    color: '#334155'
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  submitBtn: {
    padding: '12px',
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    marginTop: '8px',
    transition: '0.2s'
  },
  divider: {
    textAlign: 'center',
    margin: '16px 0',
    color: '#94a3b8',
    fontSize: '0.8rem',
    position: 'relative'
  },
  googleBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#fff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '0.88rem'
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '20px',
    fontSize: '0.85rem',
    color: '#64748b'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#10b981',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
    padding: 0
  }
};