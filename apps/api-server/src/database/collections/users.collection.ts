/**
 * Users Collection
 */
import type { AuthCollectionSchema } from '../collection.schema.js';
import { autodateField, boolField, fileField, relationField, textField } from '../collection.schema.js';

/**
 * Users collection
 */
export const usersCollection: AuthCollectionSchema = {
  name: 'users',
  type: 'auth',

  fields: [
    textField('name', { min: 0, max: 255 }),
    fileField('avatar', { maxSelect: 1 }),
    relationField('roles', 'roles', { maxSelect: 99 }),
    boolField('isActive'),
    boolField('isDeleted'),
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],

  indexes: [
    'CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)',
    'CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != \'\'',
  ],

  listRule: null,
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,

  passwordAuth: {
    enabled: true,
    identityFields: ['email'],
  },

  oauth2: { enabled: true },
};