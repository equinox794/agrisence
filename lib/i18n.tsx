'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { appConfig } from '@/config/app';

// Dil kodları
type LanguageCode = 'tr' | 'en' | 'ru';

// Çeviri tipleri
interface Translations {
  [key: string]: any;
}

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Çevirileri import et
import trTranslations from '@/locales/tr.json';
import enTranslations from '@/locales/en.json';
import ruTranslations from '@/locales/ru.json';

const translationsMap: Record<LanguageCode, Translations> = {
  tr: trTranslations,
  en: enTranslations,
  ru: ruTranslations,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(appConfig.defaultLanguage as LanguageCode);
  const [translations, setTranslations] = useState<Translations>(translationsMap[appConfig.defaultLanguage as LanguageCode]);

  // LocalStorage'dan dil tercihini al
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as LanguageCode;
    if (savedLang && ['tr', 'en', 'ru'].includes(savedLang)) {
      setLanguageState(savedLang);
      setTranslations(translationsMap[savedLang]);
    }
  }, []);

  // Dil değiştiğinde LocalStorage'a kaydet
  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    setTranslations(translationsMap[lang]);
    localStorage.setItem('language', lang);
  };

  // Çeviri fonksiyonu - nested key desteği (örn: "sidebar.dashboard")
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Key bulunamazsa key'i döndür
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation, LanguageProvider içinde kullanılmalıdır');
  }
  return context;
}

