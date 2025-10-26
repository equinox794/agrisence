'use client';

import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-5">
        <span className="material-symbols-outlined text-[var(--primary-green)] text-2xl">dashboard</span>
        <h1 className="text-xl font-bold text-[var(--primary-text)]">
          {t('dashboard.title')}
        </h1>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-3 rounded-lg p-4 bg-[var(--card-background)] border border-[var(--border)] hover:border-[var(--primary-green)] transition-colors duration-300">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-green)]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--primary-green)] text-xl">inventory_2</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--secondary-text)]">
              {t('dashboard.totalStocks')}
            </p>
            <p className="text-2xl font-bold text-[var(--primary-text)]">0</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg p-4 bg-[var(--card-background)] border border-[var(--border)] hover:border-[var(--error)] transition-colors duration-300">
          <div className="w-10 h-10 rounded-lg bg-[var(--error)]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--error)] text-xl">warning</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--secondary-text)]">
              {t('dashboard.lowStockItems')}
            </p>
            <p className="text-2xl font-bold text-[var(--error)]">0</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg p-4 bg-[var(--card-background)] border border-[var(--border)] hover:border-[var(--primary-green)] transition-colors duration-300">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-green)]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--primary-green)] text-xl">group</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--secondary-text)]">
              {t('dashboard.totalCustomers')}
            </p>
            <p className="text-2xl font-bold text-[var(--primary-text)]">0</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg p-4 bg-[var(--card-background)] border border-[var(--border)] hover:border-[var(--primary-green)] transition-colors duration-300">
          <div className="w-10 h-10 rounded-lg bg-[var(--primary-green)]/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-[var(--primary-green)] text-xl">shopping_cart</span>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--secondary-text)]">
              {t('dashboard.monthlyOrders')}
            </p>
            <p className="text-2xl font-bold text-[var(--primary-text)]">0</p>
          </div>
        </div>
      </div>

      {/* Bilgilendirme */}
      <div className="rounded-lg p-6 bg-[var(--card-background)] border border-[var(--border)] text-center">
        <span className="material-symbols-outlined text-[var(--primary-green)] text-5xl mb-3">
          rocket_launch
        </span>
        <h2 className="text-lg font-bold text-[var(--primary-text)] mb-2">
          {t('dashboard.welcome')}
        </h2>
        <p className="text-sm text-[var(--secondary-text)] mb-4">
          {t('dashboard.welcomeMessage')}
        </p>
        <Link href="/stok" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-green)] text-white text-sm font-medium hover:bg-[var(--accent-green)] transition-colors">
          <span className="material-symbols-outlined text-lg">inventory</span>
          <span>{t('dashboard.goToStock')}</span>
        </Link>
      </div>
    </div>
  );
}
