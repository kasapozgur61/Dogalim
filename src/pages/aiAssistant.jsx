import React, { useState } from 'react';

export default function AiAssistant({ userRole = 'patron' }) {
  const [crossSellRules, setCrossSellRules] = useState([
    { mainProduct: 'Olgunlaştırılmış Ezine Peyniri', suggestedProduct: 'Sızma Zeytinyağı (500ml)', status: 'Aktif', conversions: 34 },
    { mainProduct: 'Eski Kars Gravyeri', suggestedProduct: 'Çam Balı (400g Kavanoz)', status: 'Aktif', conversions: 21 },
    { mainProduct: 'Kayseri Ev Mantısı', suggestedProduct: 'Ev Yapımı Süzme Yoğurt', status: 'Taslak', conversions: 0 }
  ]);

  const [subscriptions] = useState([
    { customer: 'Ahmet Turgut', plan: 'Haftalık Kahvaltılık Paketi', nextDelivery: '2 Ağustos 2026', status: 'Aktif' },
    { customer: 'Ayşe Yılmaz', plan: '2 Haftada Bir Peynir & Bal Paketi', nextDelivery: '5 Ağustos 2026', status: 'Aktif' }
  ]);

  return (
    <div style={styles.container}>
      {/* BAŞLIK VE AI ÖZET BARI */}
      <div style={styles.aiHeaderCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '2.5rem' }}>🤖</span>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a' }}>Doğalım AI Esnaf Danışmanı</h2>
            <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '0.9rem' }}>
              Yapay zeka taze gıda stoklarınızı, kargo hava durumunu ve müşteri alışveriş alışkanlıklarını analiz ediyor.
            </p>
          </div>
        </div>
      </div>

      {/* CANLI AI ÖNERİ KARTLARI */}
      <div style={styles.insightsGrid}>
        <div style={{ ...styles.insightCard, borderLeft: '4px solid #10b981' }}>
          <div style={styles.cardTag}>💡 Çapraz Satış Fırsatı</div>
          <h4 style={styles.cardTitle}>Zeytinyağı Eşleştirmesi</h4>
          <p style={styles.cardText}>Ezine Peyniri alan 10 müşteriden 4'ü Sızma Zeytinyağı önerisini sepete ekledi. Bu eşleştirmeyi öne çıkarmaya devam edin.</p>
        </div>

        <div style={{ ...styles.insightCard, borderLeft: '4px solid #0284c7' }}>
          <div style={{ ...styles.cardTag, backgroundColor: '#e0f2fe', color: '#0284c7' }}>❄️ Lojistik Uyarısı</div>
          <h4 style={styles.cardTitle}>Hava Sıcaklığı & Buz Aküsü</h4>
          <p style={styles.cardText}>Bölgesel sıcaklık artışı sebebiyle taze peynir kargolarında varsayılan buz aküsü sayısı <b>2 adede</b> çıkarıldı.</p>
        </div>

        <div style={{ ...styles.insightCard, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ ...styles.cardTag, backgroundColor: '#fef3c7', color: '#d97706' }}>🎁 Tadımlık / İkram Stratejisi</div>
          <h4 style={styles.cardTitle}>Stok Fazlası Tulum Peyniri</h4>
          <p style={styles.cardText}>Elimizdeki Tulum Peyniri stoku yüksek. Paketlere 30g ikram eklemek sonraki hafta o üründen satış getirebilir.</p>
        </div>
      </div>

      {/* ÇAPRAZ SATIŞ KURAL YÖNETİMİ */}
      <div style={styles.sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a' }}>🔗 Otomatik Çapraz Satış Öneri Kuralları</h3>
            <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Müşteri sepete ürün eklediğinde önerilecek alternatifler.</p>
          </div>
          {userRole === 'patron' && (
            <button onClick={() => alert("Yeni çapraz satış eşleşmesi ekleme modülü açılıyor...")} style={styles.addBtn}>
              + Yeni Eşleşme Ekle
            </button>
          )}
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Ana Ürün</th>
              <th style={styles.th}>Önerilen Eşleşen Ürün</th>
              <th style={styles.th}>Başarılı Dönüşüm</th>
              <th style={styles.th}>Durum</th>
            </tr>
          </thead>
          <tbody>
            {crossSellRules.map((rule, idx) => (
              <tr key={idx} style={styles.tr}>
                <td style={styles.td}><b>{rule.mainProduct}</b></td>
                <td style={styles.td}>👉 {rule.suggestedProduct}</td>
                <td style={styles.td}><span style={styles.badgeSuccess}>{rule.conversions} Satış</span></td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusChip,
                    backgroundColor: rule.status === 'Aktif' ? '#d1fae5' : '#f1f5f9',
                    color: rule.status === 'Aktif' ? '#065f46' : '#64748b'
                  }}>
                    {rule.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DÜZENLİ ABONELİK TAKİBİ */}
      <div style={styles.sectionCard}>
        <h3 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>🔄 Rutin Kahvaltılık Müşteri Abonelikleri</h3>
        <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.85rem' }}>Müşterilerin uygulamadan oluşturduğu düzenli haftalık/aylık siparişler.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {subscriptions.map((sub, idx) => (
            <div key={idx} style={styles.subItem}>
              <div>
                <strong>👤 {sub.customer}</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Paket: {sub.plan}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 'bold' }}>Gelecek Teslimat: {sub.nextDelivery}</span>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold', marginTop: '2px' }}>● {sub.status} Otomatik Oluşacak</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  aiHeaderCard: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px' },
  insightsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  insightCard: { backgroundColor: '#fff', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  cardTag: { fontSize: '0.72rem', fontWeight: 'bold', color: '#166534', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginBottom: '8px' },
  cardTitle: { margin: '0 0 6px 0', fontSize: '1rem', color: '#0f172a' },
  cardText: { margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' },
  sectionCard: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  addBtn: { padding: '8px 14px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.82rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { backgroundColor: '#f8fafc', textAlign: 'left' },
  th: { padding: '10px 12px', fontSize: '0.8rem', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', fontSize: '0.88rem', color: '#334155' },
  badgeSuccess: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 'bold', border: '1px solid #bbf7d0' },
  statusChip: { padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  subItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }
};