/**
 * Markdown Pages Collection
 * I18n-ready with nested translations structure
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { 
  autodateField, 
  boolField, 
  textField, 
  fileField,
  relationField,
  numberField,
  dateField,
  jsonField
} from '../collection.schema.js';

export const markdownPagesCollection: BaseCollectionSchema = {
  name: 'markdown_pages',
  type: 'base',

  fields: [
    // I18n: Nested translations object
    // Structure: { en: { title, slug, content, excerpt, menuTitle }, vi: {...}, ko: {...} }
    jsonField('translations', { required: true }),
    
    // Default language for this page (en, vi, ko)
    textField('defaultLanguage'),
    
    // Global settings (not language-specific)
    boolField('isTitle'),
    textField('icon'),
    fileField('coverImage', { 
      maxSelect: 1,
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxSize: 5242880 // 5MB
    }),
    boolField('showInMenu'),
    relationField('parentId', 'markdown_pages', { maxSelect: 1, cascadeDelete: false }),
    numberField('order'),
    boolField('isPublished'),
    dateField('publishedAt'),
    boolField('isDeleted'),
    dateField('deletedAt'),
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],

  indexes: [
    // Note: Cannot create unique index on nested JSON field
    // Slug uniqueness will be validated in service layer
  ],

  listRule: null,
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,
};
