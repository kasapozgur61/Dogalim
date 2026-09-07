// src/utils/authStorage.js

const ADMIN_STORAGE_KEY = 'dogalim_admins_db';

// Sistemdeki tüm adminleri getirir
export const getAdmins = () => {
  try {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Admin listesi okunamadı:', e);
    return [];
  }
};

// Yeni admin ekler (tamamen dinamik)
export const addAdminToStorage = (email, password, role = 'Saha Yetkilisi') => {
  const admins = getAdmins();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = String(password).trim();

  // Zaten varsa şifresini güncelle, yoksa yeni ekle
  const existingIndex = admins.findIndex(a => a.email === cleanEmail);
  if (existingIndex > -1) {
    admins[existingIndex].password = cleanPassword;
    admins[existingIndex].role = role;
  } else {
    admins.push({
      id: 'adm_' + Date.now(),
      email: cleanEmail,
      password: cleanPassword,
      role: role,
      createdAt: new Date().toLocaleDateString('tr-TR')
    });
  }

  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
  return admins;
};

// Admin siler
export const removeAdminFromStorage = (email) => {
  const cleanEmail = email.trim().toLowerCase();
  const admins = getAdmins().filter(a => a.email !== cleanEmail);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admins));
  return admins;
};

// Admin giriş doğrulaması (Dinamik)
export const verifyAdminLogin = (email, password) => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = String(password).trim();

  // Kök Süper Admin Kontrolü
  if (cleanEmail === 'kasapozgur61@gmail.com' && cleanPassword === 'AsunaKirito61') {
    return { success: true, user: { email: cleanEmail, role: 'super_admin' } };
  }

  // Dinamik Admin Havuzu Kontrolü (Hangi mail olursa olsun)
  const admins = getAdmins();
  const found = admins.find(a => a.email === cleanEmail && a.password === cleanPassword);

  if (found) {
    return { success: true, user: { email: found.email, role: 'saha_admin' } };
  }

  return { success: false, message: 'Admin e-postası veya şifresi hatalı.' };
};