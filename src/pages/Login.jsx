import React, { useState } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login({ onLoginSuccess }) {
  // 'seller_login', 'seller_apply', 'admin_login', 'pending'
  const [activeTab, setActiveTab] = useState('seller_login');

  // Satıcı & Admin Giriş Formu
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Şarküteri Ön Başvuru Formu
  const [applyForm, setApplyForm] = useState({
    fullName: '',
    storeName: '',
    phone: '',
    taxNumber: '',
    address: '',
    accountEmail: '',
    accountPassword: '',
    kvkkAccepted: false,
    privacyAccepted: false,
    appointmentDate: '',
    appointmentTime: '10:00'
  });

  const [errorMsg, setErrorMsg] = useState('');

  // Firestore'dan Kullanıcı Rolünü Sorgulayan Güvenli Fonksiyon
  const checkUserRoleAndLogin = async (user) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        onLoginSuccess(userData.role || 'seller', 'approved');
      } else {
        // Firestore'da henüz kayıt yoksa varsayılan olarak satıcı paneline al
        onLoginSuccess('seller', 'approved');
      }
    } catch (error) {
      console.error("Rol okuma hatası:", error);
      onLoginSuccess('seller', 'approved');
    }
  };

  // E-Posta / Şifre ile Giriş (Satıcı & Admin Ortak Mantığı)
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkUserRoleAndLogin(userCredential.user);
    } catch (error) {
      console.error("Giriş Hatası:", error);
      setErrorMsg('Giriş başarısız! E-posta veya şifrenizi kontrol edin.');
    }
  };

  // 🌐 Google ile Devam Et
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await checkUserRoleAndLogin(result.user);
    } catch (error) {
      console.error("Google Giriş Hatası:", error);
      setErrorMsg('Google ile giriş yapılırken bir hata oluştu veya pencere kapatıldı.');
    }
  };

  // Şarküteri Ön Başvuru Gönderimi
  const handleApplySubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!applyForm.accountEmail || !applyForm.accountPassword) {
      setErrorMsg('Lütfen panel giriş e-postanızı ve şifrenizi belirleyin.');
      return;
    }

    if (!applyForm.kvkkAccepted || !applyForm.privacyAccepted) {
      setErrorMsg('Lütfen KVKK ve Gizlilik Sözleşmesini onaylayın.');
      return;
    }

    if (!applyForm.appointmentDate) {
      setErrorMsg('Lütfen saha ekibi ziyareti için randevu tarihi seçin.');
      return;
    }

    setActiveTab('pending');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* LOGO & BAŞLIK */}
        <div style={styles.header}>
          <span style={{ fontSize: '2.8rem' }}>🍃</span>
          <h2 style={styles.title}>DOĞALİM PLATFORM</h2>
          <p style={styles.subtitle}>Saha & Şarküteri Yönetim Portalı</p>
        </div>

        {/* GİRİŞ TİPİ SEÇİM SEKMELERİ */}
        {activeTab !== 'pending' && (
          <div style={styles.tabContainer}>
            <button 
              onClick={() => { setActiveTab('seller_login'); setErrorMsg(''); }}
              style={{
                ...styles.tabBtn,
                ...(activeTab.startsWith('seller') ? styles.activeTab : {})
              }}
            >
              🏪 Şarküteri Satıcı
            </button>
            <button 
              onClick={() => { setActiveTab('admin_login'); setErrorMsg(''); }}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'admin_login' ? styles.activeAdminTab : {})
              }}
            >
              🛡️ Yönetim (Admin)
            </button>
          </div>
        )}

        {errorMsg && <div style={styles.errorBox}>⚠️ {errorMsg}</div>}

        {/* 1. SEÇENEK: ŞARKÜTERİ SATICI GİRİŞİ */}
        {activeTab === 'seller_login' && (
          <form onSubmit={handleEmailLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>E-Posta Adresi</label>
              <input 
                type="email" 
                placeholder="esnaf@dogalim.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input} 
                required 
              />
            </div>

            <button type="submit" style={styles.submitBtn}>
              Şarküteri Paneline Giriş Yap
            </button>

            <div style={styles.divider}>veya</div>

            <button type="button" onClick={handleGoogleSignIn} style={styles.googleBtn}>
              🌐 Google ile Devam Et
            </button>

            <div style={styles.footerRow}>
              <span>Doğalım'da henüz dükkanınız yok mu?</span>
              <button type="button" onClick={() => setActiveTab('seller_apply')} style={styles.linkBtn}>
                Şarküteri Ön Başvurusu Yap
              </button>
            </div>
          </form>
        )}

        {/* 2. SEÇENEK: ADMIN GİRİŞİ */}
        {activeTab === 'admin_login' && (
          <form onSubmit={handleEmailLogin} style={styles.form}>
            <div style={styles.adminBadge}>🔒 Saha & Sistem Yönetici Portalı</div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Admin E-Posta</label>
              <input 
                type="email" 
                placeholder="admin@dogalim.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input} 
                required 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Yönetici Şifresi</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input} 
                required 
              />
            </div>

            <button type="submit" style={styles.adminSubmitBtn}>
              Admin Paneline Giriş Yap
            </button>

            <div style={styles.divider}>veya</div>

            <button type="button" onClick={handleGoogleSignIn} style={styles.googleBtn}>
              🌐 Google ile Admin Girişi
            </button>
          </form>
        )}

        {/* 3. SEÇENEK: ŞARKÜTERİ ÖN BAŞVURU FORMU */}
        {activeTab === 'seller_apply' && (
          <form onSubmit={handleApplySubmit} style={styles.form}>
            <div style={styles.accountBox}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#15803d' }}>
                🔑 Giriş Bilgilerinizi Belirleyin
              </span>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input 
                  type="email" 
                  placeholder="Giriş E-Postası" 
                  value={applyForm.accountEmail} 
                  onChange={(e) => setApplyForm({ ...applyForm, accountEmail: e.target.value })}
                  style={{ ...styles.input, flex: 1 }} 
                  required 
                />
                <input 
                  type="password" 
                  placeholder="Şifre" 
                  value={applyForm.accountPassword} 
                  onChange={(e) => setApplyForm({ ...applyForm, accountPassword: e.target.value })}
                  style={{ ...styles.input, flex: 1 }} 
                  required 
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Ad Soyad & Dükkan Unvanı</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Ad Soyad" 
                  value={applyForm.fullName} 
                  onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                  style={{ ...styles.input, flex: 1 }} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Dükkan Ticari Unvanı" 
                  value={applyForm.storeName} 
                  onChange={(e) => setApplyForm({ ...applyForm, storeName: e.target.value })}
                  style={{ ...styles.input, flex: 1 }} 
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="tel" 
                placeholder="Telefon" 
                value={applyForm.phone} 
                onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                style={{ ...styles.input, flex: 1 }} 
                required 
              />
              <input 
                type="text" 
                placeholder="Vergi No / TCKN" 
                value={applyForm.taxNumber} 
                onChange={(e) => setApplyForm({ ...applyForm, taxNumber: e.target.value })}
                style={{ ...styles.input, flex: 1 }} 
                required 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Dükkan Açık Adresi</label>
              <textarea 
                placeholder="Detaylı dükkan adresi..." 
                value={applyForm.address} 
                onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })}
                style={{ ...styles.input, height: '40px', resize: 'none' }} 
                required 
              />
            </div>

            <div style={styles.appointmentBox}>
              <label style={{ ...styles.label, color: '#0369a1' }}>
                🤝 Saha Ziyareti & Rücu Sözleşmesi Randevusu
              </label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input 
                  type="date" 
                  value={applyForm.appointmentDate} 
                  onChange={(e) => setApplyForm({ ...applyForm, appointmentDate: e.target.value })}
                  style={{ ...styles.input, flex: 1 }} 
                  required 
                />
                <select 
                  value={applyForm.appointmentTime} 
                  onChange={(e) => setApplyForm({ ...applyForm, appointmentTime: e.target.value })}
                  style={{ ...styles.input, flex: 1 }}
                >
                  <option value="10:00">10:00 - 12:00</option>
                  <option value="14:00">14:00 - 16:00</option>
                  <option value="16:00">16:00 - 18:00</option>
                </select>
              </div>
            </div>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkLabel}>
                <input 
                  type="checkbox" 
                  checked={applyForm.kvkkAccepted} 
                  onChange={(e) => setApplyForm({ ...applyForm, kvkkAccepted: e.target.checked })}
                />
                <span>KVKK Aydınlatma Metni'ni onaylıyorum.</span>
              </label>
              <label style={styles.checkLabel}>
                <input 
                  type="checkbox" 
                  checked={applyForm.privacyAccepted} 
                  onChange={(e) => setApplyForm({ ...applyForm, privacyAccepted: e.target.checked })}
                />
                <span>Gizlilik Sözleşmesi ve Satıcı Şartlarını kabul ediyorum.</span>
              </label>
            </div>

            <button type="submit" style={styles.submitBtn}>
              Ön Başvuruyu & Randevuyu Gönder
            </button>

            <button type="button" onClick={() => setActiveTab('seller_login')} style={styles.cancelLink}>
              ← Satıcı Girişine Dön
            </button>
          </form>
        )}

        {/* 4. SEÇENEK: BAŞVURU ALINDI EKRANI */}
        {activeTab === 'pending' && (
          <div style={styles.pendingBox}>
            <span style={{ fontSize: '3rem' }}>⏳</span>
            <h3 style={{ margin: '8px 0 4px 0', color: '#0f172a' }}>Başvurunuz Alındı!</h3>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              Giriş adresiniz (<b>{applyForm.accountEmail}</b>) kayıtlara alındı. Vergi ve dükkan bilgileriniz doğrulanıyor.
            </p>
            <div style={styles.ticketSummary}>
              <p style={{ margin: '2px 0', color: '#10b981', fontWeight: 'bold' }}>
                📅 Ziyaret Randevusu: {applyForm.appointmentDate} ({applyForm.appointmentTime})
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                * Temsilcimiz dükkanınızda <b>Rücu Sözleşmesi</b> imzalattıktan sonra hesabınız aktifleştirilecektir.
              </p>
            </div>
            <button onClick={() => setActiveTab('seller_login')} style={styles.submitBtn}>
              Giriş Ekranına Dön
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', fontFamily: "'Inter', sans-serif", padding: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' },
  header: { textAlign: 'center', marginBottom: '16px' },
  title: { margin: '4px 0 0 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: 'bold' },
  subtitle: { margin: '2px 0 0 0', color: '#64748b', fontSize: '0.82rem' },
  tabContainer: { display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '16px' },
  tabBtn: { flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 'bold', color: '#64748b', backgroundColor: 'transparent' },
  activeTab: { backgroundColor: '#fff', color: '#10b981', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  activeAdminTab: { backgroundColor: '#0f172a', color: '#38bdf8' },
  adminBadge: { backgroundColor: '#f0f9ff', color: '#0369a1', padding: '6px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '6px' },
  errorBox: { backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' },
  accountBox: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px', borderRadius: '8px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.78rem', fontWeight: 'bold', color: '#334155' },
  input: { padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' },
  appointmentBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '8px', borderRadius: '8px' },
  checkboxGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#475569', cursor: 'pointer' },
  submitBtn: { padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.88rem', cursor: 'pointer' },
  googleBtn: { padding: '10px', backgroundColor: '#fff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' },
  divider: { textAlign: 'center', margin: '4px 0', color: '#94a3b8', fontSize: '0.75rem' },
  adminSubmitBtn: { padding: '10px', backgroundColor: '#0f172a', color: '#38bdf8', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.88rem', cursor: 'pointer' },
  footerRow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '10px', fontSize: '0.8rem', color: '#64748b' },
  linkBtn: { background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.82rem' },
  cancelLink: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'center' },
  pendingBox: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' },
  ticketSummary: { backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'left', fontSize: '0.82rem' }
};