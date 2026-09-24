// server/redis.js - Redis Bağlantı ve Önbellek Yöneticisi
// Hem canlı Redis bağlantısını hem de geliştirme ortamında kesinti olmaması için bellek içi önbelleği destekler.

let redisClient = null;
const memoryStore = new Map();
const memoryGeos = new Map();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Redis bağlantısını dene
try {
  // Dinamik import veya ioredis kontrolü
  const Redis = (await import('ioredis')).default;
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) return null; // 3 denemeden sonra offline moda geç
      return Math.min(times * 100, 2000);
    },
    lazyConnect: true
  });

  redisClient.connect().then(() => {
    console.log('✅ [Redis] Canlı Redis sunucusuna başarıyla bağlanıldı.');
  }).catch(() => {
    console.log('ℹ️ [Redis] Yerel Redis sunucusuna erişilemedi, otomatik bellek içi (in-memory) mod devrede.');
    redisClient = null;
  });
} catch (e) {
  // ioredis yüklü değilse veya bağlantı yoksa sessizce in-memory mod devrede
  redisClient = null;
}

export const redisManager = {
  // 1. Anahtar-Değer Önbellek (Token, Oturum, Hızlı Sorgu)
  async get(key) {
    if (redisClient) {
      try { return await redisClient.get(key); } catch (e) { /* fallback */ }
    }
    return memoryStore.get(key) || null;
  },

  async set(key, value, expireSeconds = 3600) {
    if (redisClient) {
      try {
        if (expireSeconds) return await redisClient.set(key, value, 'EX', expireSeconds);
        return await redisClient.set(key, value);
      } catch (e) { /* fallback */ }
    }
    memoryStore.set(key, value);
    return 'OK';
  },

  async del(key) {
    if (redisClient) {
      try { return await redisClient.del(key); } catch (e) { /* fallback */ }
    }
    memoryStore.delete(key);
    return 1;
  },

  // 2. Kurye Canlı Konum ve Telemetri (Geospatial)
  async updateCourierLocation(courierId, longitude, latitude, telemetry = {}) {
    const data = {
      courierId,
      longitude: parseFloat(longitude),
      latitude: parseFloat(latitude),
      temperature: telemetry.temperature || '4.0°C',
      battery: telemetry.battery || '85%',
      lastPing: new Date().toISOString()
    };

    if (redisClient) {
      try {
        // Redis GEOADD ile kurye lokasyonunu kaydet
        await redisClient.geoadd('couriers:locations', longitude, latitude, courierId);
        // Telemetriyi hash veya string olarak sakla
        await redisClient.set(`courier:telemetry:${courierId}`, JSON.stringify(data), 'EX', 300);
        return data;
      } catch (e) { /* fallback */ }
    }

    memoryGeos.set(courierId, data);
    return data;
  },

  async getCourierLocation(courierId) {
    if (redisClient) {
      try {
        const raw = await redisClient.get(`courier:telemetry:${courierId}`);
        if (raw) return JSON.parse(raw);
      } catch (e) { /* fallback */ }
    }
    return memoryGeos.get(courierId) || null;
  },

  // 3. Sipariş & Bildirim Olayları (Pub/Sub)
  async publishOrderEvent(channel, payload) {
    const message = JSON.stringify(payload);
    if (redisClient) {
      try {
        await redisClient.publish(channel, message);
      } catch (e) { /* fallback */ }
    }
    console.log(`📡 [Redis Event] [${channel}]:`, payload.event || payload);
  }
};

export default redisManager;
