import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Orders from './orders';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const user = auth.currentUser;

  // MODAL STATELERİ (Açılır Pencereler)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Form Stateleri
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Organik Gıda', stock: '' });
  const [productsList, setProductsList] = useState([
    { id: 1, name: 'Organik Ev Yapımı Salça', price: 180, stock: 3, category: 'Sos & Salça' },
    { id: 2, name: 'Süzme Çam Balı 500g', price: 350, stock: 12, category: 'Kahvaltılık' },
    { id: 3, name: 'Sızma Zeytinyağı 1L', price: 420, stock: 8, category: 'Yağlar' }
  ]);

  const [campaignText, setCampaignText] = useState('');

  const handleLogout = () => {
    signOut(auth);
  };

  // Ürün Ekleme İşlemi
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    
    setProductsList([...productsList, { ...newProduct, id: Date.now() }]);
    alert(`"${newProduct.name}" başarıyla eklendi!`);
    setNewProduct({ name: '', price: '', category: 'Organik Gıda', stock: '' });
    setShowAddProductModal(false);
  };

  return (
    <div style={styles.layout}>
      {/* SOL SİDEBAR (YAN MENÜ) */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.logoIcon}>🍃</span>
          <h2 style={styles.logoText}>DOĞALIM</h2>
        </div>

        <nav style={styles.nav}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            style={{ ...styles.navBtn, ...(activeTab === 'dashboard' ? styles.activeNavBtn : {}) }}
          >
            📊 Geniş Bakış (Dashboard)
          </button>
          <button 
            onClick={() => setActiveTab('orders')} 
            style={{ ...styles.navBtn, ...(activeTab === 'orders' ? styles.activeNavBtn : {}) }}
          >
            📦 Sipariş Yönetimi
          </button>
          <button 
            onClick={() => setActiveTab('products')} 
            style={{ ...styles.navBtn, ...(activeTab === 'products' ? styles.activeNavBtn : {}) }}
          >
            🏷️ Ürün Kataloğu ({productsList.length})
          </button>
          <button 
            onClick={() => setActiveTab('ai-assistant')} 
            style={{ ...styles.navBtn, ...(activeTab === 'ai-assistant' ? styles.activeNavBtn : {}) }}
          >
            🤖 AI Esnaf Danışmanı
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.displayName ? user.displayName[0].toUpperCase() : 'K'}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user?.displayName || 'Kirito'}</span>
              <span style={styles.userRole}>Doğal Üretici</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* SAĞ ANA İÇERİK ALANI */}
      <main style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {activeTab === 'dashboard' && "Mağaza Genel Bakış"}
              {activeTab === 'orders' && "Sipariş Yönetimi"}
              {activeTab === 'products' && "Ürün Kataloğu"}
              {activeTab === 'ai-assistant' && "Doğalım AI Esnaf Danışmanı"}
            </h1>
            <p style={styles.headerSub}>
              {activeTab === 'dashboard' && "Hoş geldin! Mağazanızı ve canlı istatistikleri buradan yönetin."}
              {activeTab === 'orders' && "Gelen siparişleri görün, kargo durumlarını güncelleyin."}
              {activeTab === 'products' && "Mevcut ürünlerinizi listeleyin ve yeni ürün stokları ekleyin."}
              {activeTab === 'ai-assistant' && "Yapay zeka destekli fiyatlandırma ve stok analiz raporları."}
            </p>
          </div>
          <div style={styles.headerBadges}>
            <span style={styles.statusBadge}>🟢 Sistem Aktif</span>
          </div>
        </header>

        {/* SEKME 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div style={styles.dashboardGrid}>
            
            {/* İstatistikler */}
            <div style={styles.statsContainer}>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>💰</span>
                <div>
                  <h4 style={styles.statTitle}>Toplam Ciro</h4>
                  <p style={styles.statValue}>₺24,850</p>
                  <span style={styles.statChange}>+12% bu hafta</span>
                </div>
              </div>

              <div style={styles.statCard}>
                <span style={styles.statIcon}>🛒</span>
                <div>
                  <h4 style={styles.statTitle}>Aktif Siparişler</h4>
                  <p style={styles.statValue}>18 Adet</p>
                  <span style={styles.statSub}>4 tanesi kargolanacak</span>
                </div>
              </div>

              <div style={styles.statCard}>
                <span style={styles.statIcon}>⭐</span>
                <div>
                  <h4 style={styles.statTitle}>Mağaza Puanı</h4>
                  <p style={styles.statValue}>4.9 / 5.0</p>
                  <span style={styles.statSub}>128 Değerlendirme</span>
                </div>
              </div>
            </div>

            {/* AI Smart Insights */}
            <div style={styles.aiCard}>
              <div style={styles.aiHeader}>
                <span style={{ fontSize: '1.5rem' }}>✨</span>
                <div>
                  <h3 style={{ margin: 0, color: '#1e293b' }}>Doğalım AI Smart Insights</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Yapay zeka mağazanın stoklarını ve satışlarını analiz etti:</p>
                </div>
              </div>
              <div style={styles.aiContent}>
                <div style={styles.aiTip}>
                  💡 <b>Stok Uyarısı:</b> "Organik Ev Yapımı Salça" stoklarınız tükenmek üzere (Son 3 kavanoz). Önümüzdeki hafta talep %20 artabilir.
                </div>
                <div style={styles.aiTip}>
                  📈 <b>Fiyatlandırma Tavsiyesi:</b> Çam balı satışlarınız bölgenizde en çok tercih edilenler arasında. Küçük bir paket indirimi uygulayabilirsiniz.
                </div>
              </div>
            </div>

            {/* Hızlı İşlemler ve Son Aktiviteler */}
            <div style={styles.lowerGrid}>
              <div style={styles.cardBox}>
                <h3>⚡ Hızlı İşlemler</h3>
                <div style={styles.actionButtons}>
                  <button onClick={() => setShowAddProductModal(true)} style={styles.actionBtnPrimary}>
                    + Yeni Ürün Ekle
                  </button>
                  <button onClick={() => setShowShippingModal(true)} style={styles.actionBtn}>
                    📦 Kargo Etiketi Yazdır
                  </button>
                  <button onClick={() => setShowCampaignModal(true)} style={styles.actionBtn}>
                    📣 Kampanya Oluştur
                  </button>
                </div>
              </div>

              <div style={styles.cardBox}>
                <h3>🔔 Son Aktiviteler</h3>
                <ul style={styles.activityList}>
                  <li>✅ Ahmet K. "2 kg Organik Zeytin" siparişi verdi. <small>(10 dk önce)</small></li>
                  <li>🚚 Sipariş #1049 kargoya verildi. <small>(1 saat önce)</small></li>
                  <li>💬 Ayşe M. bir ürün sorusu sordu. <small>(3 saat önce)</small></li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* SEKME 2: SİPARİŞ YÖNETİMİ */}
        {activeTab === 'orders' && (
          <div style={styles.cardBox}>
            <Orders />
          </div>
        )}

        {/* SEKME 3: ÜRÜN KATALOĞU */}
        {activeTab === 'products' && (
          <div style={styles.cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Mağaza Ürün Listeniz</h3>
              <button onClick={() => setShowAddProductModal(true)} style={styles.actionBtnPrimary}>
                + Yeni Ürün Ekle
              </button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                  <th style={styles.th}>Ürün Adı</th>
                  <th style={styles.th}>Kategori</th>
                  <th style={styles.th}>Fiyat</th>
                  <th style={styles.th}>Stok</th>
                  <th style={styles.th}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {productsList.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={styles.td}><b>{item.name}</b></td>
                    <td style={styles.td}>{item.category}</td>
                    <td style={styles.td}>₺{item.price}</td>
                    <td style={styles.td}>{item.stock} Adet</td>
                    <td style={styles.td}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.8rem', 
                        backgroundColor: item.stock < 5 ? '#fef2f2' : '#f0fdf4',
                        color: item.stock < 5 ? '#ef4444' : '#16a34a',
                        fontWeight: 'bold'
                      }}>
                        {item.stock < 5 ? 'Kritik Stok' : 'Stokta Var'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SEKME 4: AI ESNAF DANIŞMANI */}
        {activeTab === 'ai-assistant' && (
          <div style={styles.cardBox}>
            <h3>🤖 AI Esnaf Analiz Raporu</h3>
            <p>Doğalım Yapay Zeka motoru mağazanızın verilerini anlık analiz eder:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div style={{ ...styles.aiTip, borderLeft: '4px solid #10b981' }}>
                <b>📊 Satış Trendi:</b> Hafta sonları organik reçel ve bal satışlarınız %35 artış gösteriyor. Cuma günleri stok güncellemesi yapmanız tavsiye edilir.
              </div>
              <div style={{ ...styles.aiTip, borderLeft: '4px solid #3b82f6' }}>
                <b>🎯 Müşteri Eğilimi:</b> Alıcılar en çok "Ücretsiz Kargo" seçeneği olan paket ürünleri tercih ediyor. 500 TL üzeri kargo bedava kampanyası sepetleri büyütebilir.
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- MODAL 1: ÜRÜN EKLEME AÇILIR PENCERESİ --- */}
      {showAddProductModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0 }}>+ Yeni Ürün Ekle</h3>
            <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Ürün Adı (örn: Organik Bal)" 
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                style={styles.modalInput} 
                required 
              />
              <input 
                type="number" 
                placeholder="Fiyat (TL)" 
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                style={styles.modalInput} 
                required 
              />
              <input 
                type="number" 
                placeholder="Stok Adedi" 
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                style={styles.modalInput} 
                required 
              />
              <select 
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                style={styles.modalInput}
              >
                <option value="Organik Gıda">Organik Gıda</option>
                <option value="Sos & Salça">Sos & Salça</option>
                <option value="Kahvaltılık">Kahvaltılık</option>
                <option value="Süt Ürünleri">Süt Ürünleri</option>
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={styles.actionBtnPrimary}>Kaydet & Yayınla</button>
                <button type="button" onClick={() => setShowAddProductModal(false)} style={styles.actionBtnCancel}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: KARGO ETİKETİ BASKI MİSALİ --- */}
      {showShippingModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, border: '2px dashed #0f172a' }}>
            <h3 style={{ marginTop: 0 }}>📦 Kargo Barkod Etiketi</h3>
            <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <p><b>Gönderici:</b> DOĞALIM / Kirito Mağazası</p>
              <p><b>Alıcı:</b> Ahmet Yılmaz - Trabzon / Akçaabat</p>
              <p><b>Kargo Takip No:</b> #TR-2026-9948</p>
              <div style={{ textAlign: 'center', margin: '15px 0', fontSize: '1.8rem', letterSpacing: '4px', fontFamily: 'monospace' }}>
                |||||| | ||||| |||| |||
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => window.print()} style={styles.actionBtnPrimary}>🖨️ Etiketi Yazdır</button>
              <button onClick={() => setShowShippingModal(false)} style={styles.actionBtnCancel}>Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: KAMPANYA OLUŞTURMA --- */}
      {showCampaignModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0 }}>📣 AI Kampanya Sihirbazı</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Mağazanız için anında WhatsApp/Sosyal Medya duyuru metni hazırlayın:</p>
            <button 
              onClick={() => setCampaignText("🌿 Doğalım 'dan Hafta Sonu Fırsatı! Tüm organik ürünlerimizde %15 İndirim başladı. Sipariş için hemen sitemizi ziyaret edin!")}
              style={{ ...styles.actionBtn, marginBottom: '10px', width: '100%' }}
            >
              ✨ AI Metni Oluştur
            </button>

            {campaignText && (
              <textarea 
                rows="4" 
                value={campaignText} 
                onChange={(e) => setCampaignText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => { alert("Kampanya SMS/Sosyal Medya duyurusu başlatıldı!"); setShowCampaignModal(false); }} style={styles.actionBtnPrimary}>Kampanyayı Yayınla</button>
              <button onClick={() => setShowCampaignModal(false)} style={styles.actionBtnCancel}>İptal</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// CSS STİLLERİ
const styles = {
  layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", color: '#334155' },
  sidebar: { width: '260px', backgroundColor: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' },
  logoIcon: { fontSize: '1.8rem' },
  logoText: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px', color: '#f8fafc' },
  badge: { backgroundColor: '#10b981', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px' },
  navBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', textAlign: 'left' },
  activeNavBtn: { backgroundColor: '#1e293b', color: '#38bdf8', fontWeight: 'bold' },
  sidebarFooter: { borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' },
  userDetails: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '0.9rem', fontWeight: 'bold', color: '#f8fafc' },
  userRole: { fontSize: '0.75rem', color: '#94a3b8' },
  logoutBtn: { padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  mainContent: { flex: 1, padding: '32px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  headerTitle: { margin: 0, fontSize: '1.6rem', color: '#0f172a' },
  headerSub: { margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' },
  statusBadge: { backgroundColor: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
  dashboardGrid: { display: 'flex', flexDirection: 'column', gap: '24px' },
  statsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
  statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0' },
  statIcon: { fontSize: '2rem', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '10px' },
  statTitle: { margin: 0, fontSize: '0.85rem', color: '#64748b' },
  statValue: { margin: '4px 0', fontSize: '1.4rem', fontWeight: 'bold', color: '#0f172a' },
  statChange: { fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' },
  statSub: { fontSize: '0.75rem', color: '#94a3b8' },
  aiCard: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px' },
  aiHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  aiContent: { display: 'flex', flexDirection: 'column', gap: '10px' },
  aiTip: { backgroundColor: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0f2fe', fontSize: '0.9rem', color: '#334155' },
  lowerGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  cardBox: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  actionButtons: { display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' },
  actionBtn: { padding: '10px 14px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  actionBtnPrimary: { padding: '10px 14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  actionBtnCancel: { padding: '10px 14px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  activityList: { listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '0.85rem' },
  td: { padding: '12px', fontSize: '0.9rem', color: '#334155' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '28px', borderRadius: '12px', width: '90%', maxWidth: '420px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' },
  modalInput: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }
};