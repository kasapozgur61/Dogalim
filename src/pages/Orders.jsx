import React, { useState } from 'react';

export default function Orders() {
  // Örnek Şarküteri Sipariş Verileri
  const [orders, setOrders] = useState([
    {
      id: 'DGL-1049',
      customerName: 'Ahmet Turgut',
      date: '26 Temmuz 2026 - 14:30',
      status: 'Hazırlanıyor',
      needsColdChain: true, // Soğuk Zincir Gereksinimi
      items: [
        { 
          id: 101, 
          name: 'Olgunlaştırılmış Ezine Peyniri', 
          requestedWeight: 500, // Talep edilen (gr)
          actualWeight: 500,    // Tartılan (gr)
          unitPricePerKg: 360,  // Kg Fiyatı (TL)
          totalPrice: 180, 
          preference: 'İnce Dilim / Vakumlu Paket' 
        },
        { 
          id: 102, 
          name: 'Ev Yapımı Çam Balı', 
          requestedWeight: 1000, 
          actualWeight: 1000, 
          unitPricePerKg: 350, 
          totalPrice: 350, 
          preference: 'Cam Kavanoz / Strafor Ambalaj' 
        }
      ],
      sampleItem: null // Eklenen numune/ikram
    },
    {
      id: 'DGL-1050',
      customerName: 'Ayşe Yılmaz',
      date: '26 Temmuz 2026 - 15:10',
      status: 'Kargoya Verildi',
      needsColdChain: false,
      items: [
        { 
          id: 103, 
          name: 'Kayseri Ev Mantısı', 
          requestedWeight: 1000, 
          actualWeight: 1000, 
          unitPricePerKg: 240, 
          totalPrice: 240, 
          preference: 'Tek Kullanımlık Kase' 
        }
      ],
      sampleItem: '30g Tulum Peyniri (İkram)'
    }
  ]);

  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);

  // Gramaj Değişince Anlık Fiyat Hesaplama
  const handleWeightChange = (orderId, itemId, newWeight) => {
    const weightInGrams = parseFloat(newWeight) || 0;

    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== orderId) return order;

      const updatedItems = order.items.map(item => {
        if (item.id !== itemId) return item;
        // Yeni fiyat hesaplama: (Kg Fiyatı / 1000) * Tartılan Gramaj
        const calculatedPrice = (item.unitPricePerKg / 1000) * weightInGrams;
        return {
          ...item,
          actualWeight: weightInGrams,
          totalPrice: Math.round(calculatedPrice * 100) / 100
        };
      });

      return { ...order, items: updatedItems };
    }));
  };

  // Numune (Tadımlık) Ekleme Fonksiyonu
  const handleAddSample = (orderId) => {
    const sampleName = prompt("Müşteriye pakette ikram etmek istediğiniz tadımlık ürün adını yazın:", "30g Çörek Otlu Tulum Peyniri");
    if (!sampleName) return;

    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        return { ...order, sampleItem: `${sampleName} (Ücretsiz İkram)` };
      }
      return order;
    }));
  };

  // Sipariş Genel Toplamı Hesaplama
  const calculateOrderTotal = (items) => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>📦 Şarküteri Sipariş Operations Panel</h2>
        <span style={styles.subText}>Tartılan miktar girişi, ikram ekleme ve mutfak etiketleri.</span>
      </div>

      <div style={styles.ordersList}>
        {orders.map(order => (
          <div key={order.id} style={styles.orderCard}>
            
            {/* SİPARİŞ BAŞLIĞI VE SOĞUK ZİNCİR UYARISI */}
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.orderId}>{order.id}</span>
                <span style={{ marginLeft: '10px', color: '#64748b', fontSize: '0.9rem' }}>{order.customerName}</span>
                <span style={{ marginLeft: '10px', color: '#94a3b8', fontSize: '0.8rem' }}>({order.date})</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {order.needsColdChain && (
                  <span style={styles.coldChainBadge}>
                    ❄️ SOĞUK ZİNCİR! (Buz Aküsü Kullanın)
                  </span>
                )}
                <span style={styles.statusBadge}>{order.status}</span>
              </div>
            </div>

            {/* ÜRÜN DETAYLARI VE GRAMAJ GİRİŞ ALANLARI */}
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Ürün</th>
                    <th style={styles.th}>Hazırlık / Tercih</th>
                    <th style={styles.th}>Sipariş Edilen</th>
                    <th style={styles.th}>Tartılan Net Miktar (gr)</th>
                    <th style={styles.th}>Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.td}><b>{item.name}</b></td>
                      <td style={styles.td}>
                        <span style={styles.prefBadge}>🏷️ {item.preference}</span>
                      </td>
                      <td style={styles.td}>{item.requestedWeight} gr</td>
                      <td style={styles.td}>
                        {/* TEZGAHTAR TARTI İNPUTU */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <input 
                            type="number" 
                            value={item.actualWeight} 
                            onChange={(e) => handleWeightChange(order.id, item.id, e.target.value)}
                            style={styles.weightInput}
                          />
                          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>gr</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 'bold', color: '#0f172a' }}>
                        ₺{item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TADIMLIK VE ETİKET ALT BAR */}
            <div style={styles.cardFooter}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {order.sampleItem ? (
                  <span style={styles.sampleBadge}>🎁 İkram: {order.sampleItem}</span>
                ) : (
                  <button onClick={() => handleAddSample(order.id)} style={styles.addSampleBtn}>
                    + Tadımlık / İkram Ekle
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Güncel Toplam Tutar:</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>
                    ₺{calculateOrderTotal(order.items)}
                  </div>
                </div>

                <button onClick={() => setSelectedOrderForPrint(order)} style={styles.printBtn}>
                  🖨️ Hazırlık Etiketi Yazdır
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL: ŞARKÜTERİ TEZGAH YAZICI ETİKETİ */}
      {selectedOrderForPrint && (
        <div style={styles.modalOverlay}>
          <div style={styles.printTicket}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>🍃 DOĞALİM ŞARKÜTERİ</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>Sipariş Hazırlama Fişi</p>
            </div>

            <div style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
              <p style={{ margin: '2px 0' }}><b>Sipariş No:</b> #{selectedOrderForPrint.id}</p>
              <p style={{ margin: '2px 0' }}><b>Müşteri:</b> {selectedOrderForPrint.customerName}</p>
              <p style={{ margin: '2px 0' }}><b>Tarih:</b> {selectedOrderForPrint.date}</p>
              {selectedOrderForPrint.needsColdChain && (
                <p style={{ margin: '4px 0', color: '#d97706', fontWeight: 'bold' }}>⚠️ PAKETLEME: STRAFOR + BUZ AKÜSÜ</p>
              )}
            </div>

            <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '8px 0', marginBottom: '10px' }}>
              {selectedOrderForPrint.items.map((it, idx) => (
                <div key={idx} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 'bold' }}>• {it.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#444' }}>Tercih: {it.preference}</div>
                  <div style={{ fontSize: '0.8rem' }}>Tartılan: <b>{it.actualWeight} gr</b> — ₺{it.totalPrice.toFixed(2)}</div>
                </div>
              ))}
              {selectedOrderForPrint.sampleItem && (
                <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '4px' }}>
                  🎁 {selectedOrderForPrint.sampleItem}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', marginBottom: '15px' }}>
              Genel Toplam: ₺{calculateOrderTotal(selectedOrderForPrint.items)}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => window.print()} style={{ ...styles.printBtn, flex: 1 }}>Yazdır</button>
              <button onClick={() => setSelectedOrderForPrint(null)} style={{ ...styles.cancelBtn, flex: 1 }}>Kapat</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// CSS STİLLERİ
const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { marginBottom: '10px' },
  subText: { color: '#64748b', fontSize: '0.9rem' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  orderCard: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' },
  orderId: { fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' },
  statusBadge: { backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' },
  coldChainBadge: { backgroundColor: '#e0f2fe', color: '#0284c7', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #bae6fd' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '15px' },
  thRow: { backgroundColor: '#f8fafc', textAlign: 'left' },
  th: { padding: '10px 12px', fontSize: '0.8rem', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', fontSize: '0.88rem', color: '#334155' },
  prefBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem' },
  weightInput: { width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' },
  addSampleBtn: { padding: '6px 12px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px stroke #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  sampleBadge: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #bbf7d0' },
  printBtn: { padding: '8px 14px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  cancelBtn: { padding: '8px 14px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  printTicket: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', fontFamily: 'monospace' }
};