/**
 * Date Formatting Utilities
 * Consistent date formatting across the app
 * Uses i18n locale for formatting
 */

import { getCurrentLocale } from '@/config/i18n';
import { enUS, vi, ko } from 'date-fns/locale';
import type { Locale } from 'date-fns';

// ============================================================================
// Formatters
// ============================================================================

/**
 * Get date-fns locale object based on current app locale
 */
export function getDateLocale(localeString?: string): Locale {
  const current = localeString || getCurrentLocale();
  switch (current) {
    case 'vi': return vi;
    case 'ko': return ko;
    default: return enUS;
  }
}

/**
 * Format date to locale string
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString(getCurrentLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format date with time
 */
export function formatDateTime(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString(getCurrentLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format time only
 */
export function formatTime(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleTimeString(getCurrentLocale(), {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

// ============================================================================
// Relative Time
// ============================================================================

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

/**
 * Format date as relative time (e.g., "2 hours ago")
 * Uses Intl.RelativeTimeFormat for localized output
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(getCurrentLocale(), { numeric: 'auto' });

  if (diffInSeconds < MINUTE) {
    return rtf.format(-diffInSeconds, 'second');
  }
  
  if (diffInSeconds < HOUR) {
    const minutes = Math.floor(diffInSeconds / MINUTE);
    return rtf.format(-minutes, 'minute');
  }
  
  if (diffInSeconds < DAY) {
    const hours = Math.floor(diffInSeconds / HOUR);
    return rtf.format(-hours, 'hour');
  }
  
  if (diffInSeconds < WEEK) {
    const days = Math.floor(diffInSeconds / DAY);
    return rtf.format(-days, 'day');
  }
  
  if (diffInSeconds < MONTH) {
    const weeks = Math.floor(diffInSeconds / WEEK);
    return rtf.format(-weeks, 'week');
  }
  
  if (diffInSeconds < YEAR) {
    const months = Math.floor(diffInSeconds / MONTH);
    return rtf.format(-months, 'month');
  }
  
  const years = Math.floor(diffInSeconds / YEAR);
  return rtf.format(-years, 'year');
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the past
 */
export function isPast(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > new Date();
}
