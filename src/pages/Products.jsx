import React, { useState } from 'react';

export default function Products({ userRole = 'tezgah' }) {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Olgunlaştırılmış Ezine Peyniri',
      origin: 'Çanakkale / Ezine',
      agingPeriod: '12 Ay Olgunlaştırılmış',
      pricePerKg: 360,
      stockKg: 45,
      requiresColdChain: true,
      options: ['İnce Dilim', 'Kalın Dilim', 'Vakumlu Paket']
    },
    {
      id: 2,
      name: 'Eski Kars Gravyeri',
      origin: 'Kars / Boğatepe',
      agingPeriod: '18 Ay Şavşat Yayla Dinlendirme',
      pricePerKg: 680,
      stockKg: 12,
      requiresColdChain: true,
      options: ['Tek Parça Block', 'Tadımlık Dilim']
    },
    {
      id: 3,
      name: 'Rize Çam Balı (Ham)',
      origin: 'Rize / Anzer Vadisi Etrafı',
      agingPeriod: 'Taze Hasat (2026)',
      pricePerKg: 450,
      stockKg: 80,
      requiresColdChain: false,
      options: ['Cam Kavanoz', 'Ahşap Hediyelik Kutu']
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    origin: '',
    agingPeriod: '',
    pricePerKg: '',
    stockKg: '',
    requiresColdChain: true,
    optionsInput: 'Vakumlu Paket, İnce Dilim'
  });

  // Yeni Yöresel Ürün Ekleme
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.pricePerKg) return;

    const addedItem = {
      id: Date.now(),
      name: newProd.name,
      origin: newProd.origin || 'Yerel Üretim',
      agingPeriod: newProd.agingPeriod || 'Taze Üretim',
      pricePerKg: parseFloat(newProd.pricePerKg),
      stockKg: parseFloat(newProd.stockKg) || 0,
      requiresColdChain: newProd.requiresColdChain,
      options: newProd.optionsInput.split(',').map(s => s.trim())
    };

    setProducts([...products, addedItem]);
    setShowAddModal(false);
    setNewProd({
      name: '',
      origin: '',
      agingPeriod: '',
      pricePerKg: '',
      stockKg: '',
      requiresColdChain: true,
      optionsInput: 'Vakumlu Paket, İnce Dilim'
    });
    alert(`"${addedItem.name}" kataloğa başarıyla eklendi!`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2>🏷️ Yöresel Ürün & Stok Kataloğu</h2>
          <span style={styles.subText}>Yöre bilgisi, olgunlaştırma süreleri ve soğuk zincir ayarları.</span>
        </div>

        {userRole === 'patron' ? (
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            + Yeni Yöresel Ürün Ekle
          </button>
        ) : (
          <span style={styles.tezgahNotice}>🔒 Ürün Ekleme Yetkisi Sadece Patron Modundadır</span>
        )}
      </div>

      {/* ÜRÜN İSKAMBİL KARTLARI */}
      <div style={styles.grid}>
        {products.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.originBadge}>📍 {item.origin}</span>
              {item.requiresColdChain && (
                <span style={styles.coldBadge}>❄️ Soğuk Zincir</span>
              )}
            </div>

            <h3 style={styles.productTitle}>{item.name}</h3>
            <p style={styles.agingText}>⏳ <b>Dinlendirme/Süre:</b> {item.agingPeriod}</p>

            <div style={styles.optionsBox}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Müşteri Hazırlık Tercihleri:</span>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
                {item.options.map((opt, idx) => (
                  <span key={idx} style={styles.optChip}>{opt}</span>
                ))}
              </div>
            </div>

            <div style={styles.cardFooter}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Stok Durumu:</span>
                <div style={{ fontWeight: 'bold', color: item.stockKg < 15 ? '#ef4444' : '#10b981' }}>
                  {item.stockKg} Kg {item.stockKg < 15 && '(Kritik Stok!)'}
                </div>
              </div>

              {userRole === 'patron' ? (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Kg Satış Fiyatı:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>
                    ₺{item.pricePerKg} / kg
                  </div>
                </div>
              ) : (
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Fiyat Gizli</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: YÖRESEL ÜRÜN EKLEME FORMU */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0 }}>🧀 Yeni Yöresel Ürün Tanımla</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Ürün Adı (Örn: Erzincan Tulum Peyniri)" 
                value={newProd.name} 
                onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                style={styles.modalInput} 
                required 
              />
              <input 
                type="text" 
                placeholder="Yöre / Menşei (Örn: Erzincan / Şavak)" 
                value={newProd.origin} 
                onChange={(e) => setNewProd({ ...newProd, origin: e.target.value })}
                style={styles.modalInput} 
              />
              <input 
                type="text" 
                placeholder="Olgunlaştırma (Örn: 6 Ay Deri Tulumda)" 
                value={newProd.agingPeriod} 
                onChange={(e) => setNewProd({ ...newProd, agingPeriod: e.target.value })}
                style={styles.modalInput} 
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="number" 
                  placeholder="Kg Fiyatı (TL)" 
                  value={newProd.pricePerKg} 
                  onChange={(e) => setNewProd({ ...newProd, pricePerKg: e.target.value })}
                  style={{ ...styles.modalInput, flex: 1 }} 
                  required 
                />
                <input 
                  type="number" 
                  placeholder="Stok (Kg)" 
                  value={newProd.stockKg} 
                  onChange={(e) => setNewProd({ ...newProd, stockKg: e.target.value })}
                  style={{ ...styles.modalInput, flex: 1 }} 
                  required 
                />
              </div>

              <input 
                type="text" 
                placeholder="Hazırlık Seçenekleri (Virgülle ayırın)" 
                value={newProd.optionsInput} 
                onChange={(e) => setNewProd({ ...newProd, optionsInput: e.target.value })}
                style={styles.modalInput} 
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', marginTop: '5px' }}>
                <input 
                  type="checkbox" 
                  checked={newProd.requiresColdChain} 
                  onChange={(e) => setNewProd({ ...newProd, requiresColdChain: e.target.checked })}
                />
                ❄️ Bu ürün Soğuk Zincir (Buz Aküsü + Strafor) gerektirir.
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={styles.saveBtn}>Kataloğa Ekle</button>
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
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  subText: { color: '#64748b', fontSize: '0.9rem' },
  addBtn: { padding: '10px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  tezgahNotice: { fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  originBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  coldBadge: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  productTitle: { margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a' },
  agingText: { margin: '0 0 12px 0', fontSize: '0.82rem', color: '#64748b' },
  optionsBox: { backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '15px' },
  optChip: { backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem', color: '#334155' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' },
  modalInput: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' },
  saveBtn: { flex: 1, padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};