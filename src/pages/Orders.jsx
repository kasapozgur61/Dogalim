import React, { useState } from 'react';

export default function Orders({ userRole = 'tezgah' }) {
  const [orders, setOrders] = useState([
    {
      id: 'DGL-1049',
      customerName: 'Ahmet Turgut',
      date: '29 Temmuz 2026 - 14:30',
      status: 'Hazırlanıyor',
      needsColdChain: true,
      coldChainDetails: {
        icePacksNeeded: 2,
        boxType: 'Orta Boy Strafor Kutu (M-3)',
        packedWithIce: false,
        packedInStrafor: false
      },
      items: [
        { 
          id: 101, 
          name: 'Olgunlaştırılmış Ezine Peyniri', 
          requestedWeight: 500, 
          actualWeight: 500, 
          unitPricePerKg: 360, 
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
          preference: 'Cam Kavanoz / Havalı Sarma' 
        }
      ],
      sampleItem: null
    },
    {
      id: 'DGL-1050',
      customerName: 'Ayşe Yılmaz',
      date: '29 Temmuz 2026 - 15:10',
      status: 'Kargoya Verildi',
      needsColdChain: false,
      coldChainDetails: null,
      items: [
        { 
          id: 103, 
          name: 'Kayseri Ev Mantısı', 
          requestedWeight: 1000, 
          actualWeight: 1000, 
          unitPricePerKg: 240, 
          totalPrice: 240, 
          preference: 'Karton Kutu' 
        }
      ],
      sampleItem: '30g Tulum Peyniri (İkram)'
    }
  ]);

  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState(null);

  // Miktar / Gramaj Değişimi
  const handleWeightChange = (orderId, itemId, newWeight) => {
    const weightInGrams = parseFloat(newWeight) || 0;

    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id !== orderId) return order;

      const updatedItems = order.items.map(item => {
        if (item.id !== itemId) return item;
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

  // İkram Ekleme
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

  // Soğuk Zincir Paket Onay Kutusu (Checkbox)
  const toggleColdChainCheck = (orderId, field) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId && order.coldChainDetails) {
        return {
          ...order,
          coldChainDetails: {
            ...order.coldChainDetails,
            [field]: !order.coldChainDetails[field]
          }
        };
      }
      return order;
    }));
  };

  // Sipariş Durumu Değiştirme (Soğuk Zincir Onayı Kontrolü ile)
  const handleStatusChange = (orderId, newStatus) => {
    const targetOrder = orders.find(o => o.id === orderId);

    if (newStatus === 'Kargoya Hazır' && targetOrder?.needsColdChain) {
      const { packedWithIce, packedInStrafor } = targetOrder.coldChainDetails;
      if (!packedWithIce || !packedInStrafor) {
        alert("⚠️ DIKKAT: Soğuk zincir gerektiren bu siparişte Buz Aküsü ve Strafor Kutu onaylarını işaretlemeden durumu 'Kargoya Hazır' yapamazsınız!");
        return;
      }
    }

    setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const calculateOrderTotal = (items) => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>📦 Şarküteri Sipariş & Soğuk Zincir Paneli</h2>
        <span style={styles.subText}>Tartılan miktar girişi, hassas soğuk zincir kontrolü ve mutfak etiketleri.</span>
      </div>

      <div style={styles.ordersList}>
        {orders.map(order => (
          <div key={order.id} style={styles.orderCard}>
            
            {/* SİPARİŞ BAŞLIĞI VE DURUMU */}
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.orderId}>{order.id}</span>
                <span style={{ marginLeft: '10px', color: '#64748b', fontWeight: 'bold' }}>{order.customerName}</span>
                <span style={{ marginLeft: '10px', color: '#94a3b8', fontSize: '0.8rem' }}>({order.date})</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select 
                  value={order.status} 
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  style={{
                    ...styles.statusSelect,
                    backgroundColor: order.status === 'Kargoya Verildi' ? '#d1fae5' : order.status === 'Kargoya Hazır' ? '#e0f2fe' : '#fef3c7',
                    color: order.status === 'Kargoya Verildi' ? '#065f46' : order.status === 'Kargoya Hazır' ? '#0369a1' : '#92400e'
                  }}
                >
                  <option value="Hazırlanıyor">⏳ Hazırlanıyor</option>
                  <option value="Kargoya Hazır">📦 Kargoya Hazır</option>
                  <option value="Kargoya Verildi">🚚 Kargoya Verildi</option>
                </select>
              </div>
            </div>

            {/* SOĞUK ZİNCİR UYARI BARI (Eğer gerekliyse) */}
            {order.needsColdChain && (
              <div style={styles.coldChainAlertBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>❄️</span>
                  <div>
                    <strong style={{ color: '#0369a1' }}>HASSAS SOĞUK ZİNCİR SEVKİYATI</strong>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#0284c7' }}>
                      Önerilen Paket Tipi: <b>{order.coldChainDetails.boxType}</b> | Gerekli Buz Aküsü: <b>{order.coldChainDetails.icePacksNeeded} Adet</b>
                    </p>
                  </div>
                </div>

                {/* TEZGAHTAR SAKLAMA KONTROLÜ */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <label style={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={order.coldChainDetails.packedInStrafor} 
                      onChange={() => toggleColdChainCheck(order.id, 'packedInStrafor')}
                    />
                    Strafor Kutulandı
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={order.coldChainDetails.packedWithIce} 
                      onChange={() => toggleColdChainCheck(order.id, 'packedWithIce')}
                    />
                    {order.coldChainDetails.icePacksNeeded}x Buz Aküsü Eklendi
                  </label>
                </div>
              </div>
            )}

            {/* ÜRÜN TABLOSU */}
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Ürün</th>
                    <th style={styles.th}>Hazırlık / Tercih</th>
                    <th style={styles.th}>Talep Edilen</th>
                    <th style={styles.th}>Tartılan Net Miktar (gr)</th>
                    {userRole === 'patron' && <th style={styles.th}>Tutar</th>}
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
                      {userRole === 'patron' && (
                        <td style={{ ...styles.td, fontWeight: 'bold', color: '#0f172a' }}>
                          ₺{item.totalPrice.toFixed(2)}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ALT AKSİYON BARI */}
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
                {userRole === 'patron' ? (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Güncel Toplam Tutar:</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>
                      ₺{calculateOrderTotal(order.items)}
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    🔒 Fiyat bilgisi Tezgah Modunda kilitlidir.
                  </span>
                )}

                <button onClick={() => setSelectedOrderForPrint(order)} style={styles.printBtn}>
                  🖨️ Mutfak Etiketi Yazdır
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* TERMAL YAZICI ETİKETİ MODALI */}
      {selectedOrderForPrint && (
        <div style={styles.modalOverlay}>
          <div style={styles.printTicket}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '10px', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>🍃 DOĞALİM ŞARKÜTERİ</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>Mutfak Hazırlık Etiketi</p>
            </div>

            <div style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
              <p style={{ margin: '2px 0' }}><b>Sipariş No:</b> #{selectedOrderForPrint.id}</p>
              <p style={{ margin: '2px 0' }}><b>Müşteri:</b> {selectedOrderForPrint.customerName}</p>
              <p style={{ margin: '2px 0' }}><b>Tarih:</b> {selectedOrderForPrint.date}</p>

              {selectedOrderForPrint.needsColdChain && (
                <div style={{ backgroundColor: '#000', color: '#fff', padding: '6px', textAlign: 'center', marginTop: '6px', fontWeight: 'bold', fontSize: '0.75rem' }}>
                  ❄️ SOĞUK ZİNCİR: {selectedOrderForPrint.coldChainDetails?.icePacksNeeded} BUZ AKÜSÜ + STRAFOR KUTU
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '8px 0', marginBottom: '10px' }}>
              {selectedOrderForPrint.items.map((it, idx) => (
                <div key={idx} style={{ marginBottom: '8px', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 'bold' }}>• {it.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#444' }}>Tercih: {it.preference}</div>
                  <div style={{ fontSize: '0.8rem' }}>Tartılan: <b>{it.actualWeight} gr</b></div>
                </div>
              ))}
              {selectedOrderForPrint.sampleItem && (
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginTop: '4px' }}>
                  🎁 {selectedOrderForPrint.sampleItem}
                </div>
              )}
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

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { marginBottom: '10px' },
  subText: { color: '#64748b', fontSize: '0.9rem' },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  orderCard: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' },
  orderId: { fontWeight: 'bold', fontSize: '1.1rem', color: '#0f172a' },
  statusSelect: { padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' },
  coldChainAlertBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px 16px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  checkboxLabel: { fontSize: '0.85rem', fontWeight: 'bold', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '15px' },
  thRow: { backgroundColor: '#f8fafc', textAlign: 'left' },
  th: { padding: '10px 12px', fontSize: '0.8rem', color: '#64748b', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px', fontSize: '0.88rem', color: '#334155' },
  prefBadge: { backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem' },
  weightInput: { width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 'bold', color: '#0f172a' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' },
  addSampleBtn: { padding: '6px 12px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  sampleBadge: { backgroundColor: '#f0fdf4', color: '#16a34a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #bbf7d0' },
  printBtn: { padding: '8px 14px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  cancelBtn: { padding: '8px 14px', backgroundColor: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  printTicket: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', fontFamily: 'monospace' }
};