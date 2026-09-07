import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const ROOT_ADMIN = 'kasapozgur61@gmail.com';
const ROOT_ADMIN_PASS = 'AsunaKirito61';
const STORAGE_KEY = 'dogalim_admins';

export default function Login({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('seller_login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [applyForm, setApplyForm] = useState({
    fullName: '',
    storeName: '',
    phone: '',
    taxNumber: '',
    address: '',
    accountEmail: '',
    accountPassword: '',
    patronPin: '',        // 🆕 Patron modu PIN
    kvkkAccepted: false,
    privacyAccepted: false,
    appointmentDate: '',
    appointmentTime: '10:00'
  });

  // ─────────────────────────────────────────────────────────────
  // E-POSTA / ŞİFRE GİRİŞİ
  // ─────────────────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // ═══ 1. YÖNETİM (ADMIN) GİRİŞİ ═══
    if (activeTab === 'admin_login') {
      if (cleanEmail === ROOT_ADMIN && cleanPass === ROOT_ADMIN_PASS) {
        setLoading(false);
        onLoginSuccess('admin', { email: cleanEmail, role: 'super_admin' });
        return;
      }

      let savedAdmins = [];
      try { savedAdmins = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch {}

      const matchedAdmin = savedAdmins.find(
        (adm) => adm.email.toLowerCase() === cleanEmail && String(adm.password).trim() === cleanPass
      );
      if (matchedAdmin) {
        setLoading(false);
        onLoginSuccess('admin', { email: matchedAdmin.email, role: matchedAdmin.role || 'saha_admin' });
        return;
      }

      setErrorMsg('Yetkisiz Giriş! Admin e-postası veya şifresi hatalı.');
      setLoading(false);
      return;
    }

    // ═══ 2. PERSONEL / ÇALIŞAN GİRİŞİ ═══
    let staffList = [];
    try { staffList = JSON.parse(localStorage.getItem('dogalim_staff') || '[]'); } catch {}

    const staffMember = staffList.find(
      s => s.email.toLowerCase() === cleanEmail && String(s.password).trim() === cleanPass
    );
    if (staffMember) {
      // Personelin ait olduğu mağazayı bul
      let storeApp = null;
      try {
        const apps = JSON.parse(localStorage.getItem('dogalim_applications') || '[]');
        storeApp = apps.find(a => a.id === staffMember.storeId);
      } catch {}

      setLoading(false);
      onLoginSuccess('seller', {
        storeName: storeApp?.storeName || staffMember.storeName || 'Doğalım Şarküteri',
        fullName: staffMember.name,
        email: staffMember.email,
        id: staffMember.storeId,       // mağazanın ID'si → aynı veriyi paylaşır
        patronPin: storeApp?.patronPin || '1234',
        isStaff: true,
        staffRole: staffMember.role    // 'tezgah' | 'patron'
      });
      return;
    }

    // ═══ 3. ŞARKÜTERİ İŞLETME SAHİBİ GİRİŞİ ═══
    let savedApps = [];
    try { savedApps = JSON.parse(localStorage.getItem('dogalim_applications') || '[]'); } catch {}

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
            id: userApp.id,
            patronPin: userApp.patronPin || '1234'  // 🆕 Dinamik PIN
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

    // ═══ 4. FIREBASE AUTH ═══
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      onLoginSuccess('seller', {
        storeName: userCredential.user.displayName || 'Doğalım Şarküteri',
        fullName: userCredential.user.displayName || 'İşletme Sahibi',
        email: userCredential.user.email,
        id: userCredential.user.uid,
        patronPin: '1234'
      });
    } catch {
      setErrorMsg('Giriş başarısız! Kayıtlı dükkan veya şifre bulunamadı.');
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // GOOGLE GİRİŞİ
  // ─────────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userEmail = user?.email ? user.email.toLowerCase() : '';

      if (activeTab === 'admin_login') {
        let savedAdmins = [];
        try { savedAdmins = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch {}
        const isRegisteredAdmin = savedAdmins.some(a => a.email?.toLowerCase() === userEmail);

        if (userEmail === ROOT_ADMIN || isRegisteredAdmin) {
          setLoading(false);
          onLoginSuccess('admin', { email: userEmail, role: userEmail === ROOT_ADMIN ? 'super_admin' : 'saha_admin' });
        } else {
          await signOut(auth);
          setErrorMsg(`Yetkisiz Giriş! (${userEmail}) admin listesinde tanımlı değildir.`);
          setLoading(false);
        }
      } else {
        setLoading(false);
        onLoginSuccess('seller', {
          storeName: user.displayName ? `${user.displayName} Şarküteri` : 'Doğalım Şarküteri',
          fullName: user.displayName || 'İşletme Sahibi',
          email: user.email,
          id: user.uid,
          patronPin: '1234'
        });
      }
    } catch {
      setErrorMsg('Google penceresi kapatıldı veya bağlantı kurulamadı.');
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ÖN BAŞVURU
  // ─────────────────────────────────────────────────────────────
  const handleApplySubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!applyForm.accountEmail || !applyForm.accountPassword) {
      setErrorMsg('Lütfen giriş e-postanızı ve şifrenizi belirleyin.');
      return;
    }
    if (applyForm.patronPin && (applyForm.patronPin.length !== 4 || isNaN(applyForm.patronPin))) {
      setErrorMsg('Patron PIN tam olarak 4 rakam olmalıdır!');
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
      id: 'store_' + Date.now().toString().slice(-6),
      storeName: applyForm.storeName,
      fullName: applyForm.fullName,
      applicantName: applyForm.fullName,
      email: applyForm.accountEmail.trim().toLowerCase(),
      password: applyForm.accountPassword.trim(),
      patronPin: applyForm.patronPin.trim() || '1234',   // 🆕
      phone: applyForm.phone,
      taxNumber: applyForm.taxNumber,
      address: applyForm.address,
      appointmentDate: applyForm.appointmentDate,
      appointmentTime: applyForm.appointmentTime,
      status: 'pending'
    };

    try {
      const existingApps = JSON.parse(localStorage.getItem('dogalim_applications') || '[]');
      const filtered = existingApps.filter(a => a.email !== newStoreApp.email);
      localStorage.setItem('dogalim_applications', JSON.stringify([newStoreApp, ...filtered]));
      setActiveTab('pending');
    } catch {
      setErrorMsg('Başvuru kaydedilirken bir hata oluştu.');
    }
  };

  const isAdminTab = activeTab === 'admin_login';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .dgl-login-root {
          min-height: 100vh; display: flex; justify-content: center; align-items: center;
          font-family: 'Inter', sans-serif; padding: 20px; position: relative; overflow: hidden;
          background: linear-gradient(135deg, #0a1628 0%, #0f2744 40%, #0d1f2d 70%, #071018 100%);
        }
        .dgl-login-root::before {
          content: ''; position: absolute; top: -40%; left: -20%; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%);
          animation: pulse-glow 6s ease-in-out infinite alternate;
        }
        .dgl-login-root::after {
          content: ''; position: absolute; bottom: -30%; right: -10%; width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%);
          animation: pulse-glow 8s ease-in-out infinite alternate-reverse;
        }
        @keyframes pulse-glow { 0% { transform: scale(1); opacity: .7; } 100% { transform: scale(1.2) translate(20px,-20px); opacity: 1; } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .dgl-card {
          background: rgba(255,255,255,0.05); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; padding: 36px 32px;
          width: 100%; max-width: 460px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 1px 0 rgba(255,255,255,0.1) inset;
          position: relative; z-index: 10; animation: fadeInUp 0.5s ease-out;
        }
        .dgl-logo-wrap { text-align: center; margin-bottom: 22px; }
        .dgl-logo-icon { display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: linear-gradient(135deg,#10b981,#059669); border-radius: 18px; font-size: 1.8rem; margin-bottom: 12px; box-shadow: 0 8px 32px rgba(16,185,129,0.4); }
        .dgl-logo-icon-admin { background: linear-gradient(135deg,#1e40af,#0284c7) !important; box-shadow: 0 8px 32px rgba(2,132,199,0.4) !important; }
        .dgl-title { margin:0; color:#fff; font-size:1.4rem; font-weight:800; letter-spacing:-0.02em; }
        .dgl-subtitle { margin:5px 0 0; color:rgba(255,255,255,0.4); font-size:.8rem; }
        .dgl-tab-container { display:flex; gap:6px; background:rgba(255,255,255,0.06); padding:5px; border-radius:14px; margin-bottom:22px; border:1px solid rgba(255,255,255,0.08); }
        .dgl-tab-btn { flex:1; padding:10px; border:none; border-radius:10px; cursor:pointer; font-size:.82rem; font-weight:600; font-family:inherit; transition:all .25s; background:transparent; color:rgba(255,255,255,.45); }
        .dgl-tab-btn:hover { color:rgba(255,255,255,.75); background:rgba(255,255,255,.06); }
        .dgl-tab-active-seller { background:linear-gradient(135deg,#10b981,#059669)!important; color:#fff!important; box-shadow:0 4px 16px rgba(16,185,129,.35); }
        .dgl-tab-active-admin { background:linear-gradient(135deg,#1e40af,#0284c7)!important; color:#fff!important; box-shadow:0 4px 16px rgba(2,132,199,.35); }
        .dgl-error-box { background:rgba(239,68,68,.12); color:#fca5a5; border:1px solid rgba(239,68,68,.3); border-radius:10px; padding:12px; font-size:.8rem; font-weight:600; margin-bottom:14px; text-align:center; }
        .dgl-admin-badge { background:linear-gradient(135deg,rgba(14,165,233,.15),rgba(30,64,175,.1)); color:#7dd3fc; padding:10px 14px; border-radius:10px; font-size:.78rem; font-weight:600; text-align:center; margin-bottom:16px; border:1px solid rgba(14,165,233,.2); }
        .dgl-form { display:flex; flex-direction:column; gap:12px; }
        .dgl-label { font-size:.76rem; font-weight:600; color:rgba(255,255,255,.55); margin-bottom:4px; display:block; }
        .dgl-input { padding:11px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.07); color:#fff; font-size:.88rem; font-family:inherit; outline:none; transition:all .2s; width:100%; }
        .dgl-input::placeholder { color:rgba(255,255,255,.25); }
        .dgl-input:focus { border-color:rgba(16,185,129,.5); background:rgba(16,185,129,.08); box-shadow:0 0 0 3px rgba(16,185,129,.1); }
        .dgl-input-admin:focus { border-color:rgba(14,165,233,.5)!important; background:rgba(14,165,233,.08)!important; box-shadow:0 0 0 3px rgba(14,165,233,.1)!important; }
        .dgl-input-row { display:flex; gap:10px; }
        .dgl-submit-btn { padding:13px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:12px; font-weight:700; font-size:.9rem; font-family:inherit; cursor:pointer; transition:all .25s; box-shadow:0 4px 16px rgba(16,185,129,.3); }
        .dgl-submit-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(16,185,129,.4); }
        .dgl-submit-btn:disabled { opacity:.6; cursor:not-allowed; }
        .dgl-admin-submit-btn { background:linear-gradient(135deg,#1e40af,#0284c7)!important; box-shadow:0 4px 16px rgba(2,132,199,.3)!important; }
        .dgl-admin-submit-btn:hover:not(:disabled) { box-shadow:0 8px 24px rgba(2,132,199,.4)!important; }
        .dgl-divider { display:flex; align-items:center; gap:12px; color:rgba(255,255,255,.2); font-size:.75rem; }
        .dgl-divider::before,.dgl-divider::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.1); }
        .dgl-google-btn { padding:12px; background:rgba(255,255,255,.06); color:rgba(255,255,255,.8); border:1px solid rgba(255,255,255,.1); border-radius:12px; font-weight:600; font-size:.85rem; font-family:inherit; cursor:pointer; transition:all .25s; }
        .dgl-google-btn:hover:not(:disabled) { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.2); transform:translateY(-1px); }
        .dgl-footer-row { display:flex; flex-direction:column; align-items:center; gap:4px; font-size:.8rem; color:rgba(255,255,255,.35); }
        .dgl-link-btn { background:none; border:none; color:#34d399; font-weight:700; cursor:pointer; font-size:.82rem; font-family:inherit; transition:color .2s; }
        .dgl-link-btn:hover { color:#6ee7b7; }
        .dgl-box-green { background:rgba(16,185,129,.08); border:1px solid rgba(16,185,129,.2); padding:12px; border-radius:12px; }
        .dgl-box-blue { background:rgba(14,165,233,.08); border:1px solid rgba(14,165,233,.2); padding:12px; border-radius:12px; }
        .dgl-box-orange { background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.2); padding:12px; border-radius:12px; }
        .dgl-box-label-green { font-size:.76rem; font-weight:700; color:#34d399; display:block; margin-bottom:8px; }
        .dgl-box-label-blue { font-size:.76rem; font-weight:700; color:#7dd3fc; display:block; margin-bottom:8px; }
        .dgl-box-label-orange { font-size:.76rem; font-weight:700; color:#fbbf24; display:block; margin-bottom:8px; }
        .dgl-select { padding:11px 14px; border-radius:10px; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.07); color:#fff; font-size:.88rem; font-family:inherit; outline:none; transition:all .2s; width:100%; cursor:pointer; appearance:none; }
        .dgl-select option { background:#1e293b; color:#fff; }
        .dgl-check-label { display:flex; align-items:center; gap:8px; font-size:.75rem; color:rgba(255,255,255,.5); cursor:pointer; }
        .dgl-check-label input { width:14px; height:14px; accent-color:#10b981; cursor:pointer; }
        .dgl-cancel-link { background:none; border:none; color:rgba(255,255,255,.35); cursor:pointer; font-size:.8rem; font-family:inherit; text-align:center; transition:color .2s; }
        .dgl-cancel-link:hover { color:rgba(255,255,255,.6); }
        .dgl-pending-box { text-align:center; display:flex; flex-direction:column; align-items:center; gap:14px; padding:20px 0; }
        .dgl-pending-icon { width:72px; height:72px; background:rgba(16,185,129,.15); border:2px solid rgba(16,185,129,.3); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; }
        .dgl-password-wrap { position:relative; }
        .dgl-password-wrap .dgl-input { padding-right:44px; }
        .dgl-eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,.3); font-size:1rem; padding:0; transition:color .2s; }
        .dgl-eye-btn:hover { color:rgba(255,255,255,.7); }
        .dgl-particles { position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; overflow:hidden; z-index:1; }
        .dgl-particle { position:absolute; width:2px; height:2px; border-radius:50%; animation:float-particle linear infinite; }
        @keyframes float-particle { 0%{transform:translateY(100vh) scale(0);opacity:0;} 10%{opacity:1;} 90%{opacity:.5;} 100%{transform:translateY(-100px) scale(1);opacity:0;} }
      `}</style>

      <div className="dgl-login-root">
        <div className="dgl-particles">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="dgl-particle" style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${8 + Math.random() * 12}s`,
              animationDelay: `${Math.random() * 8}s`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              background: i % 3 === 0 ? 'rgba(16,185,129,0.5)' : i % 3 === 1 ? 'rgba(14,165,233,0.4)' : 'rgba(99,102,241,0.4)'
            }} />
          ))}
        </div>

        <div className="dgl-card">
          {/* HEADER */}
          <div className="dgl-logo-wrap">
            <div className={`dgl-logo-icon ${isAdminTab ? 'dgl-logo-icon-admin' : ''}`}>
              {isAdminTab ? '🛡️' : '🍃'}
            </div>
            <h2 className="dgl-title">DOĞALİM PLATFORM</h2>
            <p className="dgl-subtitle">Saha & Şarküteri Yönetim Portalı</p>
          </div>

          {/* TABS */}
          {activeTab !== 'pending' && activeTab !== 'seller_apply' && (
            <div className="dgl-tab-container">
              <button type="button" onClick={() => { setActiveTab('seller_login'); setErrorMsg(''); }}
                className={`dgl-tab-btn ${activeTab === 'seller_login' ? 'dgl-tab-active-seller' : ''}`}>
                🏪 Şarküteri Girişi
              </button>
              <button type="button" onClick={() => { setActiveTab('admin_login'); setErrorMsg(''); }}
                className={`dgl-tab-btn ${activeTab === 'admin_login' ? 'dgl-tab-active-admin' : ''}`}>
                🛡️ Yönetim (Admin)
              </button>
            </div>
          )}

          {errorMsg && <div className="dgl-error-box">⚠️ {errorMsg}</div>}

          {/* ── 1. ŞARKÜTERİ GİRİŞİ ── */}
          {activeTab === 'seller_login' && (
            <form onSubmit={handleEmailLogin} className="dgl-form">
              <div><label className="dgl-label">E-Posta Adresi</label>
                <input type="email" placeholder="esnaf@dogalim.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="dgl-input" required />
              </div>
              <div><label className="dgl-label">Şifre</label>
                <div className="dgl-password-wrap">
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="dgl-input" required />
                  <button type="button" className="dgl-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="dgl-submit-btn">
                {loading ? '⏳ Giriş Yapılıyor...' : '🏪 Şarküteri Paneline Giriş Yap'}
              </button>
              <div className="dgl-divider">veya</div>
              <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="dgl-google-btn">
                🌐 Google ile Esnaf Girişi
              </button>
              <div className="dgl-footer-row">
                <span>Doğalım'da henüz dükkanınız yok mu?</span>
                <button type="button" onClick={() => setActiveTab('seller_apply')} className="dgl-link-btn">
                  Şarküteri Ön Başvurusu Yap →
                </button>
              </div>
            </form>
          )}

          {/* ── 2. ADMİN GİRİŞİ ── */}
          {activeTab === 'admin_login' && (
            <form onSubmit={handleEmailLogin} className="dgl-form">
              <div className="dgl-admin-badge">
                🔒 Doğalım Sistem Yöneticisi Girişi
                <div style={{ fontSize: '.72rem', fontWeight: '400', marginTop: '3px', color: 'rgba(125,211,252,.7)' }}>
                  Yalnızca yetkilendirilmiş admin mailleri erişebilir.
                </div>
              </div>
              <div><label className="dgl-label">Admin E-Posta</label>
                <input type="email" placeholder="admin@dogalim.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} className="dgl-input dgl-input-admin" required />
              </div>
              <div><label className="dgl-label">Yönetici Şifresi</label>
                <div className="dgl-password-wrap">
                  <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="dgl-input dgl-input-admin" required />
                  <button type="button" className="dgl-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="dgl-submit-btn dgl-admin-submit-btn">
                {loading ? '⏳ Giriş Yapılıyor...' : '🛡️ Admin Paneline Giriş Yap'}
              </button>
              <div className="dgl-divider">veya</div>
              <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="dgl-google-btn">
                🌐 Google ile Admin Girişi
              </button>
            </form>
          )}

          {/* ── 3. ÖN BAŞVURU FORMU ── */}
          {activeTab === 'seller_apply' && (
            <form onSubmit={handleApplySubmit} className="dgl-form">
              {/* Giriş Bilgileri */}
              <div className="dgl-box-green">
                <span className="dgl-box-label-green">🔑 Dükkan Giriş Bilgilerinizi Belirleyin</span>
                <div className="dgl-input-row">
                  <input type="email" placeholder="Giriş E-Postası" value={applyForm.accountEmail}
                    onChange={(e) => setApplyForm({ ...applyForm, accountEmail: e.target.value })}
                    className="dgl-input" required />
                  <input type="password" placeholder="Şifreniz" value={applyForm.accountPassword}
                    onChange={(e) => setApplyForm({ ...applyForm, accountPassword: e.target.value })}
                    className="dgl-input" required />
                </div>
              </div>

              {/* Patron PIN */}
              <div className="dgl-box-orange">
                <span className="dgl-box-label-orange">👑 Patron Modu PIN (4 Rakam)</span>
                <input
                  type="password"
                  placeholder="Örn: 5823  (Boş bırakılırsa 1234 olur)"
                  maxLength={4}
                  value={applyForm.patronPin}
                  onChange={(e) => setApplyForm({ ...applyForm, patronPin: e.target.value.replace(/\D/g, '') })}
                  className="dgl-input"
                  style={{ letterSpacing: '6px', textAlign: 'center', fontSize: '1.1rem' }}
                />
                <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)', marginTop: '6px' }}>
                  Bu PIN ile çalışanlardan bağımsız olarak Patron Moduna geçiş yapabilirsiniz.
                </div>
              </div>

              {/* Ad Soyad & Dükkan */}
              <div><label className="dgl-label">Ad Soyad & Dükkan Unvanı</label>
                <div className="dgl-input-row">
                  <input type="text" placeholder="Yetkili Ad Soyad" value={applyForm.fullName}
                    onChange={(e) => setApplyForm({ ...applyForm, fullName: e.target.value })}
                    className="dgl-input" required />
                  <input type="text" placeholder="Dükkan Unvanı" value={applyForm.storeName}
                    onChange={(e) => setApplyForm({ ...applyForm, storeName: e.target.value })}
                    className="dgl-input" required />
                </div>
              </div>

              <div className="dgl-input-row">
                <input type="tel" placeholder="Telefon" value={applyForm.phone}
                  onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                  className="dgl-input" required />
                <input type="text" placeholder="Vergi No / TCKN" value={applyForm.taxNumber}
                  onChange={(e) => setApplyForm({ ...applyForm, taxNumber: e.target.value })}
                  className="dgl-input" required />
              </div>

              <div><label className="dgl-label">Dükkan Açık Adresi</label>
                <textarea placeholder="Mahalle, cadde, kapı no..." value={applyForm.address}
                  onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })}
                  className="dgl-input" style={{ height: '52px', resize: 'none' }} required />
              </div>

              {/* Randevu */}
              <div className="dgl-box-blue">
                <span className="dgl-box-label-blue">🤝 Saha İncelemesi & Randevu Tarihi</span>
                <div className="dgl-input-row">
                  <input type="date" value={applyForm.appointmentDate}
                    onChange={(e) => setApplyForm({ ...applyForm, appointmentDate: e.target.value })}
                    className="dgl-input" required />
                  <select value={applyForm.appointmentTime}
                    onChange={(e) => setApplyForm({ ...applyForm, appointmentTime: e.target.value })}
                    className="dgl-select">
                    <option value="10:00">10:00 - 12:00</option>
                    <option value="14:00">14:00 - 16:00</option>
                    <option value="16:00">16:00 - 18:00</option>
                  </select>
                </div>
              </div>

              {/* KVKK */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="dgl-check-label">
                  <input type="checkbox" checked={applyForm.kvkkAccepted}
                    onChange={(e) => setApplyForm({ ...applyForm, kvkkAccepted: e.target.checked })} />
                  <span>KVKK Aydınlatma Metni'ni okudum, onaylıyorum.</span>
                </label>
                <label className="dgl-check-label">
                  <input type="checkbox" checked={applyForm.privacyAccepted}
                    onChange={(e) => setApplyForm({ ...applyForm, privacyAccepted: e.target.checked })} />
                  <span>Gizlilik ve Satıcı Taahhütnamesini kabul ediyorum.</span>
                </label>
              </div>

              <button type="submit" className="dgl-submit-btn">📋 Ön Başvuruyu Gönder</button>
              <button type="button" onClick={() => setActiveTab('seller_login')} className="dgl-cancel-link">
                ← Satıcı Girişine Dön
              </button>
            </form>
          )}

          {/* ── 4. BAŞVURU ALINDI ── */}
          {activeTab === 'pending' && (
            <div className="dgl-pending-box">
              <div className="dgl-pending-icon">✅</div>
              <div>
                <h3 style={{ margin: '0 0 6px 0', color: '#fff', fontWeight: '700' }}>Başvurunuz Alındı!</h3>
                <p style={{ margin: 0, fontSize: '.85rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>
                  Dükkan kaydınız oluşturuldu. Admin onayından sonra sisteme giriş yapabilirsiniz.
                </p>
              </div>
              <button onClick={() => setActiveTab('seller_login')} className="dgl-submit-btn" style={{ width: '100%' }}>
                Giriş Ekranına Dön
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}