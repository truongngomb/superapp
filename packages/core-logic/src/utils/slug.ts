/**
 * Slug generation and validation utilities
 * For creating URL-friendly strings from text
 */

/**
 * Generate URL-friendly slug from text
 * @param text Input text to convert
 * @returns URL-safe slug string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');      // Trim hyphens from start/end
}

/**
 * Validate slug format
 * @param slug Slug to validate
 * @returns true if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

/**
 * Reserved slugs (system routes)
 */
export const RESERVED_SLUGS = [
  'admin',
  'auth',
  'api',
  'settings',
  'users',
  'roles',
  'categories',
  'markdown-pages',
  'login',
  'register',
  'logout',
  'profile',
  'dashboard',
  'home',
] as const;

/**
 * Check if slug is reserved
 * @param slug Slug to check
 * @returns true if slug is reserved
 */
export function isReservedSlug(slug: string): boolean {
  return (
    (RESERVED_SLUGS as readonly string[]).includes(slug) ||
    slug.startsWith('admin/') ||
    slug.startsWith('api/') ||
    slug.startsWith('auth/')
  );
}

/**
 * Suggest alternative slug if reserved or invalid
 * @param text Original text
 * @param suffix Optional suffix to append
 * @returns Alternative slug suggestion
 */
export function suggestSlug(text: string, suffix?: string): string {
  let slug = generateSlug(text);
  
  if (suffix) {
    slug = `${slug}-${suffix}`;
  }
  
  // If still reserved, add timestamp
  if (isReservedSlug(slug)) {
    slug = `${slug}-${Date.now().toString()}`;
  }
  
  return slug;
}
