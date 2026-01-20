/**
 * Markdown Pages Service
 * Handles all markdown page-related business logic with I18n support
 */
import { BaseService } from './base.service.js';
import type { MinimalEntity } from '../types/index.js';
import type { 
  MarkdownPage, 
  MarkdownMenuItem,
  MarkdownPageTranslation 
} from '@superapp/shared-types';

export class MarkdownService extends BaseService<MarkdownPage> {
  protected readonly collectionName = 'markdown_pages';
  protected readonly cacheKey = 'markdown:pages';

  async update(id: string, input: Partial<Omit<MarkdownPage, keyof MinimalEntity>> | FormData, actorId?: string, skipLog = false): Promise<MarkdownPage> {
    // Handle FormData (multipart/form-data)
    if (input instanceof FormData) {
      // If coverImage is an existing URL string, remove it so we don't overwrite the file with a string
      // PocketBase expects file object, null, or empty string (to delete)
      const coverImage = input.get('coverImage');
      if (typeof coverImage === 'string' && (coverImage.startsWith('http://') || coverImage.startsWith('https://'))) {
        input.delete('coverImage');
      }

      const icon = input.get('icon');
      if (typeof icon === 'string' && (icon.startsWith('http://') || icon.startsWith('https://'))) {
        input.delete('icon');
      }

      // Pass FormData directly to base service (PocketBase SDK supports FormData)
      // We cast to unknown first to bypass type mismatch, as BaseService definition 
      // is stricter than the actual underlying PocketBase SDK capabilities.
      return super.update(
        id, 
        input as unknown as Partial<Omit<MarkdownPage, keyof MinimalEntity>>, 
        actorId, 
        skipLog
      );
    }

    // Handle normal JSON object
    const sanitizedInput = { ...input };
    
    // If coverImage is a URL (string) and not a file object or empty string, remove it
    // PocketBase expects file object, null, or empty string (to delete)
    if (typeof sanitizedInput.coverImage === 'string' && 
        (sanitizedInput.coverImage.startsWith('http://') || sanitizedInput.coverImage.startsWith('https://'))) {
      delete sanitizedInput.coverImage;
    }

    // Same for icon
    if (typeof sanitizedInput.icon === 'string' && 
       (sanitizedInput.icon.startsWith('http://') || sanitizedInput.icon.startsWith('https://'))) {
      delete sanitizedInput.icon;
    }

    return super.update(id, sanitizedInput, actorId, skipLog);
  }

  protected mapRecord(record: Record<string, unknown>): MarkdownPage {
    // Parse translations safely
    let translations: Record<string, MarkdownPageTranslation> = {};
    if (record['translations']) {
      const rawTranslations = record['translations'];
      translations = typeof rawTranslations === 'string' 
        ? (JSON.parse(rawTranslations) as Record<string, MarkdownPageTranslation>)
        : (rawTranslations as Record<string, MarkdownPageTranslation>);
    }

    // Auto-detect default language if not set
    const defaultLanguage = record['defaultLanguage'] 
      ? (record['defaultLanguage'] as 'en' | 'vi' | 'ko')
      : this.detectDefaultLanguage(translations);

    // Build file URL for coverImage if exists
    const coverImage = record['coverImage'] 
      ? this.getFileUrl(
          record['collectionId'] as string || record['collectionName'] as string, 
          record['id'] as string, 
          record['coverImage'] as string
        )
      : undefined;

    return {
      id: record['id'] as string,
      created: record['created'] as string,
      updated: record['updated'] as string,
      isDeleted: Boolean(record['isDeleted']),
      deletedAt: record['deletedAt'] ? (record['deletedAt'] as string) : null,
      translations,
      defaultLanguage,
      isTitle: Boolean(record['isTitle']),
      icon: record['icon'] ? (record['icon'] as string) : undefined,
      coverImage,
      showInMenu: Boolean(record['showInMenu']),
      parentId: record['parentId'] ? (record['parentId'] as string) : undefined,
      order: Number(record['order'] || 0),
      isPublished: Boolean(record['isPublished']),
      publishedAt: record['publishedAt'] ? (record['publishedAt'] as string) : undefined,
    } as MarkdownPage;
  }

  /**
   * Build file URL for PocketBase files
   */
  private getFileUrl(collectionIdOrName: string, recordId: string, filename: string): string {
    if (!filename) return '';
    
    // If already a full URL, return as-is
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // Build URL manually: {baseUrl}/api/files/{collection}/{recordId}/{filename}
    const baseUrl = this.db.baseUrl;
    return `${baseUrl}/api/files/${collectionIdOrName}/${recordId}/${filename}`;
  }

