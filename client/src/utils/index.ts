/**
 * Utils Module Exports
 */

// Class name utility
export { cn } from './cn';

// Logger
export { logger, type LogLevel } from './logger';

// Storage utilities
export {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  getTheme,
  setTheme,
} from './storage';

// Date utilities
export {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  isToday,
  isPast,
  isFuture,
} from './date';

// Validation utilities
export {
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
} from './validation';

// Eruda debugger
export { initEruda } from './eruda';
