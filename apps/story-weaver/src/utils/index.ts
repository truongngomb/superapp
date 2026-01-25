/**
 * Utils Module Exports
 * Re-exports from @superapp/core-logic package
 */

// Re-export all utilities from core-logic package
export {
  // Class name utility
  cn,
  // Logger
  logger,
  type LogLevel,
  // Storage utilities
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  getTheme,
  setTheme,
  // Date utilities
  getDateLocale,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  isToday,
  isPast,
  isFuture,
  // Validation utilities
  isEmpty,
  isEmail,
  isUrl,
  isPhone,
  isHexColor,
  minLength,
  maxLength,
  lengthBetween,
  validateField,
  validResult,
  invalidResult,
  fieldError,
  rules,
  // Eruda debugger
  initEruda,
} from '@superapp/core-logic';
