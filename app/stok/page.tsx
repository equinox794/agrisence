'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortBy, setSortBy] = useState<'quantity' | 'total' | null>(null);

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

  // Sıralama fonksiyonu
  const handleSort = () => {
    if (!sortBy) {
      // İlk tıklama: Miktara göre sırala
      setSortBy('quantity');
      const sorted = [...stocks].sort((a, b) => b.quantity - a.quantity);
      setStocks(sorted);
    } else if (sortBy === 'quantity') {
      // İkinci tıklama: Toplam TL'ye göre sırala
      setSortBy('total');
      const sorted = [...stocks].sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price));
      setStocks(sorted);
    } else {
      // Üçüncü tıklama: Sıfırla (varsayılan sıralama)
      setSortBy(null);
      fetchStocks();
    }
  };

  // Excel İndirme
  const handleDownloadExcel = () => {
    try {
      // Stokları Excel formatına çevir
      const excelData = stocks.map((stock, index) => ({
        'Sıra': index + 1,
        'Ürün Adı': stock.name,
        'Kategori': stock.category === 'hammadde' ? 'Hammadde' : 'Ambalaj',
        'Miktar': stock.quantity,
        'Birim': stock.unit,
        'Fiyat': stock.price,
        'Para Birimi': stock.currency,
        'Min. Stok': stock.min_quantity,
        'Notlar': stock.notes || ''
      }));

      // Workbook oluştur
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Stoklar');

      // Sütun genişliklerini ayarla
      const columnWidths = [
        { wch: 8 },  // Sıra
        { wch: 30 }, // Ürün Adı
        { wch: 12 }, // Kategori
        { wch: 10 }, // Miktar
        { wch: 8 },  // Birim
        { wch: 10 }, // Fiyat
        { wch: 12 }, // Para Birimi
        { wch: 10 }, // Min. Stok
        { wch: 30 }  // Notlar
      ];
      worksheet['!cols'] = columnWidths;

      // Dosyayı indir
      const fileName = `stoklar_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Stoklar Excel dosyasına aktarıldı!');
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      toast.error('Excel dosyası indirilemedi');
    }
  };

  // Excel Yükleme
  const handleUploadExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Excel verilerini API formatına çevir
      const newStocks = jsonData.map((row: any) => ({
        name: row['Ürün Adı'] || row['Urun Adi'] || '',
        category: (row['Kategori'] === 'Ambalaj' || row['Kategori'] === 'ambalaj') ? 'ambalaj' : 'hammadde',
        quantity: parseFloat(row['Miktar']) || 0,
        unit: row['Birim'] || 'kg',
        price: parseFloat(row['Fiyat']) || 0,
        currency: row['Para Birimi'] || row['Para Birimi'] || 'TRY',
        min_quantity: parseFloat(row['Min. Stok'] || row['Min Stok']) || 0,
        notes: row['Notlar'] || ''
      }));

      // Önce tüm stokları sil
      const deleteResponse = await fetch('/api/stocks/bulk-delete', {
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        throw new Error('Eski stoklar silinemedi');
      }

      // Yeni stokları ekle
      const createResponse = await fetch('/api/stocks/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stocks: newStocks }),
      });

      if (!createResponse.ok) {
        throw new Error('Yeni stoklar eklenemedi');
      }

      toast.success(`${newStocks.length} ürün başarıyla yüklendi!`);
      fetchStocks();
      
      // Input'u sıfırla
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Excel yükleme hatası:', error);
      toast.error('Excel dosyası yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="mb-5">
        {/* Title and Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[var(--primary-green)] text-2xl">warehouse</span>
            <h1 className="text-xl font-bold text-[var(--primary-text)]">
              {t('stock.title')}
            </h1>
          </div>
          
          <div className="flex gap-4 text-xs text-[var(--secondary-text)]">
            <div>
              <span>{t('stock.stockCount')}: </span>
              <span className="font-semibold">{stocks.length}</span>
            </div>
            <div>
              <span>{t('stock.totalValue')}: </span>
              <span className="font-semibold">{totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select className="px-3 py-2 rounded-md bg-[var(--card-background)] border border-[var(--border)] text-[var(--primary-text)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]">
            <option>{t('stock.filterAll')}</option>
          </select>
          <button
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_box</span>
            <span>{t('stock.newStock')}</span>
          </button>
          <button 
            onClick={handleDownloadExcel}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>{t('stock.downloadStocks')}</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>{t('stock.uploadStock')}</span>
          </button>
          <button 
            onClick={handleSort}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-white text-xs font-semibold transition-colors ${
              sortBy === 'quantity' 
                ? 'bg-orange-600 hover:bg-orange-700' 
                : sortBy === 'total' 
                ? 'bg-pink-600 hover:bg-pink-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={
              sortBy === 'quantity' 
                ? t('stock.sortByTotal') 
                : sortBy === 'total' 
                ? 'Varsayılana Dön' 
                : t('stock.sortByQuantity')
            }
          >
            <span className="material-symbols-outlined text-base">
              {sortBy ? 'arrow_downward' : 'sort'}
            </span>
            <span>
              {sortBy === 'quantity' 
                ? t('stock.sortByQuantity') 
                : sortBy === 'total' 
                ? t('stock.sortByTotal') 
                : 'Sırala'}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleUploadExcel}
            className="hidden"
          />
        </div>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--secondary-text)] text-lg">
            search
          </span>
          <input
            type="text"
            placeholder={t('stock.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-[var(--card-background)] border border-[var(--border)] text-[var(--primary-text)] placeholder:text-[var(--secondary-text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
          />
        </div>
      </div>

      {/* Mobile Cards - Hidden on Desktop */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <div className="text-center py-8 text-[var(--secondary-text)] text-sm">
            {t('common.loading')}
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-8 text-[var(--secondary-text)] text-sm">
            {t('stock.noData')}
          </div>
        ) : (
          stocks.map((stock, index) => {
            const isLowStock = stock.quantity < stock.min_quantity;
            const totalPrice = stock.quantity * stock.price;
            
            return (
              <div key={stock.id} className="bg-[var(--card-background)] border border-[var(--border)] rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--primary-text)] mb-1">{stock.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      stock.category === 'hammadde' 
                        ? 'bg-blue-500/10 text-blue-400' 
                        : 'bg-purple-500/10 text-purple-400'
                    }`}>
                      <span className="material-symbols-outlined text-xs">
                        {stock.category === 'hammadde' ? 'science' : 'package'}
                      </span>
                      {stock.category === 'hammadde' ? t('stock.filterHammadde') : t('stock.filterAmbalaj')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(stock)}
                      className="p-2 rounded-md bg-[var(--primary-green)]/10 text-[var(--primary-green)] hover:bg-[var(--primary-green)]/20"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(stock.id)}
                      className="p-2 rounded-md bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[var(--secondary-text)]">{t('stock.quantity')}: </span>
                    <span className="text-[var(--primary-text)] font-medium">{stock.quantity} {stock.unit}</span>
                  </div>
                  <div>
                    <span className="text-[var(--secondary-text)]">{t('stock.price')}: </span>
                    <span className="text-[var(--primary-text)] font-medium">{stock.price} {stock.currency}</span>
                  </div>
                  <div>
                    <span className="text-[var(--secondary-text)]">{t('stock.minQuantity')}: </span>
                    <span className="text-[var(--primary-text)] font-medium">{stock.min_quantity}</span>
                    {isLowStock && (
                      <span className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold bg-[var(--error)] text-white">
                        <span className="material-symbols-outlined text-xs">error</span>
                        {t('stock.lowStock')}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[var(--secondary-text)]">{t('stock.totalTL')}: </span>
                    <span className="text-[var(--primary-text)] font-medium">{totalPrice.toFixed(2)} TL</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden lg:block rounded-lg border border-[var(--border)] bg-[var(--card-background)] overflow-hidden overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#1c2127] border-b border-[var(--border)]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">{t('stock.id')}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">{t('stock.productName')}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">{t('stock.amount')}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">{t('stock.unitCol')}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">{t('stock.priceCol')}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">{t('stock.stockType')}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">{t('stock.criticalStock')}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">{t('stock.totalTL')}</th>
              <th className="px-4 py-3 text-left font-semibold text-[var(--primary-text)] uppercase text-xs tracking-wider">{t('stock.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-[var(--secondary-text)] text-sm">
                  {t('common.loading')}
                </td>
              </tr>
            ) : stocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-[var(--secondary-text)] text-sm">
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
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--secondary-text)]">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-[var(--primary-text)]">
                      {stock.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--secondary-text)]">
                      {stock.quantity}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--secondary-text)]">
                      {stock.unit}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--secondary-text)]">
                      {stock.price}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        stock.category === 'hammadde' 
                          ? 'bg-blue-500/10 text-blue-400' 
                          : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        <span className="material-symbols-outlined text-xs">
                          {stock.category === 'hammadde' ? 'science' : 'package'}
                        </span>
                        {stock.category === 'hammadde' ? t('stock.filterHammadde') : t('stock.filterAmbalaj')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[var(--secondary-text)]">{stock.min_quantity}</span>
                        {isLowStock && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold bg-[var(--error)] text-white">
                            <span className="material-symbols-outlined text-xs">error</span>
                            {t('stock.lowStock')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--secondary-text)]">
                      {totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="p-2 rounded-md bg-[var(--primary-green)]/10 text-[var(--primary-green)] hover:bg-[var(--primary-green)]/20 transition-colors"
                          title={t('stock.edit')}
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(stock.id)}
                          className="p-2 rounded-md bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20 transition-colors"
                          title={t('stock.delete')}
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
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
          <div className="bg-[var(--card-background)] border border-[var(--border)] rounded-lg p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[var(--primary-text)] mb-4">
              {editingStock ? t('stock.editStock') : t('stock.addNew')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[var(--primary-text)] mb-1 block">
                  {t('stock.name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--primary-text)] mb-1 block">
                    {t('stock.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  >
                    <option value="hammadde">{t('stock.filterHammadde')}</option>
                    <option value="ambalaj">{t('stock.filterAmbalaj')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--primary-text)] mb-1 block">
                    {t('stock.unit')}
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L (Litre)</option>
                    <option value="adet">Adet</option>
                    <option value="ton">Ton</option>
                    <option value="m3">m³</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--primary-text)] mb-1 block">
                    {t('stock.quantity')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--primary-text)] mb-1 block">
                    {t('stock.minQuantity')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--primary-text)] mb-1 block">
                    {t('stock.price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--primary-text)] mb-1 block">
                    {t('stock.currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  >
                    <option value="TRY">TRY (₺)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--primary-text)] mb-1 block">
                  {t('stock.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] placeholder:text-[var(--secondary-text)] focus:outline-none focus:border-[var(--primary-green)] transition-colors"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDialog(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-md bg-[var(--card-background)] text-[var(--primary-text)] border border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors text-xs font-medium"
                >
                  {t('stock.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[var(--primary-green)] text-white hover:bg-[var(--accent-green)] transition-colors text-xs font-medium"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>{t('stock.save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
