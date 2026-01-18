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
import usersEn from '../locales/en/users.json';
import activityLogsEn from '../locales/en/activity_logs.json';
import notificationsEn from '../locales/en/notifications.json';
import settingsEn from '../locales/en/settings.json';
import markdownEn from '../locales/en/markdown.json';

// Import translation files - Vietnamese
import commonVi from '../locales/vi/common.json';
import homeVi from '../locales/vi/home.json';
import authVi from '../locales/vi/auth.json';
import categoriesVi from '../locales/vi/categories.json';
import rolesVi from '../locales/vi/roles.json';
import usersVi from '../locales/vi/users.json';
import activityLogsVi from '../locales/vi/activity_logs.json';
import notificationsVi from '../locales/vi/notifications.json';
import settingsVi from '../locales/vi/settings.json';
import markdownVi from '../locales/vi/markdown.json';

// Import translation files - Korean
import commonKo from '../locales/ko/common.json';
import homeKo from '../locales/ko/home.json';
import authKo from '../locales/ko/auth.json';
import categoriesKo from '../locales/ko/categories.json';
import rolesKo from '../locales/ko/roles.json';
import usersKo from '../locales/ko/users.json';
import activityLogsKo from '../locales/ko/activity_logs.json';
import notificationsKo from '../locales/ko/notifications.json';
import settingsKo from '../locales/ko/settings.json';
import markdownKo from '../locales/ko/markdown.json';

// Configure resources
export const resources = {
  en: {
    common: commonEn,
    home: homeEn,
    auth: authEn,
    categories: categoriesEn,
    roles: rolesEn,
    users: usersEn,
    activity_logs: activityLogsEn,
    notifications: notificationsEn,
    settings: settingsEn,
    markdown: markdownEn,
  },
  vi: {
    common: commonVi,
    home: homeVi,
    auth: authVi,
    categories: categoriesVi,
    roles: rolesVi,
    users: usersVi,
    activity_logs: activityLogsVi,
    notifications: notificationsVi,
    settings: settingsVi,
    markdown: markdownVi,
  },
  ko: {
    common: commonKo,
    home: homeKo,
    auth: authKo,
    categories: categoriesKo,
    roles: rolesKo,
    users: usersKo,
    activity_logs: activityLogsKo,
    notifications: notificationsKo,
    settings: settingsKo,
    markdown: markdownKo,
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
    defaultNS: 'common',
    ns: ['common', 'home', 'auth', 'categories', 'roles', 'users', 'activity_logs', 'notifications', 'settings', 'markdown'],

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

