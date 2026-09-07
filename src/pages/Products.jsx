import React, { useState, useEffect } from 'react';

export default function Products({ userRole = 'tezgah', storeData }) {
  const storeId = storeData?.id || 'guest';
  const PRODUCTS_KEY = `dogalim_products_${storeId}`;

  const [products, setProducts] = useState(() => {
    try {
      const raw = localStorage.getItem(PRODUCTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // inline silme onayı
  const [formData, setFormData] = useState({
    name: '', origin: '', agingPeriod: '',
    pricePerKg: '', stockKg: '',
    requiresColdChain: true,
    optionsInput: 'Vakumlu Paket, İnce Dilim'
  });

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products, PRODUCTS_KEY]);

  const resetForm = () => {
    setFormData({ name: '', origin: '', agingPeriod: '', pricePerKg: '', stockKg: '', requiresColdChain: true, optionsInput: 'Vakumlu Paket, İnce Dilim' });
    setEditingProduct(null);
  };

  const openAddModal = () => { resetForm(); setShowModal(true); };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      origin: product.origin,
      agingPeriod: product.agingPeriod,
      pricePerKg: String(product.pricePerKg),
      stockKg: String(product.stockKg),
      requiresColdChain: product.requiresColdChain,
      optionsInput: (product.options || []).join(', ')
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.pricePerKg) return;

    const productData = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: formData.name.trim(),
      origin: formData.origin.trim() || 'Yerel Üretim',
      agingPeriod: formData.agingPeriod.trim() || 'Taze Üretim',
      pricePerKg: parseFloat(formData.pricePerKg) || 0,
      stockKg: parseFloat(formData.stockKg) || 0,
      requiresColdChain: formData.requiresColdChain,
      options: formData.optionsInput.split(',').map(s => s.trim()).filter(Boolean)
    };

    if (editingProduct) {
      // Düzenleme: mevcut ürünü güncelle
      setProducts(prev => prev.map(p => String(p.id) === String(editingProduct.id) ? productData : p));
    } else {
      // Yeni ekleme
      setProducts(prev => [...prev, productData]);
    }

    setShowModal(false);
    resetForm();
  };

  const handleDeleteConfirmed = (productId) => {
    setProducts(prev => prev.filter(p => String(p.id) !== String(productId)));
    setConfirmDeleteId(null);
  };

  const handleStockUpdate = (productId, delta) => {
    setProducts(prev => prev.map(p => {
      if (String(p.id) !== String(productId)) return p;
      return { ...p, stockKg: Math.max(0, Math.round((parseFloat(p.stockKg) + delta) * 10) / 10) };
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h2>🏷️ Yöresel Ürün & Stok Kataloğu</h2>
          <span style={styles.subText}>Yöre bilgisi, olgunlaştırma süreleri ve soğuk zincir ayarları.</span>
        </div>
        {userRole === 'patron' ? (
          <button onClick={openAddModal} style={styles.addBtn}>+ Yeni Yöresel Ürün Ekle</button>
        ) : (
          <span style={styles.tezgahNotice}>🔒 Ürün Ekleme Yetkisi Sadece Patron Modundadır</span>
        )}
      </div>

      {products.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={{ fontSize: '3rem' }}>🧀</span>
          <h3 style={{ margin: '12px 0 6px', color: '#0f172a' }}>Katalog Boş</h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '300px', textAlign: 'center', lineHeight: '1.5' }}>
            {userRole === 'patron'
              ? 'Henüz ürün eklenmemiş. Aşağıdaki butona tıklayarak kataloğunuzu oluşturun.'
              : 'Henüz kataloga ürün eklenmemiş.'}
          </p>
          {userRole === 'patron' && (
            <button onClick={openAddModal} style={{ ...styles.addBtn, marginTop: '8px' }}>+ İlk Ürünü Ekle</button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.originBadge}>📍 {item.origin}</span>
                {item.requiresColdChain && <span style={styles.coldBadge}>❄️ Soğuk Zincir</span>}
              </div>

              <h3 style={styles.productTitle}>{item.name}</h3>
              <p style={styles.agingText}>⏳ <b>Dinlendirme/Süre:</b> {item.agingPeriod}</p>

              <div style={styles.optionsBox}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Müşteri Hazırlık Tercihleri:</span>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {(item.options || []).map((opt, idx) => <span key={idx} style={styles.optChip}>{opt}</span>)}
                </div>
              </div>

              <div style={styles.cardFooter}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Stok:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    {userRole === 'patron' && (
                      <button onClick={() => handleStockUpdate(item.id, -1)} style={styles.stockBtn}>−</button>
                    )}
                    <span style={{ fontWeight: 'bold', color: item.stockKg < 15 ? '#ef4444' : '#10b981', fontSize: '0.95rem' }}>
                      {item.stockKg} Kg
                    </span>
                    {userRole === 'patron' && (
                      <button onClick={() => handleStockUpdate(item.id, 1)} style={styles.stockBtn}>+</button>
                    )}
                    {item.stockKg < 15 && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold' }}>⚠️ Kritik</span>}
                  </div>
                </div>

                {userRole === 'patron' ? (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Kg Fiyatı:</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>₺{item.pricePerKg} / kg</div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Fiyat Gizli</span>
                )}
              </div>

              {/* PATRON: Düzenle / Sil */}
              {userRole === 'patron' && (
                <div style={styles.actionRow}>
                  {confirmDeleteId === item.id ? (
                    // Inline silme onayı
                    <div style={styles.confirmRow}>
                      <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: '600' }}>Silmek istediğinize emin misiniz?</span>
                      <button onClick={() => handleDeleteConfirmed(item.id)} style={styles.confirmYesBtn}>✓ Sil</button>
                      <button onClick={() => setConfirmDeleteId(null)} style={styles.confirmNoBtn}>✕ İptal</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => openEditModal(item)} style={styles.editBtn}>✏️ Düzenle</button>
                      <button onClick={() => setConfirmDeleteId(item.id)} style={styles.deleteBtn}>🗑️ Sil</button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* EKLEME / DÜZENLEME MODALI */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetForm(); } }}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#0f172a', fontWeight: '800', fontSize: '1.1rem' }}>
              {editingProduct ? `✏️ "${editingProduct.name}" — Düzenle` : '🧀 Yeni Yöresel Ürün Tanımla'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Ürün Adı (Örn: Erzincan Tulum Peyniri)" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={styles.modalInput} required />
              <input type="text" placeholder="Yöre / Menşei (Örn: Erzincan / Şavak)" value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })} style={styles.modalInput} />
              <input type="text" placeholder="Olgunlaştırma Süresi (Örn: 6 Ay Deri Tulumda)" value={formData.agingPeriod}
                onChange={(e) => setFormData({ ...formData, agingPeriod: e.target.value })} style={styles.modalInput} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" step="0.01" min="0" placeholder="Kg Fiyatı (TL)" value={formData.pricePerKg}
                  onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                  style={{ ...styles.modalInput, flex: 1 }} required />
                <input type="number" step="0.1" min="0" placeholder="Stok (Kg)" value={formData.stockKg}
                  onChange={(e) => setFormData({ ...formData, stockKg: e.target.value })}
                  style={{ ...styles.modalInput, flex: 1 }} required />
              </div>
              <input type="text" placeholder="Hazırlık Seçenekleri (virgülle: İnce Dilim, Vakumlu Paket)" value={formData.optionsInput}
                onChange={(e) => setFormData({ ...formData, optionsInput: e.target.value })} style={styles.modalInput} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', color: '#334155' }}>
                <input type="checkbox" checked={formData.requiresColdChain}
                  onChange={(e) => setFormData({ ...formData, requiresColdChain: e.target.checked })} />
                ❄️ Bu ürün Soğuk Zincir (Buz Aküsü + Strafor) gerektirir.
              </label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={styles.saveBtn}>
                  {editingProduct ? '💾 Değişiklikleri Kaydet' : '✅ Kataloğa Ekle'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={styles.cancelBtn}>İptal</button>
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
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  subText: { color: '#64748b', fontSize: '0.9rem' },
  addBtn: { padding: '10px 18px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' },
  tezgahNotice: { fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0', padding: '60px 24px', gap: '8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  originBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  coldBadge: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  productTitle: { margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' },
  agingText: { margin: 0, fontSize: '0.82rem', color: '#64748b' },
  optionsBox: { backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' },
  optChip: { backgroundColor: '#fff', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#334155' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' },
  stockBtn: { width: '26px', height: '26px', borderRadius: '6px', border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', padding: 0, transition: 'all 0.15s' },
  actionRow: { display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', alignItems: 'center' },
  editBtn: { flex: 1, padding: '8px 10px', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
  deleteBtn: { flex: 1, padding: '8px 10px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' },
  confirmRow: { display: 'flex', alignItems: 'center', gap: '6px', width: '100%' },
  confirmYesBtn: { padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' },
  confirmNoBtn: { padding: '6px 12px', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modalContent: { backgroundColor: '#fff', padding: '28px', borderRadius: '16px', width: '90%', maxWidth: '440px', boxShadow: '0 32px 64px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto' },
  modalInput: { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', width: '100%', transition: 'border-color 0.2s', color: '#0f172a' },
  saveBtn: { flex: 1, padding: '12px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' },
  cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }
};