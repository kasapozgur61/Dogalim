import React, { useState, useEffect } from 'react';

export default function Disputes({ userRole = 'tezgah', storeData }) {
  const storeId = storeData?.id || 'guest';
  const DISPUTES_KEY = `dogalim_disputes_${storeId}`;

  const [disputes, setDisputes] = useState(() => {
    try {
      const raw = localStorage.getItem(DISPUTES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));
  }, [disputes, DISPUTES_KEY]);

  const handleAction = (id, actionType) => {
    if (userRole !== 'patron') {
      alert('⚠️ İade ve Değişim kararlarını sadece Patron Modu onaylayabilir!');
      return;
    }
    setDisputes(prev => prev.map(item => item.id === id ? { ...item, status: actionType } : item));
  };

  if (disputes.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2>🛡️ Destek & Kısmi İade Talepleri</h2>
            <p style={styles.subText}>Kargo hasarları, vakum bozulmaları ve müşteri itiraz yönetimi.</p>
          </div>
        </div>
        <div style={styles.emptyState}>
          <span style={{ fontSize: '3rem' }}>✅</span>
          <h3 style={{ margin: '12px 0 6px', color: '#0f172a' }}>Açık Talep Yok</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '320px', textAlign: 'center', lineHeight: '1.5' }}>
            Müşteri iade veya destek talepleri geldiğinde burada listelenecek.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2>🛡️ Destek & Kısmi İade Talepleri</h2>
          <p style={styles.subText}>Kargo hasarları, vakum bozulmaları ve müşteri itiraz yönetimi.</p>
        </div>
      </div>

      <div style={styles.list}>
        {disputes.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.ticketId}>{item.id}</span>
                <span style={styles.orderId}>Sipariş: {item.orderId}</span>
              </div>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: item.status === 'onaylandi' ? '#d1fae5' : item.status === 'reddedildi' ? '#fee2e2' : item.status === 'yeni_paket' ? '#e0f2fe' : '#fef3c7',
                color: item.status === 'onaylandi' ? '#065f46' : item.status === 'reddedildi' ? '#991b1b' : item.status === 'yeni_paket' ? '#0369a1' : '#92400e',
              }}>
                {item.status === 'onaylandi' && '✅ Kısmi İade Onaylandı'}
                {item.status === 'reddedildi' && '❌ Talep Reddedildi'}
                {item.status === 'yeni_paket' && '📦 Yeni Paket Gönderildi'}
                {item.status === 'beklemede' && '⏳ İnceleniyor'}
              </span>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.infoSection}>
                <h4 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>{item.productName}</h4>
                <p style={styles.metaText}><b>Müşteri:</b> {item.customerName} | <b>Tarih:</b> {item.date}</p>
                <p style={styles.issueBadge}>🚨 <b>Sorun Bildirimi:</b> {item.issueType}</p>
                <p style={styles.noteBox}>"{item.customerNote}"</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: 'bold' }}>
                  Talep Edilen İade Tutarı: ₺{item.amount}
                </p>
              </div>
              <div style={styles.photoSection}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Müşteri Kanıt Görseli:</span>
                <div style={styles.photoPlaceholder}>📷 [Fotoğraf Görüntüle]</div>
              </div>
            </div>

            {item.status === 'beklemede' && (
              <div style={styles.cardFooter}>
                {userRole === 'patron' ? (
                  <>
                    <button onClick={() => handleAction(item.id, 'onaylandi')} style={styles.approveBtn}>
                      💸 Kısmi İadeyi Onayla (₺{item.amount})
                    </button>
                    <button onClick={() => handleAction(item.id, 'yeni_paket')} style={styles.resendBtn}>
                      📦 Ücretsiz Yeni Paket Gönder
                    </button>
                    <button onClick={() => handleAction(item.id, 'reddedildi')} style={styles.rejectBtn}>
                      İtirazı Reddet
                    </button>
                  </>
                ) : (
                  <span style={styles.tezgahWarning}>
                    🔒 İade/Değişim onaylama yetkisi sadece Patron Modundadır.
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  subText: { color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0', padding: '60px 24px', gap: '8px' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' },
  ticketId: { fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a', marginRight: '10px' },
  orderId: { fontSize: '0.85rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' },
  statusBadge: { padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' },
  cardBody: { display: 'flex', gap: '20px', justifyContent: 'space-between', flexWrap: 'wrap' },
  infoSection: { flex: 1, minWidth: '260px' },
  metaText: { margin: '0 0 8px 0', fontSize: '0.82rem', color: '#64748b' },
  issueBadge: { margin: '6px 0', fontSize: '0.85rem', color: '#dc2626', fontWeight: 'bold' },
  noteBox: { backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #cbd5e1', fontSize: '0.88rem', fontStyle: 'italic', color: '#334155', margin: '8px 0' },
  photoSection: { display: 'flex', flexDirection: 'column', gap: '4px' },
  photoPlaceholder: { width: '130px', height: '90px', backgroundColor: '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: 'bold', border: '1px dashed #cbd5e1' },
  cardFooter: { display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' },
  approveBtn: { padding: '8px 14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' },
  resendBtn: { padding: '8px 14px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' },
  rejectBtn: { padding: '8px 14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' },
  tezgahWarning: { fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }
};