'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from '@/locales/en.json';
import esTranslations from '@/locales/es.json';
import ruTranslations from '@/locales/ru.json';

const resources = {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
  ru: { translation: ruTranslations },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

type I18nContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string) => string;
  isLoaded: boolean;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n: i18nInstance } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (i18nInstance.isInitialized) {
      setIsLoaded(true);
    }
  }, [i18nInstance.isInitialized]);
  
  const changeLanguage = useCallback((lang: string) => {
    i18nInstance.changeLanguage(lang);
  }, [i18nInstance]);

  const value = {
    language: i18nInstance.language,
    changeLanguage,
    t,
    isLoaded,
  };
  
  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
