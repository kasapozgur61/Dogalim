import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "orders"), 
          where("sellerId", "==", user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(ordersList);
      } catch (error) {
        console.error("Siparişler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px' }}>Siparişler yükleniyor...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>📦 Sipariş Yönetimi</h2>
      
      {orders.length === 0 ? (
        <p style={{ color: '#666', marginTop: '10px' }}>Henüz alınmış bir sipariş bulunmuyor.</p>
      ) : (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orders.map(order => (
            <div 
              key={order.id} 
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#fff'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>Sipariş ID: #{order.id}</div>
              <div>Müşteri: {order.customerName || 'Bilinmiyor'}</div>
              <div>Toplam Tutar: {order.totalAmount} TL</div>
              <div>Durum: <span style={{ color: 'orange' }}>{order.status || 'Hazırlanıyor'}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}