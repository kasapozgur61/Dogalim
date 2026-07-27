import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  // 1. Ürünler State'i
  const [products, setProducts] = useState([
    { id: 1, name: 'Trabzon Telli Peyniri (Kg)', category: 'Şarküteri', stock: 3, price: 280, critical: true },
    { id: 2, name: 'Vakfıkebir Ekmeği (Büyük)', category: 'Fırın', stock: 15, price: 45, critical: false },
    { id: 3, name: 'Yalıncak Doğal Tereyağı (Kg)', category: 'Mandıra', stock: 8, price: 340, critical: false },
    { id: 4, name: 'Rize Kuru Fasulyesi (Kg)', category: 'Bakliyat', stock: 2, price: 120, critical: true },
  ]);

  // 2. Siparişler State'i
  const [orders, setOrders] = useState([
    {
      id: 'ORD-101',
      customer: 'Ahmet Yılmaz',
      items: [{ productId: 1, name: 'Trabzon Telli Peyniri (Kg)', quantity: 2, price: 280 }],
      total: 560,
      status: 'Bekliyor',
      time: '10 dk önce',
    },
    {
      id: 'ORD-102',
      customer: 'Ayşe Kaya',
      items: [{ productId: 2, name: 'Vakfıkebir Ekmeği (Büyük)', quantity: 3, price: 45 }],
      total: 135,
      status: 'Onaylandı',
      time: '25 dk önce',
    },
  ]);

  // Stok Artırma / Azaltma Fonksiyonu
  const updateStock = (productId, delta) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock, critical: newStock <= 3 };
        }
        return p;
      })
    );
  };

  // Sipariş Durumu Güncelleme ve Stoktan Otomatik Düşme Fonksiyonu
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          // Eğer sipariş 'Onaylandı' yapılıyorsa stokları otomatik düş
          if (newStatus === 'Onaylandı' && order.status !== 'Onaylandı') {
            order.items.forEach((item) => {
              updateStock(item.productId, -item.quantity);
            });
          }
          return { ...order, status: newStatus };
        }
        return order;
      })
    );
  };

  // Anlık İstatistik Hesaplamaları (Dashboard için)
  const todayRevenue = orders
    .filter((o) => o.status !== 'İptal Edildi')
    .reduce((sum, o) => sum + o.total, 0);

  const criticalStockCount = products.filter((p) => p.critical).length;

  return (
    <DataContext.Provider
      value={{
        products,
        orders,
        updateStock,
        updateOrderStatus,
        todayRevenue,
        criticalStockCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);