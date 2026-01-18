/**
 * Markdown Pages Collection
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { 
  autodateField, 
  boolField, 
  textField, 
  editorField,
  fileField,
  relationField,
  numberField,
  dateField,
  uniqueIndex
} from '../collection.schema.js';

export const markdownPagesCollection: BaseCollectionSchema = {
  name: 'markdown_pages',
  type: 'base',

  fields: [
    textField('title', { required: true }),
    textField('menuTitle'),
    boolField('isTitle'),
    textField('slug', { required: true, pattern: '^[a-z0-9-]+$' }),
    editorField('content'),
    textField('excerpt'),
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
    uniqueIndex('markdown_pages', 'slug'),
  ],

  listRule: null,
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,
};
