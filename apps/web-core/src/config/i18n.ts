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
import activityLogsEn from '../locales/en/activity_logs.json';
import apiDocsEn from '../locales/en/api_docs.json';
import authEn from '../locales/en/auth.json';
import categoriesEn from '../locales/en/categories.json';
import homeEn from '../locales/en/home.json';
import markdownEn from '../locales/en/markdown.json';
import rolesEn from '../locales/en/roles.json';
import settingsEn from '../locales/en/settings.json';
import systemHealthEn from '../locales/en/system_health.json';
import usersEn from '../locales/en/users.json';

// Import translation files - Vietnamese
import activityLogsVi from '../locales/vi/activity_logs.json';
import apiDocsVi from '../locales/vi/api_docs.json';
import authVi from '../locales/vi/auth.json';
import categoriesVi from '../locales/vi/categories.json';
import homeVi from '../locales/vi/home.json';
import markdownVi from '../locales/vi/markdown.json';
import rolesVi from '../locales/vi/roles.json';
import settingsVi from '../locales/vi/settings.json';
import systemHealthVi from '../locales/vi/system_health.json';
import usersVi from '../locales/vi/users.json';

// Import translation files - Korean
import activityLogsKo from '../locales/ko/activity_logs.json';
import apiDocsKo from '../locales/ko/api_docs.json';
import authKo from '../locales/ko/auth.json';
import categoriesKo from '../locales/ko/categories.json';
import homeKo from '../locales/ko/home.json';
import markdownKo from '../locales/ko/markdown.json';
import rolesKo from '../locales/ko/roles.json';
import settingsKo from '../locales/ko/settings.json';
import systemHealthKo from '../locales/ko/system_health.json';
import usersKo from '../locales/ko/users.json';

// Configure resources
export const resources = {
  en: {
    home: homeEn,
    auth: authEn,
    categories: categoriesEn,
    roles: rolesEn,
    users: usersEn,
    activity_logs: activityLogsEn,
    settings: settingsEn,
    markdown: markdownEn,
    system_health: systemHealthEn,
    api_docs: apiDocsEn,
    uikit: uikitLocales.en,
  },
  vi: {
    home: homeVi,
    auth: authVi,
    categories: categoriesVi,
    roles: rolesVi,
    users: usersVi,
    activity_logs: activityLogsVi,
    settings: settingsVi,
    markdown: markdownVi,
    system_health: systemHealthVi,
    api_docs: apiDocsVi,
    uikit: uikitLocales.vi,
  },
  ko: {
    home: homeKo,
    auth: authKo,
    categories: categoriesKo,
    roles: rolesKo,
    users: usersKo,
    activity_logs: activityLogsKo,
    settings: settingsKo,
    markdown: markdownKo,
    system_health: systemHealthKo,
    api_docs: apiDocsKo,
    uikit: uikitLocales.ko,
  },
} as const;

// Initialize i18next
void i18n
  // Detect language from browser
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'uikit',
    ns: ['uikit', 'home', 'auth', 'categories', 'roles', 'users', 'activity_logs', 'settings', 'markdown', 'system_health', 'api_docs'],

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

