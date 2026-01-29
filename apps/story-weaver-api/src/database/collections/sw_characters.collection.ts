/**
 * Characters Collection (sw_characters)
 *
 * Stores character information for video projects.
 * Each character has a master portrait and can have multiple portrait options.
 */
import {
  BaseCollectionSchema,
  textField,
  selectField,
  jsonField,
  relationField,
  urlField,
  numberField,
  boolField,
  autodateField,
  index,
  compositeIndex
} from '../collection.schema.js';

/**
 * Character status values
 * - draft: Initial state, character being defined
 * - approved: Character finalized with master portrait
 */
export const CHARACTER_STATUSES = ['draft', 'approved'] as const;

export const swCharactersCollection: BaseCollectionSchema = {
  name: 'sw_characters',
  type: 'base',
  fields: [
    // Relations
    relationField('project_id', 'sw_video_projects', {
      required: true,
      cascadeDelete: true,
      maxSelect: 1,
    }),
    relationField('user_id', 'users', {
      required: true,
      cascadeDelete: false,
      maxSelect: 1,
      displayFields: ['id', 'email'],
    }),

    // Character Info
    textField('name', { required: true, max: 200 }),
    textField('description', { max: 2000 }),
    textField('visual_traits', { max: 2000 }), // Physical appearance description for AI

    // Portraits
    urlField('master_portrait_url'), // Selected master portrait
    jsonField('portrait_options'), // Array of 4 AI-generated options: { url: string, prompt: string }[]

    // Metadata
    selectField('status', [...CHARACTER_STATUSES], { required: true, maxSelect: 1 }),
    numberField('version', { min: 1, noDecimal: true }),
    boolField('isDeleted'),

    // Timestamps
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],
  indexes: [
    index('sw_characters', 'project_id'),
    index('sw_characters', 'user_id'),
    compositeIndex('sw_characters', ['project_id', 'status']),
  ],
  // Rules: User can only access their own characters
  listRule: '@request.auth.id != "" && user_id = @request.auth.id',
  viewRule: '@request.auth.id != "" && user_id = @request.auth.id',
  createRule: '@request.auth.id != ""',
  updateRule: 'user_id = @request.auth.id',
  deleteRule: 'user_id = @request.auth.id',
};
