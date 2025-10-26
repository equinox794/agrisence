'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationItems } from '@/config/navigation';
import { appConfig } from '@/config/app';
import { useTranslation } from '@/lib/i18n';

export default function Sidebar() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--card-background)] border-r border-[var(--border)] flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-[var(--border)]">
        <div 
          className="text-[var(--primary-green)] w-7 h-7"
          dangerouslySetInnerHTML={{ __html: appConfig.logo.svg }}
        />
        <h2 className="text-base font-bold text-white">{appConfig.name}</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {navigationItems
            .sort((a, b) => a.order - b.order)
            .map((item) => {
              const isActive = pathname === item.route;
              const isEnabled = item.enabled;

              return (
                <li key={item.id}>
                  {isEnabled ? (
                    <Link
                      href={item.route}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-200 text-sm
                        ${
                          isActive
                            ? 'bg-[var(--primary-green)] text-white font-medium'
                            : 'text-[var(--secondary-text)] hover:bg-[var(--card-hover)] hover:text-[var(--primary-text)]'
                        }
                      `}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {item.icon}
                      </span>
                      <span>{t(`sidebar.${item.id}`)}</span>
                    </Link>
                  ) : (
                    <div
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[var(--secondary-text)] opacity-50 cursor-not-allowed text-sm"
                      title="Yakında aktif olacak"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {item.icon}
                      </span>
                      <span>{t(`sidebar.${item.id}`)}</span>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Language Selector - Dropdown */}
      <div className="px-4 py-4 border-t border-[var(--border)]">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--primary-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] cursor-pointer"
        >
          {appConfig.languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Version */}
      <div className="px-6 py-3 text-center text-xs text-[var(--secondary-text)]">
        v{appConfig.version}
      </div>
    </aside>
  );
}

