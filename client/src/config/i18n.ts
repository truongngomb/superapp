/**
 * i18n Configuration
 * 
 * Configures internationalization using i18next.
 * Handles language detection and loading translations.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files - English
import commonEn from '../locales/en/common.json';
import homeEn from '../locales/en/home.json';
import authEn from '../locales/en/auth.json';
import categoriesEn from '../locales/en/categories.json';
import rolesEn from '../locales/en/roles.json';

// Import translation files - Vietnamese
import commonVi from '../locales/vi/common.json';
import homeVi from '../locales/vi/home.json';
import authVi from '../locales/vi/auth.json';
import categoriesVi from '../locales/vi/categories.json';
import rolesVi from '../locales/vi/roles.json';

// Import translation files - Korean
import commonKo from '../locales/ko/common.json';
import homeKo from '../locales/ko/home.json';
import authKo from '../locales/ko/auth.json';
import categoriesKo from '../locales/ko/categories.json';
import rolesKo from '../locales/ko/roles.json';

// Configure resources
export const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    auth: authEn,
    categories: categoriesEn,
    roles: rolesEn,
  },
  vi: {
    common: commonVi,
    home: homeVi,
    auth: authVi,
    categories: categoriesVi,
    roles: rolesVi,
  },
  ko: {
    common: commonKo,
    home: homeKo,
    auth: authKo,
    categories: categoriesKo,
    roles: rolesKo,
  },
} as const;

// Configure resources
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: typeof resources['en'];
  }
}

// Initialize i18next
void i18n
  // Detect language from browser
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    ns: ['common', 'home', 'auth', 'categories', 'roles'],
    fallbackLng: 'en', // Default language if detection fails
    supportedLngs: ['en', 'vi', 'ko'],
    
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

