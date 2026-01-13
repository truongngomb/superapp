/**
 * Settings Collection Definition
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { textField, jsonField, uniqueIndex } from '../collection.schema.js';

export const settingsCollection: BaseCollectionSchema = {
  name: 'settings',
  type: 'base',
  fields: [
    textField('key', { required: true }),
    jsonField('value', { required: true }),
  ],
  indexes: [
    uniqueIndex('settings', 'key'),
  ],
  // Admin only rules
  listRule: null,
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,
};
