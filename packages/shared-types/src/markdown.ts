/**
 * Markdown Pages Types & Schemas
 */
import { z } from 'zod';
import { BaseListParams } from './common.js';

const BaseResourceSchema = z.object({
  id: z.string(),
  created: z.string(),
  updated: z.string(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.string().optional().nullable(),
});

// ============================================================================
// Schemas
// ============================================================================

export const MarkdownPageTranslationSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  content: z.string(),
  excerpt: z.string().max(500).optional(),
  menuTitle: z.string().max(50).optional(), // Override title in menu for this language
});

export const MarkdownPageSchema = BaseResourceSchema.extend({
  translations: z.record(z.string(), MarkdownPageTranslationSchema), // Key is lang code (en, vi, ko)
  defaultLanguage: z.enum(['en', 'vi', 'ko']).optional(), // Primary language for this page
  isTitle: z.boolean().default(false),
  icon: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  showInMenu: z.boolean().default(false),
  parentId: z.string().optional(),
  order: z.number().default(0),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional(),
});

export const MarkdownPageCreateSchema = MarkdownPageSchema.omit({
  id: true,
  created: true,
  updated: true,
  deletedAt: true,
});

export const MarkdownPageUpdateSchema = MarkdownPageCreateSchema.partial();

// Batch Operations
export const BatchDeleteSchema = z.object({
  ids: z.array(z.string()),
});

export const BatchRestoreSchema = z.object({
  ids: z.array(z.string()),
});

export const BatchUpdateStatusSchema = z.object({
  ids: z.array(z.string()),
  isActive: z.boolean(),
});

// ============================================================================
// Types
// ============================================================================

export type SupportedLanguage = 'en' | 'vi' | 'ko';

export type MarkdownPageTranslation = z.infer<typeof MarkdownPageTranslationSchema>;
export type MarkdownPage = z.infer<typeof MarkdownPageSchema>;
export type MarkdownPageCreateInput = z.infer<typeof MarkdownPageCreateSchema>;
export type MarkdownPageUpdateInput = z.infer<typeof MarkdownPageUpdateSchema>;

// Menu Tree Item
export interface MarkdownMenuItem {
  id: string;
  title: string; // Translated title based on current lang
  menuTitle?: string;
  isTitle?: boolean;
  slug: string; // Translated slug
  icon?: string | null;
  order: number;
  children?: MarkdownMenuItem[];
  translations?: Record<string, MarkdownPageTranslation>; // Optional raw translations
}

// List Params
export interface MarkdownPageListParams extends BaseListParams {
  isPublished?: boolean;
  showInMenu?: boolean;
  lang?: string; // Language to filter/return
}

// Paginated Response
export interface PaginatedMarkdownPages {
  items: MarkdownPage[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
