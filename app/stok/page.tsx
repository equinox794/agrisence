'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface Stock {
  id: string;
  name: string;
  category: 'hammadde' | 'ambalaj';
  unit: string;
  quantity: number;
  min_quantity: number;
  price: number;
  currency: string;
  supplier_id?: string;
  notes?: string;
  created_at: string;
}

export default function StokPage() {
  const { t } = useTranslation();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'hammadde' as 'hammadde' | 'ambalaj',
    unit: 'kg',
    quantity: 0,
    min_quantity: 0,
    price: 0,
    currency: 'TRY',
    notes: '',
  });

  // Stokları yükle
  const fetchStocks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/stocks?${params}`);
      if (!response.ok) throw new Error('Stoklar yüklenemedi');

      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error(error);
      toast.error(t('stock.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [categoryFilter, search]);

  // Toplam değer hesapla
  const totalValue = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.price), 0);

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingStock ? `/api/stocks/${editingStock.id}` : '/api/stocks';
      const method = editingStock ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('İşlem başarısız');

      toast.success(editingStock ? t('stock.updateSuccess') : t('stock.addSuccess'));
      setShowDialog(false);
      resetForm();
      fetchStocks();
    } catch (error) {
      console.error(error);
      toast.error(t('stock.error'));
    }
  };

  // Stok sil
  const handleDelete = async (id: string) => {
    if (!confirm(t('common.deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/stocks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Silme başarısız');

      toast.success(t('stock.deleteSuccess'));
      fetchStocks();
    } catch (error) {
      console.error(error);
      toast.error(t('stock.error'));
    }
  };

  // Düzenle
  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      name: stock.name,
      category: stock.category,
      unit: stock.unit,
      quantity: stock.quantity,
      min_quantity: stock.min_quantity,
      price: stock.price,
      currency: stock.currency,
      notes: stock.notes || '',
    });
    setShowDialog(true);
  };

  // Form reset
  const resetForm = () => {
    setEditingStock(null);
    setFormData({
      name: '',
      category: 'hammadde',
      unit: 'kg',
      quantity: 0,
      min_quantity: 0,
      price: 0,
      currency: 'TRY',
      notes: '',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold text-[var(--primary-text)]">
            Stok Yönetimi
          </h1>
          <div className="text-sm text-[var(--secondary-text)]">
            <span>Stok Sayısı: </span>
            <span className="font-semibold">{stocks.length}</span>
          </div>
          <div className="text-sm text-[var(--secondary-text)]">
            <span>Toplam Değer: </span>
            <span className="font-semibold">{totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select className="px-4 py-2.5 rounded-md bg-[var(--card-background)] border border-[var(--border)] text-[var(--primary-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]">
            <option>Tümü</option>
          </select>
          <button
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Yeni Stok</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            <span>Stokları İndir</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors">
            <span className="material-symbols-outlined text-lg">cloud_upload</span>
            <span>Stok Ekle</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-text)]">
            search
          </span>
          <input
            type="text"
            placeholder="Stok adı veya kodu ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[var(--card-background)] border border-[var(--border)] text-[var(--primary-text)] placeholder:text-[var(--secondary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card-background)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#1c2127] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">ID</th>
              <th className="px-6 py-4 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">ÜRÜN ADI</th>
              <th className="px-6 py-4 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">MİKTAR</th>
              <th className="px-6 py-4 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">BİRİM</th>
              <th className="px-6 py-4 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">FİYAT</th>
              <th className="px-6 py-4 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">STOK TÜRÜ</th>
              <th className="px-6 py-4 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">KRİTİK STOK</th>
              <th className="px-6 py-4 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">TOPLAM TL</th>
              <th className="px-6 py-4 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">İŞLEMLER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-[var(--secondary-text)]">
                  {t('common.loading')}
                </td>
              </tr>
            ) : stocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-[var(--secondary-text)]">
                  {t('stock.noData')}
                </td>
              </tr>
            ) : (
              stocks.map((stock, index) => {
                const isLowStock = stock.quantity < stock.min_quantity;
                const totalPrice = stock.quantity * stock.price;
                
                return (
                  <tr
                    key={stock.id}
                    className="hover:bg-[var(--card-hover)] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--secondary-text)]">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--primary-text)]">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--secondary-text)]">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--secondary-text)]">
                      {stock.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--secondary-text)]">
                      {stock.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--secondary-text)]">
                      {stock.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--secondary-text)]">
                      {stock.min_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--secondary-text)]">
                      {totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="text-[var(--secondary-text)] hover:text-[var(--primary-green)] transition-colors"
                          title="Düzenle"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(stock.id)}
                          className="text-[var(--secondary-text)] hover:text-[var(--error)] transition-colors"
                          title="Sil"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog (Modal) */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-background)] border border-[var(--border)] rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-[var(--primary-text)] mb-6">
              {editingStock ? 'Stok Düzenle' : 'Yeni Stok Ekle'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--primary-text)] mb-1.5 block">
                  Stok Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--primary-text)] mb-1.5 block">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                    required
                  >
                    <option value="hammadde">Hammadde</option>
                    <option value="ambalaj">Ambalaj</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--primary-text)] mb-1.5 block">
                    Birim
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                    required
                  >
                    <option value="kg">kg</option>
                    <option value="L">L (Litre)</option>
                    <option value="adet">Adet</option>
                    <option value="ton">Ton</option>
                    <option value="m3">m³</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--primary-text)] mb-1.5 block">
                    Miktar
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--primary-text)] mb-1.5 block">
                    Min. Stok
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--primary-text)] mb-1.5 block">
                    Fiyat
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--primary-text)] mb-1.5 block">
                    Para Birimi
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  >
                    <option value="TRY">TRY (₺)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--primary-text)] mb-1.5 block">
                  Notlar
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDialog(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 rounded-md bg-[var(--card-background)] text-[var(--primary-text)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors text-sm font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--primary-green)] text-white hover:bg-[var(--accent-green)] transition-colors text-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-lg">save</span>
                  <span>Kaydet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
