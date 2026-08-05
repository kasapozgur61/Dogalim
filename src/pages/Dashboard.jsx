import React, { useState } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Orders from './orders';
import Products from './products';
import Disputes from './disputes';
import Financials from './financials';
import AiAssistant from './aiAssistant'; // YENİ EKLENEN AI DANIŞMAN MODÜLÜ

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('orders');
  const [userRole, setUserRole] = useState('tezgah'); // 'tezgah' veya 'patron'
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const user = auth.currentUser;

  const handleLogout = () => {
    signOut(auth);
  };

  const handleRoleToggleClick = () => {
    if (userRole === 'patron') {
      setUserRole('tezgah');
      setActiveTab('orders');
    } else {
      setPinInput('');
      setPinError(false);
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setUserRole('patron');
      setShowPinModal(false);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <div style={styles.layout}>
      {/* SOL SİDEBAR */}
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand}>
            <span style={styles.logoIcon}>🍃</span>
            <h2 style={styles.logoText}>DOĞALİM</h2>
            <span style={{ 
              ...styles.badge, 
              backgroundColor: userRole === 'patron' ? '#10b981' : '#d97706' 
            }}>
              {userRole === 'patron' ? 'PATRON' : 'TEZGAH'}
            </span>
          </div>

          <nav style={styles.nav}>
            <button 
              onClick={() => setActiveTab('orders')} 
              style={{ ...styles.navBtn, ...(activeTab === 'orders' ? styles.activeNavBtn : {}) }}
            >
              📦 Siparişler & Tartı {userRole === 'tezgah' && '(Tezgah)'}
            </button>

            <button 
              onClick={() => setActiveTab('products')} 
              style={{ ...styles.navBtn, ...(activeTab === 'products' ? styles.activeNavBtn : {}) }}
            >
              🏷️ Yöresel Ürün Kataloğu
            </button>

            <button 
              onClick={() => setActiveTab('disputes')} 
              style={{ ...styles.navBtn, ...(activeTab === 'disputes' ? styles.activeNavBtn : {}) }}
            >
              🛡️ Destek & Kısmi İade
            </button>

            {userRole === 'patron' && (
              <>
                <button 
                  onClick={() => setActiveTab('financials')} 
                  style={{ ...styles.navBtn, ...(activeTab === 'financials' ? styles.activeNavBtn : {}) }}
                >
                  📊 Finans & Ciro Analizi
                </button>
                <button 
                  onClick={() => setActiveTab('ai-assistant')} 
                  style={{ ...styles.navBtn, ...(activeTab === 'ai-assistant' ? styles.activeNavBtn : {}) }}
                >
                  🤖 AI Esnaf Danışmanı
                </button>
              </>
            )}
          </nav>
        </div>

        <div style={styles.sidebarFooter}>
          <button 
            onClick={handleRoleToggleClick} 
            style={{
              ...styles.roleToggleBtn,
              backgroundColor: userRole === 'patron' ? '#10b981' : '#d97706',
            }}
          >
            {userRole === 'tezgah' ? '🔓 Patron Moduna Geç (Şifreli)' : '🔒 Tezgah Moduna Dön'}
          </button>

          <div style={styles.userInfo}>
            <div style={{
              ...styles.avatar,
              backgroundColor: userRole === 'patron' ? '#10b981' : '#d97706'
            }}>
              {user?.displayName ? user.displayName[0].toUpperCase() : 'Ö'}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userName}>{user?.displayName || 'Özgür Kasap'}</span>
              <span style={styles.userRole}>
                {userRole === 'patron' ? 'Dükkan Sahibi' : 'Tezgahtar Modu'}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* SAĞ İÇERİK ALANI */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {activeTab === 'orders' && "Şarküteri Operasyon & Tartı Yönetimi"}
              {activeTab === 'products' && "Yöresel Ürün & Stok Kataloğu"}
              {activeTab === 'disputes' && "Destek & Kısmi İade Yönetimi"}
              {activeTab === 'financials' && "Finansal Raporlar & Ciro Yönetimi"}
              {activeTab === 'ai-assistant' && "Doğalım AI Danışmanı"}
            </h1>
            <p style={styles.headerSub}>
              {activeTab === 'orders' && "Siparişleri tartın, ikram ekleyin ve mutfak fişi bastırın."}
              {activeTab === 'products' && "Yöre bilgisi, dinlendirme süreleri ve soğuk zincir seçenekleri."}
              {activeTab === 'disputes' && "Kargo hasarları, vakum bozulmaları ve müşteri talepleri."}
              {activeTab === 'financials' && "Mağaza cirosu, hakedişler, ikram maliyetleri ve net kâr."}
              {activeTab === 'ai-assistant' && "Şarküteri stok ve satışlarına özel yapay zeka tavsiyeleri."}
            </p>
          </div>
          
          <div style={styles.headerBadges}>
            <span style={{
              ...styles.roleIndicator,
              backgroundColor: userRole === 'patron' ? '#d1fae5' : '#fef3c7',
              color: userRole === 'patron' ? '#065f46' : '#92400e'
            }}>
              {userRole === 'patron' ? '👑 Patron Yetkisi Açık' : '🛡️ Tezgahtar Modu'}
            </span>
          </div>
        </header>

        {/* MODÜL RENDER ALANLARI */}
        {activeTab === 'orders' && <Orders userRole={userRole} />}
        {activeTab === 'products' && <Products userRole={userRole} />}
        {activeTab === 'disputes' && <Disputes userRole={userRole} />}
        {activeTab === 'financials' && <Financials userRole={userRole} />}
        {activeTab === 'ai-assistant' && <AiAssistant userRole={userRole} />}
      </main>

      {/* PATRON MODU ŞİFRE MODALI */}
      {showPinModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>🔑 Patron Modu Girişi</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Finansal verileri ve yetkileri açmak için PIN şifrenizi girin.</p>
            <p style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 'bold' }}>(Demo Şifresi: 1234)</p>
            
            <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              <input 
                type="password" 
                placeholder="PIN Şifresi (1234)" 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: pinError ? '2px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  letterSpacing: '4px'
                }}
                autoFocus
              />
              {pinError && <span style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold' }}>❌ Hatalı PIN! Tekrar deneyin.</span>}

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="submit" style={styles.saveBtn}>Giriş Yap</button>
                <button type="button" onClick={() => setShowPinModal(false)} style={styles.cancelBtn}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", color: '#334155' },
  sidebar: { width: '270px', backgroundColor: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px 16px' },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' },
  logoIcon: { fontSize: '1.8rem' },
  logoText: { margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px', color: '#f8fafc' },
  badge: { color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px' },
  navBtn: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'transparent', color: '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '500', textAlign: 'left' },
  activeNavBtn: { backgroundColor: '#1e293b', color: '#38bdf8', fontWeight: 'bold' },
  sidebarFooter: { borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  roleToggleBtn: { padding: '10px', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', transition: '0.2s' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' },
  userDetails: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '0.9rem', fontWeight: 'bold', color: '#f8fafc' },
  userRole: { fontSize: '0.72rem', color: '#94a3b8' },
  logoutBtn: { padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  mainContent: { flex: 1, padding: '32px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  headerTitle: { margin: 0, fontSize: '1.6rem', color: '#0f172a' },
  headerSub: { margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' },
  roleIndicator: { padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '340px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' },
  saveBtn: { flex: 1, padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};