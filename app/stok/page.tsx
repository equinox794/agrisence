'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
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
        <h1 className="text-4xl font-bold text-[var(--primary-text)]">
          {t('stock.title')}
        </h1>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          {t('stock.addNew')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder={t('stock.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={[
            { value: 'all', label: t('stock.filterAll') },
            { value: 'hammadde', label: t('stock.filterHammadde') },
            { value: 'ambalaj', label: t('stock.filterAmbalaj') },
          ]}
          className="w-48"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card-background)] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--border-hover)]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--secondary-text)] uppercase tracking-wider">
                {t('stock.name')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--secondary-text)] uppercase tracking-wider">
                {t('stock.category')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--secondary-text)] uppercase tracking-wider">
                {t('stock.quantity')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--secondary-text)] uppercase tracking-wider">
                {t('stock.price')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--secondary-text)] uppercase tracking-wider">
                {t('stock.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--secondary-text)]">
                  {t('common.loading')}
                </td>
              </tr>
            ) : stocks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--secondary-text)]">
                  {t('stock.noData')}
                </td>
              </tr>
            ) : (
              stocks.map((stock) => {
                const isLowStock = stock.quantity < stock.min_quantity;
                return (
                  <tr
                    key={stock.id}
                    className="hover:bg-[var(--card-hover)] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--primary-text)]">
                      {stock.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--secondary-text)]">
                      {stock.category === 'hammadde' ? t('stock.filterHammadde') : t('stock.filterAmbalaj')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--primary-text)]">
                          {stock.quantity} {stock.unit}
                        </span>
                        {isLowStock && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--error)]/10 text-[var(--error)]">
                            {t('stock.lowStock')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--primary-text)]">
                      {stock.price} {stock.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="text-[var(--primary-green)] hover:text-[var(--accent-green)] transition-colors"
                          title={t('stock.edit')}
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(stock.id)}
                          className="text-[var(--error)] hover:text-red-600 transition-colors"
                          title={t('stock.delete')}
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
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
              {editingStock ? t('stock.edit') : t('stock.addNew')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t('stock.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label={t('stock.category')}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  options={[
                    { value: 'hammadde', label: t('stock.filterHammadde') },
                    { value: 'ambalaj', label: t('stock.filterAmbalaj') },
                  ]}
                  required
                />

                <Select
                  label={t('stock.unit')}
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  options={[
                    { value: 'kg', label: 'kg' },
                    { value: 'L', label: 'L (Litre)' },
                    { value: 'adet', label: 'Adet' },
                    { value: 'ton', label: 'Ton' },
                    { value: 'm3', label: 'm³' },
                  ]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('stock.quantity')}
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  required
                />

                <Input
                  label={t('stock.minQuantity')}
                  type="number"
                  step="0.01"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('stock.price')}
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  required
                />

                <Select
                  label="Para Birimi"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  options={[
                    { value: 'TRY', label: 'TRY (₺)' },
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                  ]}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--primary-text)] mb-1.5 block">
                  {t('stock.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDialog(false);
                    resetForm();
                  }}
                >
                  {t('stock.cancel')}
                </Button>
                <Button type="submit">
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  {t('stock.save')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

