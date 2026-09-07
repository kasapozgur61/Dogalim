import React, { useState, useMemo } from 'react';

export default function Financials({ userRole = 'patron', storeData }) {
  const [timeRange, setTimeRange] = useState('haftalik');

  const storeId = storeData?.id || 'guest';

  // Gerçek sipariş verilerini bu mağaza için oku
  const allOrders = useMemo(() => {
    try {
      const raw = localStorage.getItem(`dogalim_orders_${storeId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [storeId]);

  // Gerçek ürün verilerini oku (stok için)
  const allProducts = useMemo(() => {
    try {
      const raw = localStorage.getItem(`dogalim_products_${storeId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [storeId]);

  // Zaman aralığına göre filtrele
  const filteredOrders = useMemo(() => {
    const now = new Date();

    return allOrders.filter(order => {
      // createdAt alanı yoksa tümünü dahil et
      if (!order.createdAt) return true;

      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate)) return true;

      if (timeRange === 'haftalik') {
        // Pazartesi'den itibaren bu hafta
        const weekStart = new Date(now);
        const day = now.getDay(); // 0=Pazar, 1=Pzt
        const diff = day === 0 ? -6 : 1 - day;
        weekStart.setDate(now.getDate() + diff);
        weekStart.setHours(0, 0, 0, 0);
        return orderDate >= weekStart;
      } else {
        // Bu ay
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
    });
  }, [allOrders, timeRange]);

  // İstatistikleri hesapla
  const stats = useMemo(() => {
    const grossRevenue = filteredOrders.reduce((sum, order) => {
      const orderTotal = (order.items || []).reduce((s, item) => s + (item.totalPrice || 0), 0);
      return sum + orderTotal;
    }, 0);

    const orderCount = filteredOrders.length;

    // Kaba tahmin: %29 kâr marjı, %3 ikram, %4 soğuk zincir
    const netProfit = grossRevenue * 0.29;
    const ikramCost = grossRevenue * 0.03;
    const coldChainCost = grossRevenue * 0.04;
    const spoilageLoss = grossRevenue * 0.02;

    // Ortalama sipariş değeri
    const avgOrderValue = orderCount > 0 ? grossRevenue / orderCount : 0;

    return { grossRevenue, netProfit, ikramCost, coldChainCost, spoilageLoss, orderCount, avgOrderValue };
  }, [filteredOrders]);

  // Durum dağılımı (siparişler)
  const statusBreakdown = useMemo(() => {
    const counts = { 'Hazırlanıyor': 0, 'Kargoya Hazır': 0, 'Kargoya Verildi': 0 };
    filteredOrders.forEach(o => {
      if (counts[o.status] !== undefined) counts[o.status]++;
    });
    return counts;
  }, [filteredOrders]);

  // Kritik stok ürünleri
  const lowStockProducts = allProducts.filter(p => p.stockKg < 15);

  const fmt = (num) => num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (num) => Math.round(num).toLocaleString('tr-TR');

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

  const hasData = filteredOrders.length > 0;

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

      {/* VERİ YOK DURUMU */}
      {!hasData && (
        <div style={styles.noDataBanner}>
          <span style={{ fontSize: '1.5rem' }}>📭</span>
          <div>
            <strong>
              {timeRange === 'haftalik' ? 'Bu hafta' : 'Bu ay'} henüz sipariş bulunmuyor.
            </strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#0369a1' }}>
              Siparişler oluşturulup işleme alındıkça aşağıdaki veriler otomatik hesaplanacak.
            </p>
          </div>
        </div>
      )}

      {/* KRİTİK FİNANSAL KARTLAR */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIconBox}>💰</div>
          <div>
            <span style={styles.statLabel}>Brüt Ciro</span>
            <h3 style={styles.statValue}>₺{fmtInt(stats.grossRevenue)}</h3>
            <span style={styles.badgeNeutral}>{stats.orderCount} sipariş</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: '#ecfdf5', color: '#10b981' }}>📈</div>
          <div>
            <span style={styles.statLabel}>Net Kâr (Tahmini %29)</span>
            <h3 style={{ ...styles.statValue, color: '#10b981' }}>₺{fmtInt(stats.netProfit)}</h3>
            <span style={styles.badgeSuccess}>%29 Kâr Marjı</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: '#fef3c7', color: '#d97706' }}>🎁</div>
          <div>
            <span style={styles.statLabel}>İkram / Tadımlık Maliyeti</span>
            <h3 style={{ ...styles.statValue, color: '#d97706' }}>₺{fmtInt(stats.ikramCost)}</h3>
            <span style={styles.badgeWarning}>%3 tahmini oran</span>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ ...styles.statIconBox, backgroundColor: '#e0f2fe', color: '#0284c7' }}>❄️</div>
          <div>
            <span style={styles.statLabel}>Soğuk Zincir & Ambalaj</span>
            <h3 style={{ ...styles.statValue, color: '#0284c7' }}>₺{fmtInt(stats.coldChainCost)}</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Strafor + Buz Aküsü</span>
          </div>
        </div>
      </div>

      {/* DETAY BÖLÜMÜ */}
      <div style={styles.detailGrid}>
        {/* SİPARİŞ DURUM DAĞILIMI */}
        <div style={styles.panelCard}>
          <h3 style={styles.panelTitle}>📦 Sipariş Durum Dağılımı</h3>
          {hasData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {[
                { label: 'Hazırlanıyor', count: statusBreakdown['Hazırlanıyor'], color: '#f59e0b', bg: '#fef3c7' },
                { label: 'Kargoya Hazır', count: statusBreakdown['Kargoya Hazır'], color: '#0284c7', bg: '#e0f2fe' },
                { label: 'Kargoya Verildi', count: statusBreakdown['Kargoya Verildi'], color: '#10b981', bg: '#dcfce7' },
              ].map(s => {
                const pct = stats.orderCount > 0 ? Math.round((s.count / stats.orderCount) * 100) : 0;
                return (
                  <div key={s.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '500', color: '#334155' }}>{s.label}</span>
                      <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{s.count} sipariş ({pct}%)</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div style={{ ...styles.progressBarFill, width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>Ortalama Sipariş Değeri:</span>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>₺{fmt(stats.avgOrderValue)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyPanel}>
              <span style={{ fontSize: '1.8rem' }}>📊</span>
              <p>Sipariş verisi bulunmuyor.</p>
            </div>
          )}
        </div>

        {/* KRİTİK STOK & GİDER ÖZETİ */}
        <div style={styles.panelCard}>
          <h3 style={styles.panelTitle}>⚠️ Kritik Stok & Operasyonel Giderler</h3>

          {/* Kritik stok */}
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Düşük Stok Uyarısı
            </div>
            {lowStockProducts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lowStockProducts.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0f172a' }}>{p.name}</span>
                    <span style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '0.82rem' }}>⚠️ {p.stockKg} Kg</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '0.85rem', color: '#15803d', fontWeight: '600' }}>
                ✅ Tüm ürünlerin stoku yeterli.
              </div>
            )}
          </div>

          {/* Gider özeti */}
          {hasData && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                Tahmini Operasyonel Giderler
              </div>
              <div style={styles.lossList}>
                <div style={styles.lossItem}>
                  <span style={{ fontSize: '0.85rem', color: '#334155' }}>İkram & Tadımlık</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>-₺{fmt(stats.ikramCost)}</span>
                </div>
                <div style={styles.lossItem}>
                  <span style={{ fontSize: '0.85rem', color: '#334155' }}>Soğuk Zincir & Ambalaj</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>-₺{fmt(stats.coldChainCost)}</span>
                </div>
                <div style={styles.lossItem}>
                  <span style={{ fontSize: '0.85rem', color: '#334155' }}>Fire & Kayıp (tahmini)</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>-₺{fmt(stats.spoilageLoss)}</span>
                </div>
                <div style={{ ...styles.lossItem, borderBottom: 'none', backgroundColor: '#fef2f2', borderRadius: '8px', padding: '10px 12px', marginTop: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '0.88rem' }}>Toplam Tahmini Gider:</span>
                  <span style={{ fontWeight: 'bold', color: '#991b1b', fontSize: '1rem' }}>
                    ₺{fmt(stats.ikramCost + stats.coldChainCost + stats.spoilageLoss)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  subText: { color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' },
  filterGroup: { display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '8px' },
  filterBtn: { padding: '8px 18px', border: 'none', borderRadius: '6px', backgroundColor: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', fontFamily: 'inherit', transition: 'all 0.2s' },
  activeFilter: { backgroundColor: '#fff', color: '#0f172a', fontWeight: '800', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  noDataBanner: { display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '14px 18px', borderRadius: '12px', color: '#0369a1', fontSize: '0.88rem', fontWeight: '600' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  statCard: { backgroundColor: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', transition: 'all 0.2s' },
  statIconBox: { width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 },
  statLabel: { fontSize: '0.78rem', color: '#64748b', fontWeight: '600' },
  statValue: { margin: '2px 0 4px 0', fontSize: '1.35rem', color: '#0f172a', fontWeight: '800' },
  badgeSuccess: { fontSize: '0.72rem', color: '#10b981', fontWeight: 'bold', backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px' },
  badgeWarning: { fontSize: '0.72rem', color: '#d97706', fontWeight: 'bold', backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '4px' },
  badgeNeutral: { fontSize: '0.72rem', color: '#64748b', fontWeight: 'bold', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' },
  detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' },
  panelCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  panelTitle: { margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '800' },
  progressBarBg: { width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '4px', transition: 'width 0.4s ease' },
  emptyPanel: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '32px 16px', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', marginTop: '8px' },
  lossList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  lossItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' },
  restrictedContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  restrictedBox: { backgroundColor: '#fff', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', maxWidth: '400px' }
};