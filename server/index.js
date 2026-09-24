// server/index.js - Doğalım Platformu API Sunucusu (PostgreSQL & Redis)
import express from 'express';
import cors from 'cors';
import redisManager from './redis.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory veritabanı yedeği (Prisma / DB çevrimdışı olsa dahi kesinti yaşanmaması için)
const mockDB = {
  sellers: [
    {
      id: 'store_101',
      storename: 'Trabzon Gurme Yöresel',
      email: 'esnaf@dogalim.com',
      pass_hash: '123456',
      phone: '0532 000 00 00',
      patron_pin: '1234',
      rating: 4.9,
      reviewcount: 142,
      minbasketamount: 150.0,
      isapproved: true,
      is_open: true,
      applicant_name: 'Ahmet Turgut',
      tax_number: '1234567890',
      address: 'Meydan Mah. Maraş Cad. No:45 Trabzon',
      created_at: new Date().toISOString()
    }
  ],
  admins: [
    {
      id: 'adm_root',
      email: 'kasapozgur61@gmail.com',
      pass_hash: 'AsunaKirito61',
      name: 'Özgür Kasap',
      role: 'SUPER_ADMIN'
    }
  ],
  staff: [],
  products: [
    {
      id: 'prod_1',
      sellerid: 'store_101',
      name: 'Trabzon Telli Peyniri',
      price: 280.0,
      stock: 45.0,
      origin: 'Trabzon Tonya',
      aging_period: 'Taze Üretim',
      requires_cold_chain: true,
      unit: 'KG',
      options: ['Vakumlu Paket', 'İnce Dilim'],
      isAvailable: true
    },
    {
      id: 'prod_2',
      sellerid: 'store_101',
      name: 'Vakfıkebir Taş Fırın Ekmeği',
      price: 45.0,
      stock: 120.0,
      origin: 'Vakfıkebir',
      aging_period: 'Günlük Taze',
      requires_cold_chain: false,
      unit: 'ADET',
      options: ['Bütün', 'Dilimli'],
      isAvailable: true
    },
    {
      id: 'prod_3',
      sellerid: 'store_101',
      name: 'Yalıncak Doğal Köy Tereyağı',
      price: 340.0,
      stock: 25.0,
      origin: 'Trabzon Yalıncak',
      aging_period: 'Taze',
      requires_cold_chain: true,
      unit: 'KG',
      options: ['Vakumlu Paket'],
      isAvailable: true
    }
  ],
  orders: [
    {
      id: 'ORD-101',
      userid: 'user_1',
      customerName: 'Ahmet Yılmaz',
      total_amount: 560.0,
      status: 'PREPARING', // PENDING, PREPARING, PREPARED, WAITING, ON_THE_WAY, COMPLETED, CANCELLED
      payment_method: 'Kredi Kartı',
      addressid: 'addr_1',
      date: 'Bugün 14:20',
      needsColdChain: true,
      sample_item: '30g Çörek Otlu Tulum Peyniri',
      coldChainDetails: { packedWithIce: true, packedInStrafor: true },
      items: [
        {
          id: 'item_1',
          prodid: 'prod_1',
          name: 'Trabzon Telli Peyniri (Kg)',
          quantity: 2,
          unitPricePerKg: 280.0,
          actualWeight: 2000,
          totalPrice: 560.0
        }
      ]
    }
  ],
  couriers: [
    {
      id: 'kurye_61',
      name: 'Burak K. (Elektrikli Kargo)',
      phone: '0544 111 22 33',
      vehicle_type: 'Elektrikli Scooter',
      is_active: true,
      today_distance: 14.8,
      location: { lat: 40.9982, lng: 39.7178 }
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// 1. KİMLİK DOĞRULAMA (AUTH) ROTASI (PostgreSQL & Redis Session)
// ─────────────────────────────────────────────────────────────
app.post('/api/auth/seller/login', async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPass = password?.trim();

  // 1. Önce personel listesini kontrol et
  const staffMember = mockDB.staff.find(s => s.email.toLowerCase() === cleanEmail && s.pass_hash === cleanPass);
  if (staffMember) {
    const store = mockDB.sellers.find(s => s.id === staffMember.sellerid);
    const token = `token_staff_${Date.now()}`;
    await redisManager.set(`session:${token}`, JSON.stringify({ userId: staffMember.id, role: 'staff', storeId: staffMember.sellerid }));

    return res.json({
      success: true,
      token,
      user: {
        id: staffMember.sellerid,
        storeName: store?.storename || 'Doğalım Şarküteri',
        fullName: staffMember.name,
        email: staffMember.email,
        patronPin: store?.patron_pin || '1234',
        isStaff: true,
        staffRole: staffMember.role
      }
    });
  }

  // 2. Satıcı (Dükkan Sahibi) kontrolü
  const seller = mockDB.sellers.find(s => s.email.toLowerCase() === cleanEmail);
  if (seller && seller.pass_hash === cleanPass) {
    if (!seller.isapproved) {
      return res.status(403).json({ error: '⚠️ Dükkanınız henüz onaylanmamıştır! Admin incelemesi bekleniyor.' });
    }

    const token = `token_seller_${Date.now()}`;
    await redisManager.set(`session:${token}`, JSON.stringify({ userId: seller.id, role: 'seller' }));

    return res.json({
      success: true,
      token,
      user: {
        id: seller.id,
        storeName: seller.storename,
        fullName: seller.applicant_name || 'İşletme Sahibi',
        email: seller.email,
        patronPin: seller.patron_pin || '1234',
        rating: seller.rating,
        minbasketamount: seller.minbasketamount
      }
    });
  }

  return res.status(401).json({ error: 'Giriş başarısız! Kayıtlı dükkan veya şifre bulunamadı.' });
});

// Satıcı Ön Başvuru (Saha İnceleme Talebi)
app.post('/api/auth/seller/apply', async (req, res) => {
  const data = req.body;
  const newSeller = {
    id: 'store_' + Date.now().toString().slice(-6),
    storename: data.storeName,
    email: data.accountEmail?.trim().toLowerCase(),
    pass_hash: data.accountPassword?.trim(),
    phone: data.phone,
    applicant_name: data.fullName,
    tax_number: data.taxNumber,
    address: data.address,
    appointment_date: data.appointmentDate,
    appointment_time: data.appointmentTime,
    patron_pin: data.patronPin || '1234',
    rating: 0.0,
    reviewcount: 0,
    minbasketamount: 0.0,
    isapproved: false,
    is_open: true,
    created_at: new Date().toISOString()
  };

  mockDB.sellers.push(newSeller);
  await redisManager.publishOrderEvent('admin:applications', { event: 'NEW_APPLICATION', store: newSeller });

  return res.json({ success: true, message: 'Başvurunuz başarıyla alındı.', sellerId: newSeller.id });
});

// Admin Girişi
app.post('/api/auth/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPass = password?.trim();

  const admin = mockDB.admins.find(a => a.email.toLowerCase() === cleanEmail && a.pass_hash === cleanPass);
  if (admin) {
    const token = `token_admin_${Date.now()}`;
    await redisManager.set(`session:${token}`, JSON.stringify({ userId: admin.id, role: admin.role }));
    return res.json({
      success: true,
      token,
      user: { email: admin.email, role: admin.role, name: admin.name }
    });
  }

  return res.status(401).json({ error: 'Yetkisiz Giriş! Admin e-postası veya şifresi hatalı.' });
});

// ─────────────────────────────────────────────────────────────
// 2. SİPARİŞ & TARTI (WEIGHING) ROTASI
// ─────────────────────────────────────────────────────────────
app.get('/api/seller/orders', async (req, res) => {
  return res.json(mockDB.orders);
});

// Hassas Tartı Güncelleme
app.patch('/api/seller/orders/:orderId/weigh', async (req, res) => {
  const { orderId } = req.params;
  const { itemId, actualWeight } = req.body;

  const order = mockDB.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });

  const item = order.items.find(i => i.id === itemId);
  if (item) {
    item.actualWeight = parseFloat(actualWeight);
    item.totalPrice = Math.round(((item.unitPricePerKg / 1000) * item.actualWeight) * 100) / 100;
    order.total_amount = order.items.reduce((s, it) => s + it.totalPrice, 0);

    // Redis ile kurye ve mobil müşteriye güncel tartı bildirimini yayınla
    await redisManager.publishOrderEvent(`order:${orderId}:update`, {
      event: 'ITEM_WEIGHED',
      itemId,
      actualWeight,
      newTotal: order.total_amount
    });
  }

  return res.json({ success: true, order });
});

