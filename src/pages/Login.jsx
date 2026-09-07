import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const ROOT_ADMIN = 'kasapozgur61@gmail.com';
const ROOT_ADMIN_PASS = 'AsunaKirito61';
const STORAGE_KEY = 'dogalim_admins';

export default function Login({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('seller_login'); // 'seller_login' | 'admin_login' | 'seller_apply' | 'pending'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Şarküteri Ön Başvuru Form State'i
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

  // 🚪 E-POSTA / ŞİFRE İLE GİRİŞ
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 🛡️ 1. YÖNETİM (ADMIN) GİRİŞİ
    if (activeTab === 'admin_login') {
      // 1.1. Kök Süper Admin
      if (cleanEmail === ROOT_ADMIN && cleanPass === ROOT_ADMIN_PASS) {
        setLoading(false);
        onLoginSuccess('admin', { email: cleanEmail, role: 'super_admin' });
        return;
      }

      // 1.2. Panelden Eklenen Dinamik Adminler
      let savedAdmins = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        savedAdmins = raw ? JSON.parse(raw) : [];
      } catch (err) {
        savedAdmins = [];
      }

      const matchedAdmin = savedAdmins.find(
        (adm) => adm.email.toLowerCase() === cleanEmail && String(adm.password).trim() === cleanPass
      );

      if (matchedAdmin) {
        setLoading(false);
        onLoginSuccess('admin', {
          email: matchedAdmin.email,
          role: matchedAdmin.role || 'saha_admin'
        });
        return;
      }

      setErrorMsg('Yetkisiz Giriş! Admin e-postası veya şifresi hatalı.');
      setLoading(false);
      return;
    }

    // 🏪 2. ŞARKÜTERİ ESNAF GİRİŞİ
    let savedApps = [];
    try {
      const raw = localStorage.getItem('dogalim_applications');
      savedApps = raw ? JSON.parse(raw) : [];
    } catch (err) {
      savedApps = [];
    }

    const userApp = savedApps.find(
      (app) => (app.email || app.accountEmail)?.trim().toLowerCase() === cleanEmail
    );

    if (userApp) {
      const storedPass = String(userApp.password || userApp.accountPassword).trim();
      if (storedPass === cleanPass) {
        if (userApp.status === 'approved' || userApp.status === 'Onaylandı') {
          setLoading(false);
          onLoginSuccess('seller', {
            storeName: userApp.storeName || 'Şarküteri İşletmesi',
            fullName: userApp.fullName || userApp.applicantName || 'İşletme Sahibi',
            email: userApp.email || cleanEmail,
            id: userApp.id
          });
          return;
        } else {
          setErrorMsg('⚠️ Dükkanınız henüz onaylanmamıştır! Admin onayı bekleniyor.');
          setLoading(false);
          return;
        }
      } else {
        setErrorMsg('❌ Girdiğiniz şifre hatalı!');
        setLoading(false);
        return;
      }
    }

    // 3. Normal Firebase Auth Girişi (Önceden kayıtlı hesaplar için)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      onLoginSuccess('seller', {
        storeName: userCredential.user.displayName || 'Doğalım Şarküteri',
        fullName: userCredential.user.displayName || 'İşletme Sahibi',
        email: userCredential.user.email,
        id: userCredential.user.uid
      });
    } catch (error) {
      setErrorMsg('Giriş başarısız! Kayıtlı dükkan bulunamadı veya şifre hatalı.');
      setLoading(false);
    }
  };

  // 🌐 GOOGLE İLE GİRİŞ
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = user?.email ? user.email.toLowerCase() : '';

      // Admin sekmesinde Google ile giriş denendiyse:
      if (activeTab === 'admin_login') {
        let savedAdmins = [];
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          savedAdmins = raw ? JSON.parse(raw) : [];
        } catch (e) {
          savedAdmins = [];
        }

        const isRegisteredAdmin = savedAdmins.some((a) => a.email?.toLowerCase() === userEmail);

        if (userEmail === ROOT_ADMIN || isRegisteredAdmin) {
          setLoading(false);
          onLoginSuccess('admin', {
            email: userEmail,
            role: userEmail === ROOT_ADMIN ? 'super_admin' : 'saha_admin'
          });
        } else {
          await signOut(auth);
          setErrorMsg(`Yetkisiz Giriş! (${userEmail}) admin listesinde tanımlı değildir.`);
          setLoading(false);
        }
      } else {
        // Şarküteri sekmesinde Google ile giriş:
        setLoading(false);
        onLoginSuccess('seller', {
          storeName: user.displayName ? `${user.displayName} Şarküteri` : 'Doğalım Şarküteri',
          fullName: user.displayName || 'İşletme Sahibi',
          email: user.email,
          id: user.uid
        });
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Google penceresi kapatıldı veya bağlantı kurulamadı.');
      setLoading(false);
    }
  };

  // 📝 ÖN BAŞVURU GÖNDERME
  const handleApplySubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!applyForm.accountEmail || !applyForm.accountPassword) {
      setErrorMsg('Lütfen giriş e-postanızı ve şifrenizi belirleyin.');
      return;
    }
    if (!applyForm.kvkkAccepted || !applyForm.privacyAccepted) {
      setErrorMsg('Lütfen KVKK ve Gizlilik Sözleşmesini onaylayın.');
      return;
    }
    if (!applyForm.appointmentDate) {
      setErrorMsg('Lütfen bir randevu tarihi seçin.');
      return;
    }

    const newStoreApp = {
      id: 'store_' + Date.now().toString().slice(-4),
      storeName: applyForm.storeName,
      fullName: applyForm.fullName,
      applicantName: applyForm.fullName,
      email: applyForm.accountEmail.trim().toLowerCase(),
      password: applyForm.accountPassword.trim(),
      phone: applyForm.phone,
      taxNumber: applyForm.taxNumber,
      address: applyForm.address,
      appointmentDate: applyForm.appointmentDate,
      appointmentTime: applyForm.appointmentTime,
      status: 'pending'
    };

    try {
      const existingApps = JSON.parse(localStorage.getItem('dogalim_applications') || '[]');
      const filtered = existingApps.filter((a) => a.email !== newStoreApp.email);
      localStorage.setItem('dogalim_applications', JSON.stringify([newStoreApp, ...filtered]));
      setActiveTab('pending');
    } catch (err) {
      setErrorMsg('Başvuru kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={{ fontSize: '2.8rem' }}>🍃</span>
          <h2 style={styles.title}>DOĞALİM PLATFORM</h2>
          <p style={styles.subtitle}>Saha & Şarküteri Yönetim Portalı</p>
        </div>

        {activeTab !== 'pending' && (
          <div style={styles.tabContainer}>
            <button
              type="button"
              onClick={() => { setActiveTab('seller_login'); setErrorMsg(''); }}
              style={{ ...styles.tabBtn, ...(activeTab === 'seller_login' ? styles.activeTab : {}) }}
            >
              🏪 Şarküteri Girişi
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('admin_login'); setErrorMsg(''); }}
              style={{ ...styles.tabBtn, ...(activeTab === 'admin_login' ? styles.activeAdminTab : {}) }}
            >
              🛡️ Yönetim (Admin)
            </button>
          </div>
        )}

        {errorMsg && <div style={styles.errorBox}>⚠️ {errorMsg}</div>}

        {/* 1. SEÇENEK: ŞARKÜTERİ GİRİŞİ */}
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

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Giriş Yapılıyor...' : 'Şarküteri Paneline Giriş Yap'}
            </button>

            <div style={styles.divider}>veya</div>

            {/* GERİ EKLENEN GOOGLE İLE ESNAF GİRİŞİ */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={styles.googleBtn}
            >
              🌐 Google ile Esnaf Girişi
            </button>

            <div style={styles.footerRow}>
              <span>Doğalım'da henüz dükkanınız yok mu?</span>
              <button type="button" onClick={() => setActiveTab('seller_apply')} style={styles.linkBtn}>
                Şarküteri Ön Başvurusu Yap
              </button>
            </div>
          </form>
        )}

        {/* 2. SEÇENEK: ADMİN GİRİŞİ */}
        {activeTab === 'admin_login' && (
          <form onSubmit={handleEmailLogin} style={styles.form}>
            <div style={styles.adminBadge}>
              🔒 Doğalım Sistem Yöneticisi Girişi
              <div style={{ fontSize: '0.72rem', fontWeight: 'normal', marginTop: '2px', color: '#0369a1' }}>
                Yalnızca yetkilendirilmiş admin mailleri ve atanan şifreler erişebilir.
              </div>
            </div>

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

            <button type="submit" disabled={loading} style={styles.adminSubmitBtn}>
              {loading ? 'Giriş Yapılıyor...' : 'Admin Paneline Giriş Yap'}
            </button>

            <div style={styles.divider}>veya</div>

            {/* GERİ EKLENEN GOOGLE İLE ADMİN GİRİŞİ */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={styles.googleAdminBtn}
            >
              🌐 Google ile Admin Girişi
            </button>
          </form>
        )}

        {/* 3. SEÇENEK: ŞARKÜTERİ ÖN BAŞVURU FORMU */}
        {activeTab === 'seller_apply' && (
          <form onSubmit={handleApplySubmit} style={styles.form}>
            <div style={styles.accountBox}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#15803d' }}>
                🔑 Dükkan Giriş Bilgilerinizi Belirleyin
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
                  placeholder="Şifreniz"
                  value={applyForm.accountPassword}
                  onChange={(e) => setApplyForm({ ...applyForm, accountPassword: e.target.value })}
                  style={{ ...styles.input, flex: 1 }}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Ad Soyad & Dükkan Ticari Unvanı</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Yetkili Ad Soyad"
                  value={applyForm.fullName}
                  onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                  style={{ ...styles.input, flex: 1 }}
                  required
                />
                <input
                  type="text"
                  placeholder="Dükkan Unvanı"
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
                placeholder="Telefon Numarası"
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
                placeholder="Mahalle, cadde, kapı no..."
                value={applyForm.address}
                onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })}
                style={{ ...styles.input, height: '40px', resize: 'none' }}
                required
              />
            </div>

            <div style={styles.appointmentBox}>
              <label style={{ ...styles.label, color: '#0369a1' }}>
                🤝 Saha İncelemesi & Randevu Tarihi
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
                <span>KVKK Aydınlatma Metni'ni okudum, onaylıyorum.</span>
              </label>
              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={applyForm.privacyAccepted}
                  onChange={(e) => setApplyForm({ ...applyForm, privacyAccepted: e.target.checked })}
                />
                <span>Gizlilik ve Satıcı Taahhütnamesini kabul ediyorum.</span>
              </label>
            </div>

            <button type="submit" style={styles.submitBtn}>
              Ön Başvuruyu Gönder
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
              Dükkan kaydınız oluşturuldu. Admin onayından sonra sisteme giriş yapabilirsiniz.
            </p>
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
  adminBadge: { backgroundColor: '#f0f9ff', color: '#0369a1', padding: '8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px', border: '1px solid #bae6fd' },
  errorBox: { backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' },
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
  googleAdminBtn: { padding: '10px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' },
  footerRow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '10px', fontSize: '0.8rem', color: '#64748b' },
  linkBtn: { background: 'none', border: 'none', color: '#10b981', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.82rem' },
  cancelLink: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'center' },
  pendingBox: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }
};