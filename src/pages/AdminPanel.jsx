import React, { useState } from 'react';

export default function AdminPanel({ onLogout }) {
  const [applications, setApplications] = useState([
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
  ]);

  // Yeni Admin Yetkilendirme State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminList, setAdminList] = useState(['admin@dogalim.com', 'saha@dogalim.com']);

  const handleApprove = (id) => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, status: 'approved' } : app))
    );
    alert('Şarküteri başvurusu ve Rücu Sözleşmesi onaylandı! Satıcı artık giriş yapabilir.');
  };

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setAdminList([...adminList, newAdminEmail]);
    alert(`"${newAdminEmail}" e-posta adresi Sistem Yöneticisi (Admin) olarak yetkilendirildi!`);
    setNewAdminEmail('');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>🛡️</span>
          <h2 style={{ margin: 0, color: '#0f172a' }}>Doğalim Admin & Saha Onay Paneli</h2>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Çıkış Yap</button>
      </header>

      <main style={styles.main}>
        {/* YENİ ADMİN YETKİLENDİRME MODÜLÜ */}
        <div style={styles.adminAddBox}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0369a1' }}>➕ Yeni Saha / Admin Yetkilisi Ekle</h4>
          <form onSubmit={handleAddAdmin} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="email" 
              placeholder="Eklemek istediğiniz Yetkili E-Postası..." 
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              style={styles.adminInput}
              required
            />
            <button type="submit" style={styles.addAdminBtn}>Admin Yetkisi Ver</button>
          </form>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '8px' }}>
            <b>Mevcut Admin Yetkilileri:</b> {adminList.join(', ')} | <b>Genel Davet Kodu:</b> DGLM-2026
          </div>
        </div>

        <h3 style={{ color: '#334155', margin: '20px 0 16px 0' }}>📋 Onay Bekleyen Şarküteri Başvuruları</h3>

        {applications.length === 0 ? (
          <p style={{ color: '#64748b' }}>Bekleyen başvuru bulunmamaktadır.</p>
        ) : (
          <div style={styles.grid}>
            {applications.map((app) => (
              <div key={app.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{app.storeName}</h4>
                  <span style={app.status === 'approved' ? styles.badgeSuccess : styles.badgePending}>
                    {app.status === 'approved' ? '✅ Onaylandı' : '⏳ Saha Ziyareti Bekliyor'}
                  </span>
                </div>

                <div style={styles.details}>
                  <p><b>Yetkili:</b> {app.fullName}</p>
                  <p><b>Telefon:</b> {app.phone}</p>
                  <p><b>Vergi No:</b> {app.taxNumber}</p>
                  <p><b>E-Posta:</b> {app.email}</p>
                  <p style={{ gridColumn: 'span 2' }}><b>Dükkan Adresi:</b> {app.address}</p>
                  <p style={{ gridColumn: 'span 2', color: '#0284c7', marginTop: '4px' }}>
                    <b>📅 Randevu Zamanı:</b> {app.appointmentDate} ({app.appointmentTime})
                  </p>
                </div>

                {app.status === 'pending' && (
                  <button 
                    onClick={() => handleApprove(app.id)} 
                    style={styles.approveBtn}
                  >
                    🖊️ Rücu Sözleşmesi İmzalandı & Hesabı Aktifleştir
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e2e8f0' },
  logoutBtn: { padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  main: { maxWidth: '900px', margin: '0 auto' },
  adminAddBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '16px', borderRadius: '10px' },
  adminInput: { flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' },
  addAdminBtn: { padding: '8px 16px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  badgePending: { backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold' },
  badgeSuccess: { backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold' },
  details: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.88rem', color: '#334155', margin: '12px 0' },
  approveBtn: { width: '100%', padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }
};