import React, { useState, useEffect } from 'react';

const SUPER_ADMIN_EMAIL = 'kasapozgur61@gmail.com';
const STORAGE_KEY = 'dogalim_admins';

export default function AdminPanel({ onLogout, currentAdminEmail = SUPER_ADMIN_EMAIL }) {
  const isSuperAdmin = currentAdminEmail.toLowerCase() === SUPER_ADMIN_EMAIL;

  const [adminList, setAdminList] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminNotice, setAdminNotice] = useState('');

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

  // Sayfa açıldığında kayıtlı adminleri çek
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
    } else {
      existing.push({
        id: 'adm_' + Date.now(),
        email: cleanEmail,
        password: cleanPass,
        role: 'Saha Yetkilisi',
        createdAt: new Date().toLocaleDateString('tr-TR')
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    setAdminList(existing);

    setAdminNotice(`✅ "${cleanEmail}" admin olarak tanımlandı!`);
    setNewEmail('');
    setNewPassword('');
    setTimeout(() => setAdminNotice(''), 4000);
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
      setAdminNotice(`🗑️ "${email}" yetkisi silindi.`);
      setTimeout(() => setAdminNotice(''), 3000);
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

    setAdminNotice(`🔑 "${editingAdmin.email}" için şifre güncellendi!`);
    setEditingAdmin(null);
    setUpdatedPassword('');
    setTimeout(() => setAdminNotice(''), 3000);
  };

  // Başvuru Onayla
  const handleApprove = (id) => {
    const updated = applications.map(app => 
      (app.id === id || String(app.id) === String(id)) ? { ...app, status: 'approved' } : app
    );
    setApplications(updated);
    localStorage.setItem('dogalim_applications', JSON.stringify(updated));
    alert('✅ Şarküteri onaylandı! Dükkan sahibi sisteme giriş yapabilir.');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>🛡️</span>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a' }}>Doğalim Yönetim Portalı</h2>
            <span style={{ fontSize: '0.8rem', color: isSuperAdmin ? '#10b981' : '#0284c7', fontWeight: 'bold' }}>
              Aktif Oturum: {currentAdminEmail} ({isSuperAdmin ? '👑 Süper Admin' : 'Saha Yetkilisi'})
            </span>
          </div>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Çıkış Yap</button>
      </header>

      <main style={styles.main}>
        {isSuperAdmin ? (
          <div style={styles.adminAddBox}>
            <h4 style={{ margin: '0 0 4px 0', color: '#0369a1' }}>➕ Yeni Admin & Saha Yetkilisi Tanımla</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#64748b' }}>
              Buraya eklediğiniz tüm e-posta ve şifreler dinamik olarak yetkilendirilir.
            </p>

            <form onSubmit={handleCreateAdmin} style={styles.adminForm}>
              <input 
                type="email" 
                placeholder="Yetkili E-Postası (Örn: kasapozgur11@gmail.com)" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                style={styles.adminInput} 
                required 
              />
              <input 
                type="text" 
                placeholder="Giriş Şifresi..." 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                style={styles.adminInput} 
                required 
              />
              <button type="submit" style={styles.addAdminBtn}>Yetkilendir & Kaydet</button>
            </form>

            {adminNotice && <div style={styles.noticeBox}>{adminNotice}</div>}

            <div style={{ marginTop: '20px' }}>
              <h5 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '0.9rem' }}>
                👥 Tanımlı Yetkililer ({adminList.length + 1})
              </h5>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>E-Posta</th>
                      <th style={styles.th}>Yetki Derecesi</th>
                      <th style={styles.th}>Şifre</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: 'bold' }}>{SUPER_ADMIN_EMAIL}</td>
                      <td style={styles.td}><span style={styles.superBadge}>👑 Süper Admin (Kök)</span></td>
                      <td style={{ ...styles.td, fontFamily: 'monospace', color: '#64748b' }}>••••••••</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Korumalı</span>
                      </td>
                    </tr>

                    {adminList.map((adm) => (
                      <tr key={adm.id || adm.email} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 'bold' }}>{adm.email}</td>
                        <td style={styles.td}><span style={styles.roleBadge}>{adm.role || 'Saha Yetkilisi'}</span></td>
                        <td style={{ ...styles.td, fontFamily: 'monospace', color: '#64748b' }}>••••••••</td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button 
                              type="button"
                              onClick={() => { setEditingAdmin(adm); setUpdatedPassword(''); }}
                              style={styles.editBtn}
                            >
                              🔑 Şifre Değiştir
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteAdmin(adm.email)}
                              style={styles.deleteBtn}
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
          <div style={styles.restrictedNotice}>
            ℹ️ Saha Yetkilisi Modu: Yeni yetkili ekleme/silme işlemleri yalnızca Süper Admin'e açıktır.
          </div>
        )}

        <h3 style={{ color: '#334155', margin: '28px 0 16px 0' }}>📋 Şarküteri Başvuruları & Denetim Listesi</h3>

        {applications.length === 0 ? (
          <p style={{ color: '#64748b' }}>Bekleyen başvuru bulunmamaktadır.</p>
        ) : (
          <div style={styles.grid}>
            {applications.map((app) => (
              <div key={app.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{app.storeName || 'İsimsiz Dükkan'}</h4>
                  <span style={app.status === 'approved' ? styles.badgeSuccess : styles.badgePending}>
                    {app.status === 'approved' ? '✅ Onaylandı (Aktif)' : '⏳ Saha Ziyareti Bekliyor'}
                  </span>
                </div>

                <div style={styles.details}>
                  <p><b>Yetkili:</b> {app.fullName || app.applicantName || 'Belirtilmemiş'}</p>
                  <p><b>Telefon:</b> {app.phone || 'Belirtilmemiş'}</p>
                  <p><b>Vergi No:</b> {app.taxNumber || 'Belirtilmemiş'}</p>
                  <p><b>E-Posta:</b> {app.email || 'Belirtilmemiş'}</p>
                  <p style={{ gridColumn: 'span 2' }}><b>Dükkan Adresi:</b> {app.address || 'Belirtilmemiş'}</p>
                  <p style={{ gridColumn: 'span 2', color: '#0284c7', marginTop: '4px' }}>
                    <b>📅 Randevu Zamanı:</b> {app.appointmentDate || 'Tarih yok'} {app.appointmentTime ? `(${app.appointmentTime})` : ''}
                  </p>
                </div>

                {app.status !== 'approved' ? (
                  <button 
                    type="button"
                    onClick={() => handleApprove(app.id)} 
                    style={styles.approveBtn}
                  >
                    ✓ Dükkanı Onayla & Sistemi Aç
                  </button>
                ) : (
                  <div style={styles.approvedNotice}>
                    ✔ Bu işletmenin hesabı onaylı ve aktiftir.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {editingAdmin && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>🔑 Şifre Değiştir</h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 16px 0' }}>
              <b>{editingAdmin.email}</b> için yeni bir şifre belirleyin.
            </p>

            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Yeni şifre..." 
                value={updatedPassword}
                onChange={(e) => setUpdatedPassword(e.target.value)}
                style={{ ...styles.adminInput, width: '100%', boxSizing: 'border-box' }}
                required
                autoFocus
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="submit" style={styles.saveBtn}>Kaydet</button>
                <button type="button" onClick={() => setEditingAdmin(null)} style={styles.cancelBtn}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e2e8f0' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  main: { maxWidth: '950px', margin: '0 auto' },
  adminAddBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '20px', borderRadius: '12px' },
  restrictedNotice: { backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '14px', borderRadius: '8px', color: '#475569', fontSize: '0.85rem' },
  adminForm: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  adminInput: { flex: '1 1 200px', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' },
  addAdminBtn: { padding: '10px 18px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  noticeBox: { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold', marginTop: '10px' },
  tableWrapper: { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { backgroundColor: '#f8fafc', textAlign: 'left' },
  th: { padding: '10px 12px', fontSize: '0.8rem', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '10px 12px', fontSize: '0.85rem', color: '#334155' },
  superBadge: { backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 'bold' },
  roleBadge: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 'bold' },
  editBtn: { padding: '5px 10px', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' },
  deleteBtn: { padding: '5px 10px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' },
  grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  badgePending: { backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold' },
  badgeSuccess: { backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold' },
  details: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.88rem', color: '#334155', margin: '12px 0' },
  approveBtn: { width: '100%', padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  approvedNotice: { textAlign: 'center', color: '#15803d', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: '#dcfce7', padding: '8px', borderRadius: '6px', marginTop: '8px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' },
  saveBtn: { flex: 1, padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' },
  cancelBtn: { padding: '10px 16px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }
};