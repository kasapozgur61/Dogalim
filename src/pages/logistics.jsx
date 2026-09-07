import React, { useState, useEffect } from 'react';

export default function Logistics({ userRole = 'tezgah', storeData }) {
  const storeId = storeData?.id || 'guest';
  const LOGISTICS_KEY = `dogalim_logistics_${storeId}`;

  const [deliveries, setDeliveries] = useState(() => {
    try {
      const raw = localStorage.getItem(LOGISTICS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOGISTICS_KEY, JSON.stringify(deliveries));
  }, [deliveries, LOGISTICS_KEY]);

  const handleUpdateStatus = (id, newStatus) => {
    setDeliveries(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  if (deliveries.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.headerBox}>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a' }}>🛵 Yerel Kurye & Soğuk Zincir Sevkiyat</h2>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
              PostGIS konum doğrulamalı aynı gün yerel kurye teslimatları ve anlık sıcaklık takibi.
            </p>
          </div>
        </div>
        <div style={styles.emptyState}>
          <span style={{ fontSize: '3rem' }}>🛵</span>
          <h3 style={{ margin: '12px 0 6px', color: '#0f172a' }}>Aktif Teslimat Yok</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '320px', textAlign: 'center', lineHeight: '1.5' }}>
            Kargoya verilen siparişlerin teslimat takibi burada görünecek.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerBox}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a' }}>🛵 Yerel Kurye & Soğuk Zincir Sevkiyat</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            PostGIS konum doğrulamalı aynı gün yerel kurye teslimatları ve anlık sıcaklık takibi.
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        {deliveries.map(del => (
          <div key={del.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{del.id}</strong>
                <span style={styles.orderTag}>📦 {del.orderId}</span>
              </div>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: del.status === 'Teslim Edildi' ? '#dcfce7' : '#e0f2fe',
                color: del.status === 'Teslim Edildi' ? '#15803d' : '#0369a1'
              }}>
                ● {del.status}
              </span>
            </div>

            <div style={styles.infoGrid}>
              <div>
                <span style={styles.label}>Müşteri & Adres:</span>
                <p style={styles.valText}><b>{del.customer}</b></p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>📍 {del.address}</p>
              </div>
              <div>
                <span style={styles.label}>PostGIS Mesafe & Süre:</span>
                <p style={styles.valText}>📏 {del.distanceKm} km (Menzil İçi)</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#0284c7' }}>⏱️ Tahmini Varış: {del.estimatedArrival}</p>
              </div>
              <div>
                <span style={styles.label}>Atanan Kurye:</span>
                <p style={styles.valText}>🛵 {del.courierName}</p>
              </div>
              <div>
                <span style={styles.label}>Strafor Kutu Sıcaklığı:</span>
                <span style={styles.coldBadge}>❄️ {del.coldChainStatus}</span>
              </div>
            </div>

            <div style={styles.actionRow}>
              {del.status === 'Kurye Atandı' && (
                <button onClick={() => handleUpdateStatus(del.id, 'Yolda')} style={styles.btnPrimary}>
                  🚀 Dükkandan Çıktı (Yolda)
                </button>
              )}
              {del.status === 'Yolda' && (
                <button onClick={() => handleUpdateStatus(del.id, 'Teslim Edildi')} style={styles.btnSuccess}>
                  ✅ Teslim Edildi Olarak İşaretle
                </button>
              )}
              {del.status === 'Teslim Edildi' && (
                <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: '700' }}>✔ Teslimat tamamlandı.</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  headerBox: { backgroundColor: '#fff', padding: '18px 24px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0', padding: '60px 24px', gap: '8px' },
  grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
  orderTag: { marginLeft: '8px', fontSize: '0.82rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' },
  statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' },
  label: { fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' },
  valText: { margin: '2px 0', fontSize: '0.9rem', color: '#1e293b' },
  coldBadge: { display: 'inline-block', backgroundColor: '#ecfeff', color: '#0891b2', border: '1px solid #a5f3fc', padding: '2px 8px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold', marginTop: '2px' },
  actionRow: { display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f8fafc', paddingTop: '12px' },
  btnPrimary: { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' },
  btnSuccess: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }
};