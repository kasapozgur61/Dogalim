import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Store, LogOut, UserCheck } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Giriş yapılan e-postayı oku (yoksa varsayılan göster)
  const userEmail = localStorage.getItem('userEmail') || 'satici@dogalim.com';

  const menuItems = [
    { path: '/dashboard', label: 'Dükkan Özeti', icon: LayoutDashboard },
    { path: '/products', label: 'Ürün & Stok', icon: Package },
    { path: '/orders', label: 'Gelen Siparişler', icon: ShoppingCart },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sol Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between">
        <div>
          {/* Logo / Başlık */}
          <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg leading-tight">Doğalım</h2>
              <span className="text-xs text-slate-400 font-medium">Satıcı Portalı</span>
            </div>
          </div>

          {/* Menü Linkleri */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Alt Bilgi, Aktif Kullanıcı & Çıkış */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Aktif E-Posta Kartı */}
          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Aktif Oturum</p>
              <p className="text-xs font-medium text-slate-700 truncate" title={userEmail}>
                {userEmail}
              </p>
            </div>
          </div>

          {/* Çıkış Yap Butonu */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Sağ Ana İçerik */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}