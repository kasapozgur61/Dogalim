import axios from 'axios';

// Backend sunucumuzun adresi (Backend hazır olunca buraya bağlanacak)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Redis veya JWT Token'ı istek başlığına otomatik ekler
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 1. Kimlik, Giriş & Saha Ön Başvuru Servisleri
export const authService = {
  sellerLogin: (credentials) => api.post('/auth/seller/login', credentials),
  sellerApply: (formData) => api.post('/auth/seller/apply', formData),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials)
};

// 2. Sipariş & Tartı İşlemleri
export const orderService = {
  getOrders: () => api.get('/seller/orders'),
  updateActualWeight: (orderId, weightData) => api.patch(`/seller/orders/${orderId}/weigh`, weightData)
};

// 3. Admin Saha Onay & Şarküteri Doğrulama İşlemleri
export const adminService = {
  getPendingApplications: () => api.get('/admin/sellers/pending'),
  approveSeller: (sellerId) => api.patch(`/admin/sellers/${sellerId}/approve`)
};

export default api;