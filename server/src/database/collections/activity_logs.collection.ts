/**
 * Activity_logs Collection
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { autodateField, jsonField, relationField, textField } from '../collection.schema.js';

/**
 * Activity_logs collection
 */
export const activity_logsCollection: BaseCollectionSchema = {
  name: 'activity_logs',
  type: 'base',

  fields: [
    relationField('user', 'users', { maxSelect: 1 }),
    textField('action', { required: true, min: 1, max: 50 }),
    textField('resource', { required: true, min: 1, max: 100 }),
    textField('recordId', { min: 1, max: 50 }),
    textField('message', { required: true, min: 1, max: 500 }),
    jsonField('details'),
    autodateField('created', { onCreate: true, onUpdate: false }),
  ],

  indexes: [
    'CREATE INDEX `idx_activity_logs_created` ON `activity_logs` (`created`)',
    'CREATE INDEX `idx_activity_logs_user` ON `activity_logs` (`user`)',
  ],

  listRule: '@request.auth.roles.name ?= "Admin"',
  viewRule: '@request.auth.roles.name ?= "Admin"',
  createRule: '',
  updateRule: '',
  deleteRule: null,
};