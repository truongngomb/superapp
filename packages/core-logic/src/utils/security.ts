/**
 * Security Utilities
 */

/**
 * Sanitize input for PocketBase filter to prevent filter injection
 * Escapes special characters that could break filter syntax
 * 
 * @param input - User input to sanitize
 * @returns Sanitized string safe for use in PocketBase filters
 */
export const sanitizePocketBaseFilter = (input: string): string => {
  if (!input) return '';

  // Escape backslashes first, then double quotes
  // Remove or escape PocketBase filter operators
  return input
    .replace(/\\/g, '\\\\')        // Escape backslashes
    .replace(/"/g, '\\"')           // Escape double quotes
    .replace(/\|\|/g, '')           // Remove OR operators
    .replace(/&&/g, '')             // Remove AND operators
    .replace(/~/g, '')              // Remove LIKE operators
    .replace(/!=/g, '')             // Remove not-equal operators
    .replace(/[<>]/g, '');          // Remove comparison operators
};
