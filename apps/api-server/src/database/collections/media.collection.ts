/**
 * Media Collection
 * Stores uploaded images/files for Markdown content
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { 
  autodateField, 
  textField, 
  fileField,
} from '../collection.schema.js';

export const mediaCollection: BaseCollectionSchema = {
  name: 'media',
  type: 'base',

  fields: [
    // The actual image file
    fileField('file', { 
      maxSelect: 1, 
      mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
      maxSize: 10485760, // 10MB
      required: true
    }),

    // Accessible description (alt text)
    textField('alt'),

    // Caption for the image
    textField('caption'),

    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),

    // Reference ID (e.g. MarkdownPage ID)
    textField('refId'),

    // Reference Type (e.g. 'markdown_page')
    textField('refType'),
  ],

  indexes: [
    'CREATE INDEX idx_media_ref ON media (refId, refType)',
  ],

  // Publicly readable for serving images
  // Write restricted to authenticated users (admin logic handled in service)
  listRule: '',
  viewRule: '',
  createRule: '@request.auth.id != ""', 
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
};
