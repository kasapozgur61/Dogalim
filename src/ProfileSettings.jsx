import React, { useState } from 'react';
import { sellerService } from './services/api';

export default function ProfileSettings({ onClose, currentStore }) {
  const [displayName, setDisplayName] = useState(currentStore?.fullName || currentStore?.storeName || '');
  const [username, setUsername] = useState(currentStore?.email?.split('@')[0] || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sellerService.updateProfile(currentStore?.id, { displayName, username });
      // Yerel oturum güncellemesi
      if (currentStore) {
        const updated = { ...currentStore, fullName: displayName, storeName: displayName };
        localStorage.setItem('currentStore', JSON.stringify(updated));
      }
      alert("Profil bilgileriniz başarıyla güncellendi!");
      if (onClose) onClose();
    } catch (error) {
      alert("Güncelleme hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={{ marginTop: 0 }}>Profil Bilgilerini Düzenle</h3>
      <form onSubmit={handleUpdate} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Ad Soyad / Dükkan Adı:</label>
          <input 
            type="text" 
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)} 
            placeholder="Örn: Özgür Kasap"
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Kullanıcı Adı:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Örn: ozgurkasap"
            style={styles.input}
            required
          />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" disabled={loading} style={styles.saveBtn}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              İptal
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '100%' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.85rem', color: '#555', fontWeight: 'bold' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' },
  saveBtn: { padding: '10px 15px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { padding: '10px 15px', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};