/**
 * i18n Configuration
 * 
 * Configures internationalization using i18next.
 * Handles language detection and loading translations.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { uikitLocales } from '@superapp/ui-kit';

// Import translation files - English
import authEn from '../locales/en/auth.json';
import videoProjectsEn from '../locales/en/video_projects.json';

// Import translation files - Vietnamese
import authVi from '../locales/vi/auth.json';
import videoProjectsVi from '../locales/vi/video_projects.json';

// Import translation files - Korean
import authKo from '../locales/ko/auth.json';
import videoProjectsKo from '../locales/ko/video_projects.json';

// Configure resources
export const resources = {
  en: {
    auth: authEn,
    video_projects: videoProjectsEn,
    uikit: uikitLocales.en,
  },
  vi: {
    auth: authVi,
    video_projects: videoProjectsVi,
    uikit: uikitLocales.vi,
  },
  ko: {
    auth: authKo,
    video_projects: videoProjectsKo,
    uikit: uikitLocales.ko,
  },
} as const;

// Configure resources


// Initialize i18next
void i18n
  // Detect language from browser
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'uikit',
    ns: ['uikit', 'auth', 'video_projects'],

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

// =============================================================================
// Locale Mapping for Intl APIs
// =============================================================================

/**
 * Mapping from i18n language code to Intl locale
 * Used for date/number formatting
 */
export const LANGUAGE_TO_LOCALE: Record<string, string> = {
  en: 'en-US',
  vi: 'vi-VN',
  ko: 'ko-KR',
};

/**
 * Get current locale for Intl APIs
 */
export function getCurrentLocale(): string {
  return LANGUAGE_TO_LOCALE[i18n.language] || 'en-US';
}

export default i18n;

