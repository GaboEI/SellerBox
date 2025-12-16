"use client"

import { I18nextProvider } from "react-i18next"
import i18next from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import enTranslations from "@/locales/en.json"
import esTranslations from "@/locales/es.json"
import ruTranslations from "@/locales/ru.json"

i18next
  .use(LanguageDetector)
  .init({
    fallbackLng: "en",
    resources: {
      en: {
        translation: enTranslations,
      },
      es: {
        translation: esTranslations,
      },
       ru: {
        translation: ruTranslations,
      },
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false, 
    },
  })

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
}
