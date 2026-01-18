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
  if (!text) return '';
  
  let slug = text.toLowerCase().normalize('NFD');

  // Handle Korean Hangul decomposition
  // Replace Jamo characters with their Latin equivalents
  // Note: normalization decomposes Hangul syllables into Jamo (U+1100–U+11FF)
  // We need to map those specific Jamo code points if strict, or use the char directly if simple.
  // Standard NFD produces: U+1100 to U+11FF ranges.
  
  // Simple replacement loop for Korean characters if detected
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) {
    // Custom replacer for Jamo
    // Since NFD decomposes to Conjoining Jamo, we map those.
    // However, the JAMO_MAP above uses Compatibility Jamo (U+3131). 
    // We need to be careful. Let's rely on a robust regex approach for common Jamo.
    // Actually, for a lightweight solution without a huge map, it's safer to rely on manual or a library.
    // But since the user asked, let's try a best-effort mapping for standard Conjoining Jamo.
    
    const CONJOINING_JAMO_MAP: Record<number, string> = {
      // Cho
      0x1100: 'g', 0x1101: 'kk', 0x1102: 'n', 0x1103: 'd', 0x1104: 'tt', 0x1105: 'r', 0x1106: 'm', 0x1107: 'b', 0x1108: 'pp', 0x1109: 's', 0x110a: 'ss', 0x110b: '', 0x110c: 'j', 0x110d: 'jj', 0x110e: 'ch', 0x110f: 'k', 0x1110: 't', 0x1111: 'p', 0x1112: 'h',
      // Jung
      0x1161: 'a', 0x1162: 'ae', 0x1163: 'ya', 0x1164: 'yae', 0x1165: 'eo', 0x1166: 'e', 0x1167: 'ye', 0x1168: 'ye', 0x1169: 'o', 0x116a: 'wa', 0x116b: 'wae', 0x116c: 'oe', 0x116d: 'yo', 0x116e: 'u', 0x116f: 'wo', 0x1170: 'we', 0x1171: 'wi', 0x1172: 'yu', 0x1173: 'eu', 0x1174: 'ui', 0x1175: 'i',
      // Jong (Partial list, maps to simple)
      0x11a8: 'k', 0x11a9: 'kk', 0x11aa: 'ks', 0x11ab: 'n', 0x11ac: 'nj', 0x11ad: 'nh', 0x11ae: 't', 0x11af: 'l', 0x11b0: 'lg', 0x11b1: 'lm', 0x11b2: 'lb', 0x11b3: 'ls', 0x11b4: 'lt', 0x11b5: 'lp', 0x11b6: 'lh', 0x11b7: 'm', 0x11b8: 'p', 0x11b9: 'bs', 0x11ba: 's', 0x11bb: 'ss', 0x11bc: 'ng', 0x11bd: 'j', 0x11be: 'ch', 0x11bf: 'k', 0x11c0: 't', 0x11c1: 'p', 0x11c2: 'h'
    };

    slug = slug.replace(/[\u1100-\u11ff]/g, (char) => {
      const code = char.charCodeAt(0);
      return CONJOINING_JAMO_MAP[code] || '';
    });
  }

  return slug
    .replace(/[\u0300-\u036f]/g, '')  // Remove combining diacritical marks
    .replace(/đ/g, 'd')               // Handle specific Vietnamese character 'đ'
    .replace(/[^a-z0-9\s-]/g, '')     // Remove anything that isn't Latin, number, space, or hyphen
    .trim()
    .replace(/\s+/g, '-')             // Replace spaces with single hyphen
    .replace(/-+/g, '-')              // Remove consecutive hyphens
    .replace(/^-+|-+$/g, '');         // Trim hyphens from start/end
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
