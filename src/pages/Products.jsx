import React from 'react';
import { Plus, Minus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Products() {
  const { products, updateStock } = useData();

  return (
    <div className="p-8 space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ürün & Stok Yönetimi</h1>
          <p className="text-sm text-slate-500 mt-1">Anlık stok takibi ve envanter güncelleme paneli.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Ürün Adı</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Fiyat</th>
              <th className="p-4">Mevcut Stok</th>
              <th className="p-4">Durum</th>
              <th className="p-4 text-right">Stok Yönetimi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-semibold text-slate-800">{p.name}</td>
                <td className="p-4 text-slate-500">{p.category}</td>
                <td className="p-4 font-medium text-slate-900">₺{p.price}</td>
                <td className="p-4 font-bold text-slate-800">{p.stock} adet/kg</td>
                <td className="p-4">
                  {p.critical ? (
                    <span className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Kritik Stok</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Yeterli</span>
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => updateStock(p.id, -1)}
                      className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:shadow-xs transition-all cursor-pointer"
                      title="Stok Azalt"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-bold text-slate-700 text-xs">{p.stock}</span>
                    <button
                      onClick={() => updateStock(p.id, 1)}
                      className="p-1.5 hover:bg-white rounded-lg text-emerald-600 hover:shadow-xs transition-all cursor-pointer"
                      title="Stok Artır"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}