import React, { useState, useEffect } from 'react';

const SUPER_ADMIN_EMAIL = 'kasapozgur61@gmail.com';
const STORAGE_KEY = 'dogalim_admins';

export default function AdminPanel({ onLogout, currentAdminEmail = SUPER_ADMIN_EMAIL }) {
  const isSuperAdmin = currentAdminEmail.toLowerCase() === SUPER_ADMIN_EMAIL;

  const [adminList, setAdminList] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminNotice, setAdminNotice] = useState({ msg: '', type: 'success' });

  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('dogalim_applications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'store_101',
        storeName: 'Trabzon Gurme Yöresel',
        fullName: 'Ahmet Turgut',
        phone: '0532 000 00 00',
        taxNumber: '1234567890',
        address: 'Meydan Mah. Maraş Cad. No:45 Trabzon',
        email: 'ahmet@gurme.com',
        appointmentDate: '2026-08-10',
        appointmentTime: '10:00',
        status: 'pending'
      }
    ];
  });

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [updatedPassword, setUpdatedPassword] = useState('');

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const list = saved ? JSON.parse(saved) : [];
      setAdminList(list);
    } catch (e) {
      setAdminList([]);
    }
  };

  const showNotice = (msg, type = 'success') => {
    setAdminNotice({ msg, type });
    setTimeout(() => setAdminNotice({ msg: '', type: 'success' }), 4000);
  };

  // Yeni Yetkili Ekle
  const handleCreateAdmin = (e) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    const cleanPass = newPassword.trim();

    if (!cleanEmail || !cleanPass) return;

    const existing = [...adminList];
    const index = existing.findIndex(a => a.email.toLowerCase() === cleanEmail);

    if (index > -1) {
      existing[index].password = cleanPass;
      showNotice(`🔄 "${cleanEmail}" şifresi güncellendi!`, 'info');
    } else {
      existing.push({
        id: 'adm_' + Date.now(),
        email: cleanEmail,
        password: cleanPass,
        role: 'Saha Yetkilisi',
        createdAt: new Date().toLocaleDateString('tr-TR')
      });
      showNotice(`✅ "${cleanEmail}" admin olarak tanımlandı!`, 'success');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    setAdminList(existing);
    setNewEmail('');
    setNewPassword('');
  };

  // Yetkili Sil
  const handleDeleteAdmin = (email) => {
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL) {
      alert('⛔ Süper Admin hesabı silinemez!');
      return;
    }
    if (window.confirm(`"${email}" yetkisini silmek istediğinize emin misiniz?`)) {
      const filtered = adminList.filter(a => a.email.toLowerCase() !== email.toLowerCase());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      setAdminList(filtered);
      showNotice(`🗑️ "${email}" yetkisi silindi.`, 'error');
    }
  };

  // Şifre Değiştir
  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!updatedPassword.trim() || !editingAdmin) return;

    const updated = adminList.map(a => {
      if (a.email.toLowerCase() === editingAdmin.email.toLowerCase()) {
        return { ...a, password: updatedPassword.trim() };
      }
      return a;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAdminList(updated);

    showNotice(`🔑 "${editingAdmin.email}" için şifre güncellendi!`, 'info');
    setEditingAdmin(null);
    setUpdatedPassword('');
  };

  // Başvuru Onayla
  const handleApprove = (id) => {
    const updated = applications.map(app =>
      (app.id === id || String(app.id) === String(id)) ? { ...app, status: 'approved' } : app
    );
    setApplications(updated);
    localStorage.setItem('dogalim_applications', JSON.stringify(updated));
  };

  // Başvuru Reddet
  const handleReject = (id) => {
    if (!window.confirm('Bu başvuruyu reddetmek istediğinize emin misiniz?')) return;
    const updated = applications.map(app =>
      (app.id === id || String(app.id) === String(id)) ? { ...app, status: 'rejected' } : app
    );
    setApplications(updated);
    localStorage.setItem('dogalim_applications', JSON.stringify(updated));
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const totalAdmins = adminList.length + 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        .adm-root {
          min-height: 100vh;
          background: linear-gradient(160deg, #f0f4f8 0%, #e8edf2 100%);
          font-family: 'Inter', sans-serif;
          color: #334155;
        }

        /* HEADER */
        .adm-header {
          background: linear-gradient(135deg, #0a1628 0%, #0f2744 100%);
          padding: 18px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .adm-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .adm-header-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2));
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 12px;
        }

        .adm-header-title {
          margin: 0;
          color: #f8fafc;
          font-size: 1.2rem;
          font-weight: 800;
        }

        .adm-header-subtitle {
          font-size: 0.75rem;
          font-weight: 600;
          margin-top: 2px;
          display: block;
        }

        .adm-logout-btn {
          padding: 9px 20px;
          background: rgba(239,68,68,0.15);
          color: #fca5a5;
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .adm-logout-btn:hover {
          background: rgba(239,68,68,0.25);
          color: #fecaca;
        }

        /* CONTENT */
        .adm-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 24px;
        }

        /* STATS ROW */
        .adm-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .adm-stat-card {
          background: #fff;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }

        .adm-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.07);
        }

        .adm-stat-icon {
          width: 46px;
          height: 46px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
        }

        .adm-stat-label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 600;
        }

        .adm-stat-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          margin-top: 2px;
        }

        /* PANEL CARD */
        .adm-panel {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .adm-panel-title {
          margin: 0 0 4px 0;
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
        }

        .adm-panel-sub {
          margin: 0 0 20px 0;
          font-size: 0.82rem;
          color: #64748b;
        }

        /* ADMIN FORM */
        .adm-form-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .adm-input {
          flex: 1 1 200px;
          padding: 11px 14px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.88rem;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.2s;
          background: #f8fafc;
          color: #0f172a;
        }

        .adm-input:focus {
          border-color: #0284c7;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(2,132,199,0.1);
        }

        .adm-input::placeholder {
          color: #94a3b8;
        }

        .adm-add-btn {
          padding: 11px 20px;
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.88rem;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(2,132,199,0.25);
        }

        .adm-add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(2,132,199,0.3);
        }

        /* NOTICE */
        .adm-notice {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          margin-top: 12px;
          animation: fadeIn 0.2s ease;
        }

        .adm-notice-success {
          background: #dcfce7;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }

        .adm-notice-info {
          background: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }

        .adm-notice-error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* TABLE */
        .adm-table-wrap {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          margin-top: 20px;
        }

        .adm-table {
          width: 100%;
          border-collapse: collapse;
        }

        .adm-th {
          padding: 11px 14px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #64748b;
          text-align: left;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .adm-tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
        }

        .adm-tr:hover {
          background: #f8fafc;
        }

        .adm-td {
          padding: 12px 14px;
          font-size: 0.85rem;
          color: #334155;
          vertical-align: middle;
        }

        .adm-super-badge {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #15803d;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          border: 1px solid #86efac;
        }

        .adm-role-badge {
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          color: #0369a1;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
          border: 1px solid #7dd3fc;
        }

        .adm-edit-btn {
          padding: 5px 12px;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .adm-edit-btn:hover {
          background: #e2e8f0;
        }

        .adm-delete-btn {
          padding: 5px 12px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .adm-delete-btn:hover {
          background: #fee2e2;
        }

        /* APPLICATION CARDS */
        .adm-apps-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .adm-app-card {
          background: #fff;
          border-radius: 14px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.2s;
        }

        .adm-app-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.07);
        }

        .adm-app-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .adm-app-store-name {
          margin: 0;
          color: #0f172a;
          font-size: 1.05rem;
          font-weight: 800;
        }

        .adm-badge-pending {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid #fcd34d;
        }

        .adm-badge-approved {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #15803d;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid #86efac;
        }

        .adm-badge-rejected {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #991b1b;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid #fca5a5;
        }

        .adm-app-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 0.85rem;
          color: #334155;
          margin-bottom: 14px;
        }

        .adm-app-detail-row {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .adm-app-detail-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .adm-app-detail-val {
          font-size: 0.85rem;
          color: #1e293b;
          font-weight: 500;
        }

        .adm-approve-btn {
          padding: 10px 18px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(16,185,129,0.25);
        }

        .adm-approve-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(16,185,129,0.35);
        }

        .adm-reject-btn {
          padding: 10px 18px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .adm-reject-btn:hover {
          background: #fee2e2;
        }

        .adm-approved-note {
          text-align: center;
          color: #15803d;
          font-size: 0.85rem;
          font-weight: 700;
          background: linear-gradient(135deg, #dcfce7, #f0fdf4);
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #bbf7d0;
        }

        .adm-rejected-note {
          text-align: center;
          color: #991b1b;
          font-size: 0.85rem;
          font-weight: 700;
          background: #fef2f2;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #fecaca;
        }

        .adm-restricted {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border: 1px solid #bae6fd;
          padding: 16px 20px;
          border-radius: 12px;
          color: #0369a1;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 24px;
        }

        /* MODAL */
        .adm-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(10,22,40,0.65);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .adm-modal-card {
          background: #fff;
          padding: 28px;
          border-radius: 16px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 32px 64px rgba(0,0,0,0.2);
          animation: slideUp 0.2s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .adm-modal-save-btn {
          flex: 1;
          padding: 11px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .adm-modal-save-btn:hover {
          transform: translateY(-1px);
        }

        .adm-modal-cancel-btn {
          flex: 1;
          padding: 11px;
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .adm-modal-cancel-btn:hover {
          background: #e2e8f0;
        }

        .adm-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 20px 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
        }

        .adm-filter-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .adm-filter-tab {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          color: #64748b;
          transition: all 0.2s;
        }

        .adm-filter-tab:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .adm-filter-tab-active {
          background: #0f172a !important;
          color: #fff !important;
          border-color: #0f172a !important;
        }
      `}</style>

      <div className="adm-root">
        {/* HEADER */}
        <header className="adm-header">
          <div className="adm-header-left">
            <div className="adm-header-icon">🛡️</div>
            <div>
              <h2 className="adm-header-title">Doğalım Yönetim Portalı</h2>
              <span
                className="adm-header-subtitle"
                style={{ color: isSuperAdmin ? '#34d399' : '#7dd3fc' }}
              >
                {currentAdminEmail} — {isSuperAdmin ? '👑 Süper Admin' : '🔹 Saha Yetkilisi'}
              </span>
            </div>
          </div>
          <button onClick={onLogout} className="adm-logout-btn">⬡ Çıkış Yap</button>
        </header>

        <div className="adm-content">
          {/* STATS */}
          <div className="adm-stats-row">
            <div className="adm-stat-card">
              <div className="adm-stat-icon" style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1d4ed8' }}>👥</div>
              <div>
                <div className="adm-stat-label">Tanımlı Yetkililer</div>
                <div className="adm-stat-value" style={{ color: '#1d4ed8' }}>{totalAdmins}</div>
              </div>
            </div>
            <div className="adm-stat-card">
              <div className="adm-stat-icon" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706' }}>⏳</div>
              <div>
                <div className="adm-stat-label">Bekleyen Başvuru</div>
                <div className="adm-stat-value" style={{ color: '#d97706' }}>{pendingCount}</div>
              </div>
            </div>
            <div className="adm-stat-card">
              <div className="adm-stat-icon" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d' }}>✅</div>
              <div>
                <div className="adm-stat-label">Onaylı Dükkan</div>
                <div className="adm-stat-value" style={{ color: '#15803d' }}>{approvedCount}</div>
              </div>
            </div>
            <div className="adm-stat-card">
              <div className="adm-stat-icon" style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', color: '#10b981' }}>🏪</div>
              <div>
                <div className="adm-stat-label">Toplam Başvuru</div>
                <div className="adm-stat-value" style={{ color: '#10b981' }}>{applications.length}</div>
              </div>
            </div>
          </div>

          {/* ADMİN EKLEME BÖLÜMÜ */}
          {isSuperAdmin ? (
            <div className="adm-panel">
              <h4 className="adm-panel-title">➕ Yeni Admin & Saha Yetkilisi Tanımla</h4>
              <p className="adm-panel-sub">
                Buraya eklediğiniz tüm e-posta ve şifreler dinamik olarak yetkilendirilir.
              </p>

              <form onSubmit={handleCreateAdmin} className="adm-form-row">
                <input
                  type="email"
                  placeholder="Yetkili E-Postası (Örn: kasapozgur11@gmail.com)"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="adm-input"
                  required
                />
                <input
                  type="password"
                  placeholder="Giriş Şifresi..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="adm-input"
                  required
                />
                <button type="submit" className="adm-add-btn">🔐 Yetkilendir & Kaydet</button>
              </form>

              {adminNotice.msg && (
                <div className={`adm-notice adm-notice-${adminNotice.type}`}>
                  {adminNotice.msg}
                </div>
              )}

              {/* YETKİLİLER TABLOSU */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h5 style={{ margin: 0, color: '#0f172a', fontSize: '0.9rem', fontWeight: '800' }}>
                    👥 Tanımlı Yetkililer ({totalAdmins} kişi)
                  </h5>
                </div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th className="adm-th">E-Posta</th>
                        <th className="adm-th">Yetki</th>
                        <th className="adm-th">Eklenme</th>
                        <th className="adm-th" style={{ textAlign: 'right' }}>Şifre</th>
                        <th className="adm-th" style={{ textAlign: 'right' }}>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="adm-tr">
                        <td className="adm-td" style={{ fontWeight: '700' }}>{SUPER_ADMIN_EMAIL}</td>
                        <td className="adm-td"><span className="adm-super-badge">👑 Süper Admin (Kök)</span></td>
                        <td className="adm-td" style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Sistem</td>
                        <td className="adm-td" style={{ textAlign: 'right', fontFamily: 'monospace', color: '#94a3b8' }}>••••••••</td>
                        <td className="adm-td" style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600' }}>🔒 Korumalı</span>
                        </td>
                      </tr>

                      {adminList.map((adm) => (
                        <tr key={adm.id || adm.email} className="adm-tr">
                          <td className="adm-td" style={{ fontWeight: '600' }}>{adm.email}</td>
                          <td className="adm-td"><span className="adm-role-badge">{adm.role || 'Saha Yetkilisi'}</span></td>
                          <td className="adm-td" style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{adm.createdAt || '—'}</td>
                          <td className="adm-td" style={{ textAlign: 'right', fontFamily: 'monospace', color: '#94a3b8' }}>••••••••</td>
                          <td className="adm-td" style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => { setEditingAdmin(adm); setUpdatedPassword(''); }}
                                className="adm-edit-btn"
                              >
                                🔑 Şifre
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAdmin(adm.email)}
                                className="adm-delete-btn"
                              >
                                🗑️ Sil
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="adm-restricted">
              ℹ️ Saha Yetkilisi Modu: Yeni yetkili ekleme/silme işlemleri yalnızca Süper Admin'e açıktır.
            </div>
          )}

          {/* BAŞVURULAR */}
          <div className="adm-section-title">
            📋 Şarküteri Başvuruları & Denetim
            {pendingCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '20px' }}>
                {pendingCount} bekliyor
              </span>
            )}
          </div>

          {applications.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
              Henüz başvuru bulunmamaktadır.
            </div>
          ) : (
            <div className="adm-apps-grid">
              {applications.map((app) => (
                <div key={app.id} className="adm-app-card">
                  <div className="adm-app-card-header">
                    <h4 className="adm-app-store-name">{app.storeName || 'İsimsiz Dükkan'}</h4>
                    {app.status === 'approved' && <span className="adm-badge-approved">✅ Onaylandı (Aktif)</span>}
                    {app.status === 'rejected' && <span className="adm-badge-rejected">❌ Reddedildi</span>}
                    {app.status === 'pending' && <span className="adm-badge-pending">⏳ Saha Ziyareti Bekliyor</span>}
                  </div>

                  <div className="adm-app-details">
                    <div className="adm-app-detail-row">
                      <span className="adm-app-detail-label">Yetkili</span>
                      <span className="adm-app-detail-val">{app.fullName || app.applicantName || '—'}</span>
                    </div>
                    <div className="adm-app-detail-row">
                      <span className="adm-app-detail-label">Telefon</span>
                      <span className="adm-app-detail-val">{app.phone || '—'}</span>
                    </div>
                    <div className="adm-app-detail-row">
                      <span className="adm-app-detail-label">E-Posta</span>
                      <span className="adm-app-detail-val">{app.email || '—'}</span>
                    </div>
                    <div className="adm-app-detail-row">
                      <span className="adm-app-detail-label">Vergi No</span>
                      <span className="adm-app-detail-val">{app.taxNumber || '—'}</span>
                    </div>
                    <div className="adm-app-detail-row" style={{ gridColumn: 'span 2' }}>
                      <span className="adm-app-detail-label">Adres</span>
                      <span className="adm-app-detail-val">{app.address || '—'}</span>
                    </div>
                    <div className="adm-app-detail-row" style={{ gridColumn: 'span 2' }}>
                      <span className="adm-app-detail-label">📅 Randevu</span>
                      <span className="adm-app-detail-val" style={{ color: '#0284c7' }}>
                        {app.appointmentDate || 'Tarih yok'} {app.appointmentTime ? `— Saat ${app.appointmentTime}` : ''}
                      </span>
                    </div>
                  </div>

                  {app.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        type="button"
                        onClick={() => handleApprove(app.id)}
                        className="adm-approve-btn"
                      >
                        ✓ Dükkanı Onayla & Sistemi Aç
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(app.id)}
                        className="adm-reject-btn"
                      >
                        ✕ Reddet
                      </button>
                    </div>
                  )}

                  {app.status === 'approved' && (
                    <div className="adm-approved-note">
                      ✔ Bu işletmenin hesabı onaylı ve aktiftir.
                    </div>
                  )}

                  {app.status === 'rejected' && (
                    <div className="adm-rejected-note">
                      ✕ Bu başvuru reddedilmiştir.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ŞİFRE DEĞİŞTİR MODALI */}
      {editingAdmin && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-card">
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontWeight: '800' }}>🔑 Şifre Değiştir</h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 18px 0' }}>
              <b>{editingAdmin.email}</b> için yeni bir şifre belirleyin.
            </p>

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="password"
                placeholder="Yeni şifre..."
                value={updatedPassword}
                onChange={(e) => setUpdatedPassword(e.target.value)}
                className="adm-input"
                style={{ width: '100%', flex: 'none' }}
                required
                autoFocus
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="adm-modal-save-btn">Kaydet</button>
                <button type="button" onClick={() => setEditingAdmin(null)} className="adm-modal-cancel-btn">İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}