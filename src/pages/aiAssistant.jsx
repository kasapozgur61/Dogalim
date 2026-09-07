import React, { useState } from 'react';

export default function AiAssistant({ userRole = 'tezgah', storeData }) {
  // Mevcut Çapraz Satış Kuralları
  const [crossSellRules, setCrossSellRules] = useState([
    {
      id: 1,
      mainProduct: 'Olgunlaştırılmış Ezine Peyniri',
      suggestedProduct: 'Sızma Zeytinyağı (500ml)',
      conversions: '34 Satış',
      status: 'Aktif'
    },
    {
      id: 2,
      mainProduct: 'Trabzon Tereyağı (1kg)',
      suggestedProduct: 'Rize Çam Balı',
      conversions: '18 Satış',
      status: 'Aktif'
    }
  ]);

  // Modal ve Form State'leri
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRule, setNewRule] = useState({
    mainProduct: '',
    suggestedProduct: ''
  });

  // Yeni Eşleşme Kaydetme
  const handleSaveRule = (e) => {
    e.preventDefault();
    if (!newRule.mainProduct.trim() || !newRule.suggestedProduct.trim()) return;

    const ruleToAdd = {
      id: Date.now(),
      mainProduct: newRule.mainProduct.trim(),
      suggestedProduct: newRule.suggestedProduct.trim(),
      conversions: '0 Satış (Yeni)',
      status: 'Aktif'
    };

    setCrossSellRules([ruleToAdd, ...crossSellRules]);
    setNewRule({ mainProduct: '', suggestedProduct: '' });
    setShowAddModal(false);
  };

  // Eşleşme Durumu Değiştirme (Aktif / Pasif)
  const toggleRuleStatus = (id) => {
    setCrossSellRules(rules =>
      rules.map(r => r.id === id ? { ...r, status: r.status === 'Aktif' ? 'Pasif' : 'Aktif' } : r)
    );
  };

  return (
    <div style={styles.container}>
      {/* AI ESNAF TAVSİYE KARTLARI */}
      <div style={styles.cardGrid}>
        <div style={{ ...styles.card, borderLeft: '4px solid #10b981' }}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTag}>💡 Çapraz Satış Fırsatı</span>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 'bold' }}>Yüksek Başarı</span>
          </div>
          <h3 style={styles.cardTitle}>Zeytinyağı Eşleştirmesi</h3>
          <p style={styles.cardText}>
            Ezine Peyniri alan 10 müşteriden 4'ü Sızma Zeytinyağı önerisini sepete ekledi. Bu eşleştirmeyi öne çıkarmaya devam edin.
          </p>
        </div>

        <div style={{ ...styles.card, borderLeft: '4px solid #0284c7' }}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.cardTag, backgroundColor: '#e0f2fe', color: '#0369a1' }}>❄️ Soğuk Zincir Analizi</span>
            <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 'bold' }}>Trabzon İklimi</span>
          </div>
          <h3 style={styles.cardTitle}>Hava Sıcaklığı & Buz Aküsü</h3>
          <p style={styles.cardText}>
            Bölgesel sıcaklık artışı sebebiyle taze peynir kargolarında varsayılan buz aküsü sayısı <b>2 adede</b> çıkarıldı.
          </p>
        </div>

        <div style={{ ...styles.card, borderLeft: '4px solid #f59e0b' }}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.cardTag, backgroundColor: '#fef3c7', color: '#b45309' }}>🎁 Tadımlık / İkram Stratejisi</span>
          </div>
          <h3 style={styles.cardTitle}>Stok Fazlası Tulum Peyniri</h3>
          <p style={styles.cardText}>
            Elinizdeki olgunlaşmış tulum peynirinden 30g'lık mini paketler halinde siparişlere ikram eklemek sepet tutarını %14 artırıyor.
          </p>
        </div>
      </div>

      {/* ÇAPRAZ SATIŞ ÖNERİ KURALLARI TABLOSU */}
      <div style={styles.tableBox}>
        <div style={styles.tableHeader}>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem' }}>🔗 Otomatik Çapraz Satış Öneri Kuralları</h3>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Müşteri sepete ana ürünü eklediğinde yanında cazip fiyatla tavsiye edilecek ürünler.
            </p>
          </div>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            + Yeni Eşleşme Ekle
          </button>
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
            {crossSellRules.map((rule) => (
              <tr key={rule.id} style={styles.tr}>
                <td style={{ ...styles.td, fontWeight: 'bold', color: '#0f172a' }}>{rule.mainProduct}</td>
                <td style={styles.td}>👉 {rule.suggestedProduct}</td>
                <td style={styles.td}>
                  <span style={styles.conversionBadge}>{rule.conversions}</span>
                </td>
                <td style={styles.td}>
                  <button 
                    onClick={() => toggleRuleStatus(rule.id)}
                    style={{
                      ...styles.statusBtn,
                      backgroundColor: rule.status === 'Aktif' ? '#dcfce7' : '#f1f5f9',
                      color: rule.status === 'Aktif' ? '#15803d' : '#64748b'
                    }}
                  >
                    ● {rule.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* YENİ EŞLEŞME EKLE MODAL PENCERESİ */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>🔗 Yeni Çapraz Satış Eşleşmesi</h3>
              <button onClick={() => setShowAddModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <p style={{ margin: '4px 0 16px 0', fontSize: '0.82rem', color: '#64748b' }}>
              Müşteri sepetine ana ürünü eklediğinde algoritmanın tavsiye edeceği tamamlayıcı ürünü belirleyin.
            </p>

            <form onSubmit={handleSaveRule} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Ana Ürün (Müşterinin Sepete Attığı)</label>
                <input 
                  type="text" 
                  placeholder="Örn: Kolot Peyniri veya Kars Gravyeri"
                  value={newRule.mainProduct}
                  onChange={(e) => setNewRule({ ...newRule, mainProduct: e.target.value })}
                  style={styles.input}
                  required
                  autoFocus
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Önerilecek Eşleşen Ürün</label>
                <input 
                  type="text" 
                  placeholder="Örn: Mısır Unu (Kupon İndirimli) veya Tereyağı"
                  value={newRule.suggestedProduct}
                  onChange={(e) => setNewRule({ ...newRule, suggestedProduct: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" style={styles.saveBtn}>Kuralı Kaydet & Aktifleştir</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Inter', sans-serif" },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardTag: { backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' },
  cardTitle: { margin: '6px 0', fontSize: '1.1rem', color: '#0f172a' },
  cardText: { margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5' },
  tableBox: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  addBtn: { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { backgroundColor: '#f8fafc', textAlign: 'left' },
  th: { padding: '12px', fontSize: '0.8rem', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '14px 12px', fontSize: '0.88rem', color: '#334155' },
  conversionBadge: { backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 'bold' },
  statusBtn: { border: 'none', padding: '4px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.8rem', fontWeight: 'bold', color: '#334155' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' },
  saveBtn: { flex: 1, padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' },
  cancelBtn: { padding: '10px 16px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }
};