  /**
   * Get page by slug (public)
   * Searches across all supported languages
   */
  async getBySlug(slug: string): Promise<MarkdownPage | null> {
    try {
      // Search in known languages
      // We ensure slug is unique across languages in validateSlug, so this is safe.
      const filter = `(translations.en.slug = "${slug}" || translations.vi.slug = "${slug}" || translations.ko.slug = "${slug}") && isPublished = true && isDeleted = false`;
      
      const result = await this.collection.getFirstListItem<MarkdownPage>(filter);
      return this.mapRecord(result as unknown as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  /**
   * Get menu tree
   * Returns hierarchical structure of menu items with localized titles
   */
  async getMenuTree(lang = 'en'): Promise<MarkdownMenuItem[]> {
    const pages = await this.collection.getFullList<MarkdownPage>({
      filter: `showInMenu = true && isPublished = true && isDeleted = false`,
      sort: 'order',
    });
    
    return this.buildMenuTree(pages.map(r => this.mapRecord(r as unknown as Record<string, unknown>)), lang);
  }

  /**
   * Build hierarchical menu tree (max 2 levels)
   * @private
   */
  private buildMenuTree(pages: MarkdownPage[], lang: string): MarkdownMenuItem[] {
    const tree: MarkdownMenuItem[] = [];
    const lookup = new Map<string, MarkdownMenuItem>();
    
    // Helper to get translated field with fallback
    // Helper to get translated field with fallback
    const getT = (page: MarkdownPage, field: keyof MarkdownPageTranslation): string => {
      const t = page.translations[lang] || page.translations['en'] || Object.values(page.translations)[0];
      return t?.[field] || '';
    };

    // First pass: create lookup map
    pages.forEach(page => {
      lookup.set(page.id, {
        id: page.id,
        title: getT(page, 'title'),
        menuTitle: getT(page, 'menuTitle'),
        isTitle: page.isTitle,
        slug: getT(page, 'slug'),
        icon: page.icon,
        order: page.order,
        children: [],
        translations: page.translations, // Keep raw for advanced UI usage
      });
    });
    
    // Second pass: build tree
    pages.forEach(page => {
      const item = lookup.get(page.id);
      if (!item) return;

      if (!page.parentId) {
        tree.push(item); // Root level
      } else {
        const parent = lookup.get(page.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(item);
        }
      }
    });
    
    return tree;
  }

  /**
   * Validate menu hierarchy depth (max 2 levels)
   * Throws error if validation fails
   */
  async validateMenuDepth(parentId: string | undefined): Promise<boolean> {
    if (!parentId) return true; // Root level is always valid
    
    // Check if parent exists
    try {
      const parent = await this.getById(parentId);
      
      // Check if parent is already a child (would create level 3)
      if (parent.parentId) {
        throw new Error('Maximum menu depth is 2 levels. Cannot add child to a child page.');
      }
      
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new Error('Parent page not found');
      }
      throw error;
    }
  }

  /**
   * Validate slug uniqueness (before create/update)
   * Check all languages provided in the translations input
   */
  async validateSlug(translations: Record<string, MarkdownPageTranslation>, excludeId?: string): Promise<boolean> {
    // Check reserved slugs first
    for (const lang in translations) {
      if (translations[lang] && this.isReservedSlug(translations[lang].slug)) {
        throw new Error(`Slug "${translations[lang].slug}" is reserved.`);
      }
    }

    // Build filter to check existence
    // We need to check if ANY of the new slugs exist in the DB for that specific language
    const conditions: string[] = [];
    
    for (const [lang, t] of Object.entries(translations)) {
      if (t.slug) {
         // translations.en.slug = "my-slug"
         conditions.push(`translations.${lang}.slug = "${t.slug}"`);
      }
    }

    if (conditions.length === 0) return true;

    let filter = `(${conditions.join(' || ')})`;
    if (excludeId) {
      filter += ` && id != "${excludeId}"`;
    }

    const existing = await this.collection.getList(1, 1, { filter });
    return existing.totalItems === 0;
  }

  /**
   * Auto-detect default language (first language with valid title + slug)
   * @private
   */
  private detectDefaultLanguage(
    translations: Record<string, MarkdownPageTranslation>
  ): 'en' | 'vi' | 'ko' {
    const langs: Array<'en' | 'vi' | 'ko'> = ['en', 'vi', 'ko'];
    for (const lang of langs) {
      if (translations[lang]?.title && translations[lang].slug) {
        return lang;
      }
    }
    return 'en'; // Fallback to English
  }

  /**
   * Check for protected/reserved slugs
   * These slugs are reserved by the system and cannot be used
   */
  isReservedSlug(slug: string): boolean {
    const RESERVED = [
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
      'home'
    ];
    
    return (
      RESERVED.includes(slug) ||
      slug.startsWith('admin/') ||
      slug.startsWith('api/') ||
      slug.startsWith('auth/')
    );
  }
}

export const markdownService = new MarkdownService();
