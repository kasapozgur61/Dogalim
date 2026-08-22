import React, { useState } from 'react';

export default function Logistics({ userRole = 'tezgah' }) {
  const [deliveries, setDeliveries] = useState([
    {
      id: 'DEL-8921',
      orderId: 'ORD-1042',
      customer: 'Mehmet Kaya',
      address: 'Yıldızlı Mah. Sahil Cad. No:12 Akçaabat / Trabzon',
      distanceKm: 3.4,
      courierName: 'Kurye Ali (Doğalım Express)',
      status: 'Yolda', // 'Hazırlanıyor', 'Kurye Atandı', 'Yolda', 'Teslim Edildi'
      coldChainStatus: 'Güvenli (4°C)',
      departureTime: '21:35',
      estimatedArrival: '22:05'
    },
    {
      id: 'DEL-8922',
      orderId: 'ORD-1045',
      customer: 'Zeynep Demir',
      address: 'Söğütlü Mah. Üniversite Cad. No:8 Trabzon',
      distanceKm: 6.8,
      courierName: 'Kurye Burak',
      status: 'Kurye Atandı',
      coldChainStatus: 'Güvenli (3°C)',
      departureTime: '21:50',
      estimatedArrival: '22:25'
    }
  ]);

  const handleUpdateStatus = (id, newStatus) => {
    setDeliveries(prev =>
      prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
    );
  };

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
  btnPrimary: { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' },
  btnSuccess: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }
};