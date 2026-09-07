import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Orders from './Orders';
import Products from './Products';
import Disputes from './Disputes';
import Financials from './Financials';
import AiAssistant from './aiAssistant';
import Logistics from './logistics';

// ─── Personel Yönetimi bileşeni ─────────────────────────────────────────────
function StaffManager({ storeId, storeName, storePin }) {
  const getStoreStaff = () => {
    try {
      const all = JSON.parse(localStorage.getItem('dogalim_staff') || '[]');
      return all.filter(s => s.storeId === storeId);
    } catch { return []; }
  };

  const saveAllStaff = (newStoreStaff) => {
    try {
      const all = JSON.parse(localStorage.getItem('dogalim_staff') || '[]');
      const others = all.filter(s => s.storeId !== storeId);
      localStorage.setItem('dogalim_staff', JSON.stringify([...others, ...newStoreStaff]));
    } catch {}
  };

  const [staffList, setStaffList] = useState(getStoreStaff);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'tezgah' });
  const [notice, setNotice] = useState('');
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  const showNotice = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 3500); };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;

    const cleanEmail = form.email.trim().toLowerCase();
    const updated = staffList.filter(s => s.email !== cleanEmail);
    const newStaff = [...updated, {
      id: 'staff_' + Date.now(),
      storeId,
      storeName,
      name: form.name.trim(),
      email: cleanEmail,
      password: form.password.trim(),
      role: form.role,
      addedAt: new Date().toLocaleDateString('tr-TR')
    }];
    setStaffList(newStaff);
    saveAllStaff(newStaff);
    setForm({ name: '', email: '', password: '', role: 'tezgah' });
    showNotice(`✅ "${form.name}" personel olarak eklendi.`);
  };

  const handleRemove = (id) => {
    const updated = staffList.filter(s => s.id !== id);
    setStaffList(updated);
    saveAllStaff(updated);
    setConfirmRemoveId(null);
    showNotice('🗑️ Personel hesabı silindi.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2>👥 Personel Yönetimi</h2>
        <p style={{ color: '#64748b', fontSize: '.9rem', margin: '4px 0 0 0' }}>
          Çalışanlarınıza bu mağazaya özel giriş bilgisi tanımlayın. Personel kendi mailiyle giriş yapar.
        </p>
      </div>

      {/* PERSONEL EKLEME FORMU */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h4 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: '.95rem' }}>➕ Yeni Personel Ekle / Güncelle</h4>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 160px' }}>
            <label style={styles.formLabel}>Ad Soyad</label>
            <input type="text" placeholder="Çalışan adı..." value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={styles.formInput} required />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={styles.formLabel}>E-Posta (Giriş için)</label>
            <input type="email" placeholder="calisan@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={styles.formInput} required />
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <label style={styles.formLabel}>Şifre</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.formInput} required />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label style={styles.formLabel}>Yetki Rolü</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={styles.formSelect}>
              <option value="tezgah">🛡️ Tezgahtar</option>
              <option value="patron">👑 Patron</option>
            </select>
          </div>
          <button type="submit" style={{ padding: '11px 20px', background: 'linear-gradient(135deg,#0284c7,#0369a1)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(2,132,199,.25)', flex: '0 0 auto' }}>
            👤 Ekle / Güncelle
          </button>
        </form>
        {notice && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px', color: '#15803d', fontSize: '.82rem', fontWeight: '700', border: '1px solid #bbf7d0' }}>
            {notice}
          </div>
        )}
      </div>

      {/* PIN BİLGİSİ */}
      <div style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a20)', borderRadius: '12px', border: '1px solid #fcd34d', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '1.4rem' }}>🔑</span>
        <div>
          <div style={{ fontWeight: '800', color: '#92400e', fontSize: '.9rem' }}>Patron Modu PIN Şifreniz</div>
          <div style={{ fontSize: '.82rem', color: '#b45309', marginTop: '2px' }}>
            Patron moduna geçmek için PIN: <b style={{ letterSpacing: '4px', fontFamily: 'monospace', fontSize: '1rem' }}>{storePin}</b>
            <span style={{ marginLeft: '12px', opacity: '.6' }}>— Başvuru sırasında belirlendi.</span>
          </div>
        </div>
      </div>

      {/* PERSONEL LİSTESİ */}
      {staffList.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '14px', border: '2px dashed #e2e8f0', padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👤</div>
          <div style={{ fontWeight: '700', marginBottom: '4px', color: '#475569' }}>Henüz personel eklenmemiş</div>
          <div style={{ fontSize: '.82rem' }}>Yukarıdaki form ile çalışanlarınıza erişim tanımlayabilirsiniz.</div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Ad Soyad', 'E-Posta', 'Şifre', 'Yetki', 'Eklenme', 'İşlem'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '.75rem', fontWeight: '700', color: '#64748b', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffList.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background .15s' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a', fontSize: '.88rem' }}>{s.name}</td>
                  <td style={{ padding: '12px 14px', color: '#334155', fontSize: '.85rem' }}>{s.email}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#94a3b8', fontSize: '.85rem' }}>{'•'.repeat(Math.min(s.password.length, 8))}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '.72rem', fontWeight: '700',
                      background: s.role === 'patron' ? 'linear-gradient(135deg,#dcfce7,#bbf7d0)' : 'linear-gradient(135deg,#fef3c7,#fde68a)',
                      color: s.role === 'patron' ? '#15803d' : '#92400e',
                      border: `1px solid ${s.role === 'patron' ? '#86efac' : '#fcd34d'}`
                    }}>
                      {s.role === 'patron' ? '👑 Patron' : '🛡️ Tezgahtar'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '.78rem' }}>{s.addedAt || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {confirmRemoveId === s.id ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleRemove(s.id)} style={{ padding: '5px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '.75rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                          ✓ Sil
                        </button>
                        <button onClick={() => setConfirmRemoveId(null)} style={{ padding: '5px 10px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '.75rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmRemoveId(s.id)} style={{ padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '.75rem', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                        🗑️ Kaldır
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Ana Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ onLogout, storeData }) {
  const storeId = storeData?.id || 'guest';
  const storeName = storeData?.storeName || 'DOĞALİM ŞARKÜTERİ';
  const ownerName = storeData?.fullName || storeData?.applicantName || 'Dükkan Yöneticisi';
  const avatarLetter = storeName.charAt(0).toUpperCase();

  // Personel ise: kendi rolünde sabitle, mod değiştirme yok
  const isStaff = storeData?.isStaff || false;
  const staffRole = storeData?.staffRole; // 'tezgah' | 'patron' | undefined
  const storedPin = storeData?.patronPin || '1234'; // başvurudan gelen PIN

  const [userRole, setUserRole] = useState(() => {
    if (isStaff && staffRole) return staffRole; // personel: kendi rolü
    return 'tezgah'; // işletme sahibi: tezgahtan başla
  });

  const [activeTab, setActiveTab] = useState('orders');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    else await signOut(auth);
  };

  const handleRoleToggleClick = () => {
    if (userRole === 'patron') {
      setUserRole('tezgah');
      setActiveTab('orders');
    } else {
      setPinInput('');
      setPinError(false);
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === storedPin) {
      setUserRole('patron');
      setShowPinModal(false);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // Personel için mod değiştirme butonu yok
  const canSwitchRole = !isStaff;

  const navItems = [
    { id: 'orders', icon: '📦', label: 'Siparişler & Tartı' },
    { id: 'logistics', icon: '🛵', label: 'Kurye & Lojistik' },
    { id: 'products', icon: '🏷️', label: 'Yöresel Ürün Kataloğu' },
    { id: 'disputes', icon: '🛡️', label: 'Destek & Kısmi İade' },
  ];

  const patronNavItems = [
    { id: 'financials', icon: '📊', label: 'Finans & Ciro Analizi' },
    { id: 'ai-assistant', icon: '🤖', label: 'AI Esnaf Danışmanı' },
    { id: 'staff', icon: '👥', label: 'Personel Yönetimi' },
  ];

  const headerTitles = {
    orders: `${storeName} — Sipariş & Tartı`,
    logistics: 'Yerel Kurye & Soğuk Zincir',
    products: 'Yöresel Ürün & Stok Kataloğu',
    disputes: 'Destek & Kısmi İade Yönetimi',
    financials: 'Finansal Raporlar & Ciro',
    'ai-assistant': 'Doğalım AI Danışmanı',
    staff: 'Personel Yönetimi'
  };
  const headerSubs = {
    orders: 'Siparişleri tartın, ikram ekleyin ve mutfak fişi bastırın.',
    logistics: 'PostGIS mesafeli yerel kurye ataması ve kutu içi sıcaklık takibi.',
    products: 'Yöre bilgisi, dinlendirme süreleri ve soğuk zincir seçenekleri.',
    disputes: 'Kargo hasarları, vakum bozulmaları ve müşteri talepleri.',
    financials: 'Mağaza cirosu, hakedişler, ikram maliyetleri ve net kâr.',
    'ai-assistant': 'Şarküteri stok ve satışlarına özel yapay zeka tavsiyeleri.',
    staff: 'Çalışanlarınıza mağazaya özel giriş bilgisi tanımlayın.'
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .dsh-layout { display:flex; min-height:100vh; background:#f0f4f8; font-family:'Inter',sans-serif; color:#334155; }
        .dsh-sidebar { width:272px; min-width:272px; background:linear-gradient(180deg,#0a1628 0%,#0f2744 50%,#0a1e35 100%); display:flex; flex-direction:column; justify-content:space-between; position:sticky; top:0; height:100vh; overflow-y:auto; box-shadow:4px 0 24px rgba(0,0,0,.2); }
        .dsh-sidebar-top { padding:24px 16px 16px; }
        .dsh-brand { display:flex; align-items:center; gap:12px; padding:12px; margin-bottom:28px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); border-radius:14px; }
        .dsh-logo-icon-wrap { width:42px; height:42px; min-width:42px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; background:linear-gradient(135deg,#10b981,#059669); border-radius:10px; box-shadow:0 4px 12px rgba(16,185,129,.35); }
        .dsh-brand-text { display:flex; flex-direction:column; overflow:hidden; flex:1; }
        .dsh-logo-title { margin:0; font-size:.9rem; font-weight:700; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .dsh-logo-sub { font-size:.67rem; color:rgba(255,255,255,.3); margin-top:1px; }
        .dsh-role-badge { font-size:.62rem; font-weight:700; padding:3px 8px; border-radius:6px; letter-spacing:.04em; white-space:nowrap; flex-shrink:0; }
        .dsh-nav { display:flex; flex-direction:column; gap:3px; }
        .dsh-nav-section-label { font-size:.65rem; font-weight:700; color:rgba(255,255,255,.25); letter-spacing:.08em; text-transform:uppercase; padding:12px 14px 4px; margin-top:6px; }
        .dsh-nav-btn { display:flex; align-items:center; gap:10px; padding:11px 14px; background:transparent; color:rgba(255,255,255,.5); border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:500; font-family:'Inter',sans-serif; text-align:left; width:100%; transition:all .2s; position:relative; }
        .dsh-nav-btn:hover { background:rgba(255,255,255,.07); color:rgba(255,255,255,.85); transform:translateX(2px); }
        .dsh-nav-btn-active { background:linear-gradient(135deg,rgba(16,185,129,.2),rgba(5,150,105,.1))!important; color:#34d399!important; font-weight:700!important; border:1px solid rgba(16,185,129,.2); }
        .dsh-nav-btn-active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:65%; background:linear-gradient(180deg,#10b981,#059669); border-radius:0 3px 3px 0; }
        .dsh-nav-icon { font-size:1.05rem; min-width:20px; text-align:center; }
        .dsh-sidebar-footer { padding:16px; border-top:1px solid rgba(255,255,255,.06); }
        .dsh-role-toggle { width:100%; padding:11px 14px; border:none; border-radius:10px; cursor:pointer; font-weight:700; font-size:.82rem; font-family:'Inter',sans-serif; transition:all .25s; margin-bottom:14px; letter-spacing:.01em; }
        .dsh-role-toggle-tezgah { background:linear-gradient(135deg,#d97706,#b45309); color:#fff; box-shadow:0 4px 14px rgba(217,119,6,.3); }
        .dsh-role-toggle-patron { background:linear-gradient(135deg,#10b981,#059669); color:#fff; box-shadow:0 4px 14px rgba(16,185,129,.3); }
        .dsh-role-toggle:hover { transform:translateY(-1px); filter:brightness(1.08); }
        .dsh-user-card { display:flex; align-items:center; gap:10px; padding:10px 12px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:10px; margin-bottom:10px; }
        .dsh-avatar { width:38px; height:38px; min-width:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; font-size:1rem; }
        .dsh-user-name { font-size:.85rem; font-weight:700; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:150px; }
        .dsh-user-role-text { font-size:.68rem; color:rgba(255,255,255,.35); }
        .dsh-logout-btn { width:100%; padding:9px; background:rgba(239,68,68,.08); color:#f87171; border:1px solid rgba(239,68,68,.15); border-radius:8px; cursor:pointer; font-weight:700; font-size:.82rem; font-family:'Inter',sans-serif; transition:all .2s; }
        .dsh-logout-btn:hover { background:rgba(239,68,68,.15); color:#fca5a5; }
        .dsh-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
        .dsh-header { background:#fff; border-bottom:1px solid #e2e8f0; padding:20px 32px; display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:50; box-shadow:0 1px 8px rgba(0,0,0,.04); }
        .dsh-header-title { margin:0; font-size:1.3rem; color:#0f172a; font-weight:700; }
        .dsh-header-sub { margin:4px 0 0; color:#64748b; font-size:.84rem; }
        .dsh-role-indicator { padding:7px 16px; border-radius:20px; font-size:.8rem; font-weight:700; display:flex; align-items:center; gap:6px; }
        .dsh-content { flex:1; padding:32px; overflow-y:auto; }
        .dsh-modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(10,22,40,.7); display:flex; justify-content:center; align-items:center; z-index:1000; backdrop-filter:blur(4px); }
        .dsh-modal-card { background:#fff; padding:28px; border-radius:16px; width:90%; max-width:360px; box-shadow:0 32px 64px rgba(0,0,0,.25); animation:slideUp .2s ease; }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
        .dsh-pin-input { width:100%; padding:14px; border-radius:10px; border:2px solid #e2e8f0; font-size:1.5rem; text-align:center; letter-spacing:8px; font-weight:700; outline:none; transition:border-color .2s; font-family:monospace; }
        .dsh-pin-input:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,.1); }
        .dsh-pin-input-error { border-color:#ef4444!important; box-shadow:0 0 0 3px rgba(239,68,68,.1)!important; }
        .dsh-modal-save-btn { flex:1; padding:12px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:10px; font-weight:700; font-size:.9rem; font-family:'Inter',sans-serif; cursor:pointer; transition:all .2s; box-shadow:0 4px 12px rgba(16,185,129,.3); }
        .dsh-modal-save-btn:hover { transform:translateY(-1px); }
        .dsh-modal-cancel-btn { flex:1; padding:12px; background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0; border-radius:10px; font-weight:700; font-size:.9rem; font-family:'Inter',sans-serif; cursor:pointer; transition:all .2s; }
        .dsh-modal-cancel-btn:hover { background:#e2e8f0; }
        .dsh-staff-badge { font-size:.7rem; font-weight:700; padding:2px 8px; border-radius:6px; margin-left:6px; }
      `}</style>

      <div className="dsh-layout">
        {/* ── SIDEBAR ── */}
        <aside className="dsh-sidebar">
          <div className="dsh-sidebar-top">
            <div className="dsh-brand">
              <div className="dsh-logo-icon-wrap">🍃</div>
              <div className="dsh-brand-text">
                <h2 className="dsh-logo-title">{storeName}</h2>
                <span className="dsh-logo-sub">Doğalım İşletme Portalı</span>
              </div>
              <span className="dsh-role-badge" style={{
                backgroundColor: userRole === 'patron' ? 'rgba(16,185,129,.2)' : 'rgba(217,119,6,.2)',
                color: userRole === 'patron' ? '#34d399' : '#fbbf24',
                border: `1px solid ${userRole === 'patron' ? 'rgba(16,185,129,.3)' : 'rgba(217,119,6,.3)'}`
              }}>
                {userRole === 'patron' ? '👑 PATRON' : '🛡️ TEZGAH'}
              </span>
            </div>

            <nav className="dsh-nav">
              <div className="dsh-nav-section-label">Ana Menü</div>
              {navItems.map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                  className={`dsh-nav-btn ${activeTab === item.id ? 'dsh-nav-btn-active' : ''}`}>
                  <span className="dsh-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}

              {userRole === 'patron' && (
                <>
                  <div className="dsh-nav-section-label" style={{ marginTop: '8px' }}>Patron Yetkisi</div>
                  {patronNavItems.map((item) => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)}
                      className={`dsh-nav-btn ${activeTab === item.id ? 'dsh-nav-btn-active' : ''}`}>
                      <span className="dsh-nav-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className="dsh-sidebar-footer">
            {/* Mod değiştirme butonu — sadece işletme sahibi için */}
            {canSwitchRole && (
              <button onClick={handleRoleToggleClick}
                className={`dsh-role-toggle ${userRole === 'patron' ? 'dsh-role-toggle-patron' : 'dsh-role-toggle-tezgah'}`}>
                {userRole === 'tezgah' ? '🔓 Patron Moduna Geç (Şifreli)' : '🔒 Tezgah Moduna Dön'}
              </button>
            )}

            {/* Personel ise mod bilgisi */}
            {isStaff && (
              <div style={{ marginBottom: '14px', padding: '10px 12px', background: 'rgba(255,255,255,.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,.07)', fontSize: '.78rem', color: 'rgba(255,255,255,.45)', textAlign: 'center' }}>
                {staffRole === 'patron' ? '👑 Patron olarak giriş yapıldı' : '🛡️ Tezgahtar olarak giriş yapıldı'}
              </div>
            )}

            <div className="dsh-user-card">
              <div className="dsh-avatar" style={{ background: `linear-gradient(135deg, ${userRole === 'patron' ? '#10b981, #059669' : '#d97706, #b45309'})` }}>
                {avatarLetter}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div className="dsh-user-name">{ownerName}</div>
                <div className="dsh-user-role-text">
                  {isStaff ? '👤 Personel Hesabı' : userRole === 'patron' ? '👑 İşletme Sahibi' : '🛡️ Tezgahtar Modu'}
                </div>
              </div>
            </div>

            <button onClick={handleLogout} className="dsh-logout-btn">⬡ Çıkış Yap</button>
          </div>
        </aside>

        {/* ── ANA İÇERİK ── */}
        <main className="dsh-main">
          <header className="dsh-header">
            <div>
              <h1 className="dsh-header-title">{headerTitles[activeTab]}</h1>
              <p className="dsh-header-sub">{headerSubs[activeTab]}</p>
            </div>
            <span className="dsh-role-indicator" style={{
              backgroundColor: userRole === 'patron' ? '#d1fae5' : '#fef3c7',
              color: userRole === 'patron' ? '#065f46' : '#92400e'
            }}>
              {isStaff && <span className="dsh-staff-badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>Personel</span>}
              {userRole === 'patron' ? '👑 Patron Yetkisi Açık' : '🛡️ Tezgahtar Modu'}
            </span>
          </header>

          <div className="dsh-content">
            {activeTab === 'orders' && <Orders userRole={userRole} storeData={storeData} />}
            {activeTab === 'logistics' && <Logistics userRole={userRole} storeData={storeData} />}
            {activeTab === 'products' && <Products userRole={userRole} storeData={storeData} />}
            {activeTab === 'disputes' && <Disputes userRole={userRole} storeData={storeData} />}
            {activeTab === 'financials' && <Financials userRole={userRole} storeData={storeData} />}
            {activeTab === 'ai-assistant' && <AiAssistant userRole={userRole} storeData={storeData} />}
            {activeTab === 'staff' && (
              <StaffManager storeId={storeId} storeName={storeName} storePin={storedPin} />
            )}
          </div>
        </main>

        {/* ── PATRON PIN MODALI ── */}
        {showPinModal && (
          <div className="dsh-modal-overlay">
            <div className="dsh-modal-card">
              <h3 style={{ marginTop: 0, color: '#0f172a', fontWeight: '800', fontSize: '1.15rem' }}>
                🔑 Patron Modu Girişi
              </h3>
              <p style={{ fontSize: '.88rem', color: '#64748b', margin: '0 0 16px 0' }}>
                Başvurunuzda belirlediğiniz 4 haneli PIN kodunu girin.
              </p>
              <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="password"
                  placeholder="• • • •"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className={`dsh-pin-input ${pinError ? 'dsh-pin-input-error' : ''}`}
                  autoFocus
                />
                {pinError && (
                  <span style={{ color: '#ef4444', fontSize: '.82rem', textAlign: 'center', fontWeight: '700' }}>
                    ❌ Hatalı PIN! Tekrar deneyin.
                  </span>
                )}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="dsh-modal-save-btn">Giriş Yap</button>
                  <button type="button" onClick={() => setShowPinModal(false)} className="dsh-modal-cancel-btn">İptal</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  formLabel: { fontSize: '.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '4px' },
  formInput: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .2s', color: '#0f172a', background: '#f8fafc' },
  formSelect: { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', background: '#f8fafc', color: '#0f172a', cursor: 'pointer' }
};