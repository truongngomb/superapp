/**
 * Validation Utilities
 * Common validation helpers for forms
 */

import type { FieldError, ValidationResult } from '@/types';

// ============================================================================
// Validation Result Factory
// ============================================================================

/**
 * Create a successful validation result
 */
export function validResult(): ValidationResult {
  return { isValid: true, errors: [] };
}

/**
 * Create a failed validation result
 */
export function invalidResult(errors: FieldError[]): ValidationResult {
  return { isValid: false, errors };
}

/**
 * Create a field error
 */
export function fieldError(field: string, message: string, code?: string): FieldError {
  return { field, message, code };
}

// ============================================================================
// String Validators
// ============================================================================

/**
 * Check if string is empty or whitespace only
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Check if string meets minimum length
 */
export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}

/**
 * Check if string is within maximum length
 */
export function maxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Check if string is within length range
 */
export function lengthBetween(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

// ============================================================================
// Format Validators
// ============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+\..+/;
const PHONE_REGEX = /^(\+84|0)\d{9,10}$/;

/**
 * Check if string is valid email
 */
export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/**
 * Check if string is valid URL
 */
export function isUrl(value: string): boolean {
  return URL_REGEX.test(value);
}

/**
 * Check if string is valid Vietnamese phone number
 */
export function isPhone(value: string): boolean {
  return PHONE_REGEX.test(value);
}

// ============================================================================
// Color Validators
// ============================================================================

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Check if string is valid hex color
 */
export function isHexColor(value: string): boolean {
  return HEX_COLOR_REGEX.test(value);
}

// ============================================================================
// Form Validation Helpers
// ============================================================================

interface ValidatorRule<T = string> {
  validate: (value: T) => boolean;
  message: string;
  code?: string;
}

/**
 * Validate a single field with multiple rules
 */
export function validateField<T = string>(
  field: string,
  value: T,
  rules: ValidatorRule<T>[]
): FieldError[] {
  const errors: FieldError[] = [];
  
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(fieldError(field, rule.message, rule.code));
    }
  }
  
  return errors;
}

/**
 * Common validation rules factory
 */
export const rules = {
  required: (message = 'This field is required'): ValidatorRule => ({
    validate: (v) => !isEmpty(v),
    message,
    code: 'REQUIRED',
  }),
  
  email: (message = 'Invalid email format'): ValidatorRule => ({
    validate: isEmail,
    message,
    code: 'INVALID_EMAIL',
  }),
  
  minLength: (min: number, message?: string): ValidatorRule => ({
    validate: (v) => minLength(v, min),
    message: message ?? `Must be at least ${String(min)} characters`,
    code: 'MIN_LENGTH',
  }),
  
  maxLength: (max: number, message?: string): ValidatorRule => ({
    validate: (v) => maxLength(v, max),
    message: message ?? `Must be at most ${String(max)} characters`,
    code: 'MAX_LENGTH',
  }),
  
  hexColor: (message = 'Invalid color format'): ValidatorRule => ({
    validate: isHexColor,
    message,
    code: 'INVALID_COLOR',
  }),
};
