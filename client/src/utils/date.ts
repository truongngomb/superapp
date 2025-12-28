/**
 * Date Formatting Utilities
 * Consistent date formatting across the app
 */

// ============================================================================
// Formatters
// ============================================================================

/**
 * Format date to locale string
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleDateString('vi-VN', {
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
  
  return d.toLocaleDateString('vi-VN', {
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
  
  return d.toLocaleTimeString('vi-VN', {
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
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < MINUTE) {
    return 'Vừa xong';
  }
  
  if (diffInSeconds < HOUR) {
    const minutes = Math.floor(diffInSeconds / MINUTE);
    return `${String(minutes)} phút trước`;
  }
  
  if (diffInSeconds < DAY) {
    const hours = Math.floor(diffInSeconds / HOUR);
    return `${String(hours)} giờ trước`;
  }
  
  if (diffInSeconds < WEEK) {
    const days = Math.floor(diffInSeconds / DAY);
    return `${String(days)} ngày trước`;
  }
  
  if (diffInSeconds < MONTH) {
    const weeks = Math.floor(diffInSeconds / WEEK);
    return `${String(weeks)} tuần trước`;
  }
  
  if (diffInSeconds < YEAR) {
    const months = Math.floor(diffInSeconds / MONTH);
    return `${String(months)} tháng trước`;
  }
  
  const years = Math.floor(diffInSeconds / YEAR);
  return `${String(years)} năm trước`;
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
