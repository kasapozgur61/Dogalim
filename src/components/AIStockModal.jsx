import React, { useState } from 'react';
import { X, Cpu, AlertTriangle, Building2, Check, ArrowRight, Truck } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AIStockModal({ isOpen, onClose }) {
  const { products, updateStock } = useData();
  const [requestedId, setRequestedId] = useState(null);

  if (!isOpen) return null;

  // Kritik durumdaki ürünleri bul
  const criticalProducts = products.filter((p) => p.critical);

  // Örnek yerel ikame tedarikçi simülasyonu
  const suppliers = [
    { id: 1, name: 'Sürmene Mandıra Kooperatifi', region: 'Sürmene / Trabzon', delivery: 'Bugün (2-4 Saat)', price: '275 ₺/kg', rating: '4.9' },
    { id: 2, name: 'Tonya Süt Ürünleri Ltd.', region: 'Tonya / Trabzon', delivery: 'Yarın Sabah', price: '265 ₺/kg', rating: '4.7' },
  ];

  const handleOrderSupply = (productId, addedAmount) => {
    setRequestedId(productId);
    setTimeout(() => {
      updateStock(productId, addedAmount);
      setRequestedId(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-6 flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-xl text-emerald-300">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Yapay Zeka Stok & Hammadde Asistanı</h2>
              <p className="text-xs text-emerald-200 mt-0.5">Trabzon Yerel Üretici Ağı Analizi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Durum Özeti */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold">
                {criticalProducts.length > 0
                  ? `${criticalProducts.length} adet hammadde/ürün stok eşiğinin altında!`
                  : 'Şu an stoklar ideal seviyede.'}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Sistem, dükkanınızın satış ivmesini analiz ederek ikame yerel tedarikçilerden en hızlı teslimat ve uygun fiyat opsiyonlarını listeledi.
              </p>
            </div>
          </div>

          {/* Kritik Ürün Liste & İkame Tedarikçiler */}
          {criticalProducts.map((product) => (
            <div key={product.id} className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50/50">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                  <span className="text-xs text-slate-500">Mevcut Stok: <strong className="text-rose-600">{product.stock} kg/adet</strong></span>
                </div>
                <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                  Kritik Düzey
                </span>
              </div>

              {/* İkame Tedarikçi Önerileri */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Yapay Zeka Önerili Yerel İkame Tedarikçiler
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suppliers.map((sup) => (
                    <div key={sup.id} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 relative hover:border-emerald-500 transition-colors">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-800 text-xs">{sup.name}</h4>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                          ★ {sup.rating}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" /> {sup.delivery}
                      </p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-900">{sup.price}</span>
                        <button
                          onClick={() => handleOrderSupply(product.id, 10)}
                          disabled={requestedId === product.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {requestedId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Ekleniyor...
                            </>
                          ) : (
                            <>
                              <span>10 Kg Sipariş Et</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {criticalProducts.length === 0 && (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <p className="font-semibold text-slate-700">Tüm Hammaddeler Yeterli Seviyede</p>
              <p className="text-xs">Yapay zeka asistanı stoklarınızı anlık izlemeye devam ediyor.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}