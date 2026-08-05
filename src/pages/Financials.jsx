import React, { useState } from 'react';

export default function Financials({ userRole = 'patron' }) {
  const [timeRange, setTimeRange] = useState('haftalik'); // haftalik, aylik

  // Finansal özet verileri
  const stats = {
    grossRevenue: 48650,
    netProfit: 14200,
    totalDiscountsIkram: 1450,
    spoilageLoss: 980,
    coldChainExpenses: 2100,
    orderCount: 142
  };

  // Kategori bazlı satış dağılımı
  const categorySales = [
    { name: 'Olgunlaştırılmış Peynirler', sales: '₺21,400', percentage: '%44', color: '#10b981' },
    { name: 'Şarküteri & Et Ürünleri', sales: '₺14,200', percentage: '%29', color: '#0284c7' },
    { name: 'Yöresel Bal & Reçel', sales: '₺8,150', percentage: '%17', color: '#f59e0b' },
    { name: 'Zeytin & Zeytinyağı', sales: '₺4,900', percentage: '%10', color: '#8b5cf6' },
  ];

  if (userRole !== 'patron') {
    return (
      <div style={styles.restrictedContainer}>
        <div style={styles.restrictedBox}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <h2>Erişim Kısıtlandı</h2>
          <p>Finansal raporlar ve ciro analizi sadece <b>Patron Modu</b> yetkisine sahip kullanıcılar tarafından görüntülenebilir.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ÜST BİLGİ VE ZAMAN FİLTRESİ */}
      <div style={styles.headerRow}>
        <div>
          <h2>📊 Finansal Raporlar & Ciro Analizi</h2>
          <p style={styles.subText}>Ciro, net kâr, ikram maliyeti ve soğuk zincir lojistik giderleri.</p>
        </div>

        <div style={styles.filterGroup}>
          <button 
            onClick={() => setTimeRange('haftalik')} 
            style={{ ...styles.filterBtn, ...(timeRange === 'haftalik' ? styles.activeFilter : {}) }}
          >
            Bu Hafta
          </button>
          <button 
            onClick={() => setTimeRange('aylik')} 
            style={{ ...styles.filterBtn, ...(timeRange === 'aylik' ? styles.activeFilter : {}) }}
          >
            Bu Ay
          </button>
        </div>
      </div>

      {/* KRİTİK FİNANSAL KARTLAR */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconBox}>💰</div>
          <div>
            <span style={styles.statLabel}>Brüt Ciro</span>
            <h3 style={styles.statValue}>₺{stats.grossRevenue.toLocaleString('tr-TR')}</h3>
            <span style={styles.badgeSuccess}>+14% geçen döneme göre</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: '#ecfdf5', color: '#10b981' }}>📈</div>
          <div>
            <span style={styles.statLabel}>Net Kâr (Tahmini)</span>
            <h3 style={{ ...styles.statValue, color: '#10b981' }}>₺{stats.netProfit.toLocaleString('tr-TR')}</h3>
            <span style={styles.badgeSuccess}>%29.1 Kâr Marjı</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: '#fef3c7', color: '#d97706' }}>🎁</div>
          <div>
            <span style={styles.statLabel}>İkram / Tadımlık Maliyeti</span>
            <h3 style={{ ...styles.statValue, color: '#d97706' }}>₺{stats.totalDiscountsIkram.toLocaleString('tr-TR')}</h3>
            <span style={styles.badgeWarning}>Tezgahtar İkramları</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: '#e0f2fe', color: '#0284c7' }}>❄️</div>
          <div>
            <span style={styles.statLabel}>Soğuk Zincir & Ambalaj</span>
            <h3 style={{ ...styles.statValue, color: '#0284c7' }}>₺{stats.coldChainExpenses.toLocaleString('tr-TR')}</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Strafor + Buz Aküsü</span>
          </div>
        </div>
      </div>

      {/* DETAYLI ANALİZ BÖLÜMÜ */}
      <div style={styles.detailGrid}>
        {/* KATEGORİ SATIŞ DAĞILIMI */}
        <div style={styles.panelCard}>
          <h3 style={styles.panelTitle}>🧀 Kategori Bazlı Satış Dağılımı</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {categorySales.map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '500', color: '#334155' }}>{cat.name}</span>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{cat.sales} ({cat.percentage})</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: cat.percentage, backgroundColor: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FİRE VE İADE GİDER ÖZETİ */}
        <div style={styles.panelCard}>
          <h3 style={styles.panelTitle}>⚠️ Fire, Hasar & İade Kalemleri</h3>
          <div style={styles.lossList}>
            <div style={styles.lossItem}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Vakum/Kargo Hasarlı İadeler</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Müşteri itirazı sonrası onaylanan kısmi iadeler</p>
              </div>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>-₺580.00</span>
            </div>

            <div style={styles.lossItem}>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Tezgah Kabuk/Dilimleme Firesi</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>Sert peynir dış kabuk temizliği ve doğal kayıp</p>
              </div>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>-₺400.00</span>
            </div>

            <div style={{ ...styles.lossItem, borderBottom: 'none', backgroundColor: '#fef2f2', borderRadius: '8px', padding: '12px' }}>
              <span style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '0.9rem' }}>Toplam Operasyonel Kayıp:</span>
              <span style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '1.05rem' }}>₺{stats.spoilageLoss.toLocaleString('tr-TR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  subText: { color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' },
  filterGroup: { display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '8px' },
  filterBtn: { padding: '6px 14px', border: 'none', borderRadius: '6px', backgroundColor: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem' },
  activeFilter: { backgroundColor: '#fff', color: '#0f172a', fontWeight: 'bold', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  statCard: { backgroundColor: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  statIconBox: { width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' },
  statLabel: { fontSize: '0.78rem', color: '#64748b', fontWeight: '500' },
  statValue: { margin: '2px 0 4px 0', fontSize: '1.35rem', color: '#0f172a', fontWeight: 'bold' },
  badgeSuccess: { fontSize: '0.72rem', color: '#10b981', fontWeight: 'bold', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' },
  badgeWarning: { fontSize: '0.72rem', color: '#d97706', fontWeight: 'bold', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' },
  panelCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  panelTitle: { margin: 0, fontSize: '1.05rem', color: '#0f172a' },
  progressBarBg: { width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' },
  lossList: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' },
  lossItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' },
  restrictedContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  restrictedBox: { backgroundColor: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', maxWidth: '400px' }
};