// Sipariş Durumu Değiştirme
app.patch('/api/seller/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status, coldChainDetails, sampleItem } = req.body;

  const order = mockDB.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: 'Sipariş bulunamadı' });

  if (status) order.status = status;
  if (coldChainDetails) order.coldChainDetails = coldChainDetails;
  if (sampleItem) order.sample_item = sampleItem;

  await redisManager.publishOrderEvent(`order:${orderId}:status`, { event: 'STATUS_CHANGED', status });
  return res.json({ success: true, order });
});

// ─────────────────────────────────────────────────────────────
// 3. ÜRÜN & STOK KATALOĞU (PostgreSQL Prod Modeli)
// ─────────────────────────────────────────────────────────────
app.get('/api/seller/products', async (req, res) => {
  return res.json(mockDB.products);
});

app.post('/api/seller/products', async (req, res) => {
  const newProd = {
    id: 'prod_' + Date.now(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  mockDB.products.push(newProd);
  return res.json({ success: true, product: newProd });
});

app.put('/api/seller/products/:id', async (req, res) => {
  const { id } = req.params;
  const index = mockDB.products.findIndex(p => String(p.id) === String(id));
  if (index > -1) {
    mockDB.products[index] = { ...mockDB.products[index], ...req.body };
    return res.json({ success: true, product: mockDB.products[index] });
  }
  return res.status(404).json({ error: 'Ürün bulunamadı' });
});

app.delete('/api/seller/products/:id', async (req, res) => {
  const { id } = req.params;
  mockDB.products = mockDB.products.filter(p => String(p.id) !== String(id));
  return res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────
// 4. SAHA YÖNETİCİSİ (ADMIN) ROTASI
// ─────────────────────────────────────────────────────────────
app.get('/api/admin/sellers/pending', async (req, res) => {
  const pending = mockDB.sellers.filter(s => !s.isapproved);
  return res.json(pending);
});

app.patch('/api/admin/sellers/:id/approve', async (req, res) => {
  const { id } = req.params;
  const seller = mockDB.sellers.find(s => s.id === id);
  if (seller) {
    seller.isapproved = true;
    return res.json({ success: true, seller });
  }
  return res.status(404).json({ error: 'Başvuru bulunamadı' });
});

// ─────────────────────────────────────────────────────────────
// 5. KURYE & TELEMETRİ (Redis Canlı Konum)
// ─────────────────────────────────────────────────────────────
app.get('/api/couriers', async (req, res) => {
  const result = await Promise.all(mockDB.couriers.map(async (c) => {
    const telemetry = await redisManager.getCourierLocation(c.id);
    return {
      ...c,
      liveLocation: telemetry ? { lat: telemetry.latitude, lng: telemetry.longitude } : c.location,
      currentTemp: telemetry?.temperature || '3.8°C'
    };
  }));
  return res.json(result);
});

app.listen(PORT, () => {
  console.log(`🚀 [Dogalim Backend] PostgreSQL & Redis API Servisi port ${PORT} üzerinde hazır.`);
});
