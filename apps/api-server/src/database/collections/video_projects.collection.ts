/**
 * Video Projects Collection
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { autodateField, selectField, textField, jsonField, boolField } from '../collection.schema.js';

export const videoProjectsCollection: BaseCollectionSchema = {
  name: 'video_projects',
  type: 'base',
  fields: [
    textField('name', { required: true }),
    textField('description'),
    selectField('status', ['draft', 'generating', 'rendering', 'completed'], { maxSelect: 1, required: true }),
    jsonField('settings'), // aspect_ratio, style_preset, voice_id
    boolField('isActive'),
    boolField('isDeleted'),
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],
  indexes: [],
  listRule: null, // Admin only for now
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,
};
