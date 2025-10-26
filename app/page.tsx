'use client';

import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-[var(--primary-text)]">
        {t('dashboard.title')}
      </h1>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="flex flex-col gap-2 rounded-lg p-6 bg-[var(--card-background)] border border-[var(--border)] hover:border-[var(--primary-green)] transition-colors duration-300">
          <p className="text-sm font-medium text-[var(--secondary-text)]">
            {t('dashboard.totalStocks')}
          </p>
          <p className="text-3xl font-bold text-[var(--primary-text)]">0</p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-6 bg-[var(--card-background)] border border-[var(--border)] hover:border-[var(--primary-green)] transition-colors duration-300">
          <p className="text-sm font-medium text-[var(--secondary-text)]">
            {t('dashboard.lowStockItems')}
          </p>
          <p className="text-3xl font-bold text-[var(--primary-text)]">0</p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-6 bg-[var(--card-background)] border border-[var(--border)] hover:border-[var(--primary-green)] transition-colors duration-300">
          <p className="text-sm font-medium text-[var(--secondary-text)]">
            {t('dashboard.totalCustomers')}
          </p>
          <p className="text-3xl font-bold text-[var(--primary-text)]">0</p>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-6 bg-[var(--card-background)] border border-[var(--border)] hover:border-[var(--primary-green)] transition-colors duration-300">
          <p className="text-sm font-medium text-[var(--secondary-text)]">
            {t('dashboard.monthlyOrders')}
          </p>
          <p className="text-3xl font-bold text-[var(--primary-text)]">0</p>
        </div>
      </div>

      {/* Bilgilendirme */}
      <div className="rounded-lg p-8 bg-[var(--card-background)] border border-[var(--border)] text-center">
        <span className="material-symbols-outlined text-[var(--primary-green)] text-6xl mb-4">
          rocket_launch
        </span>
        <h2 className="text-2xl font-bold text-[var(--primary-text)] mb-2">
          Hoş Geldiniz!
        </h2>
        <p className="text-[var(--secondary-text)] mb-6">
          Stok Yönetimi modülü aktif. Başlamak için sol menüden "Stok Yönetimi"ne tıklayın.
        </p>
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary-green)] text-white font-medium hover:bg-[var(--accent-green)] transition-colors">
          <span className="material-symbols-outlined">inventory</span>
          <span>Stok Yönetimine Git</span>
        </div>
      </div>
    </div>
  );
}
