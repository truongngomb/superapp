/**
 * i18n Configuration
 * 
 * Configures internationalization using i18next.
 * Handles language detection and loading translations.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from '../locales/en/translation.json';
import viTranslation from '../locales/vi/translation.json';

// Configure resources
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof enTranslation;
    };
  }
}

// Configure resources
const resources = {
  en: {
    translation: enTranslation as Record<string, unknown>,
  },
  vi: {
    translation: viTranslation as Record<string, unknown>,
  },
};

// Initialize i18next
void i18n
  // Detect language from browser
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Default language if detection fails
    supportedLngs: ['en', 'vi'],
    
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Key for storing language in local storage
      lookupLocalStorage: 'i18nextLng',
      // Cache user language in local storage
      caches: ['localStorage'],
    },
  });

export default i18n;
