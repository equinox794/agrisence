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
      <div className="h-16 flex items-center gap-3 px-6 border-b border-[var(--border)]">
        <div 
          className="text-[var(--primary-green)]"
          dangerouslySetInnerHTML={{ __html: appConfig.logo.svg }}
        />
        <h2 className="text-xl font-bold text-white">{appConfig.name}</h2>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
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
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? 'bg-[var(--primary-green)] text-white'
                            : 'text-[var(--secondary-text)] hover:bg-[var(--card-hover)] hover:text-[var(--primary-text)]'
                        }
                      `}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{t(`sidebar.${item.id}`)}</span>
                    </Link>
                  ) : (
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--secondary-text)] opacity-50 cursor-not-allowed"
                      title="Yakında aktif olacak"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{t(`sidebar.${item.id}`)}</span>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Language Selector */}
      <div className="px-4 py-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          {appConfig.languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as any)}
              className={`
                flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                ${
                  language === lang.code
                    ? 'bg-[var(--primary-green)] text-white'
                    : 'bg-[var(--background)] text-[var(--secondary-text)] hover:bg-[var(--card-hover)]'
                }
              `}
              title={lang.name}
            >
              {lang.flag} {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Version */}
      <div className="px-6 py-3 text-center text-xs text-[var(--secondary-text)]">
        v{appConfig.version}
      </div>
    </aside>
  );
}

