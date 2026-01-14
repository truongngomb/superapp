/**
 * Settings Collection Definition
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { textField, jsonField, selectField, uniqueIndex } from '../collection.schema.js';

/**
 * Setting visibility levels:
 * - public: Visible to all authenticated users (UI/UX settings like layout, theme)
 * - admin: Visible only to admins (system configuration)
 * - secret: Never exposed via API (API keys, tokens, credentials)
 */
export const settingsCollection: BaseCollectionSchema = {
  name: 'settings',
  type: 'base',
  fields: [
    textField('key', { required: true }),
    jsonField('value', { required: true }),
    selectField('visibility', ['public', 'admin', 'secret'], { required: true }),
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
