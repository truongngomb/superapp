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
  fileField,
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
    relationField('projectId', 'sw_video_projects', {
      required: true,
      cascadeDelete: true,
      maxSelect: 1,
    }),
    relationField('userId', 'users', {
      required: true,
      cascadeDelete: false,
      maxSelect: 1,
      displayFields: ['id', 'email'],
    }),

    // Character Info
    textField('name', { required: true, max: 200 }),
    textField('description', { max: 2000 }),
    textField('visualTraits', { max: 2000 }), // Physical appearance description for AI

    // Portraits
    fileField('masterPortrait', { maxSelect: 1, mimeTypes: ['image/*'] }), // Selected master portrait file
    jsonField('portraitOptions'), // Array of 4 AI-generated options: { url: string, prompt: string }[]

    // Metadata
    selectField('status', [...CHARACTER_STATUSES], { required: true, maxSelect: 1 }),
    numberField('version', { min: 1, noDecimal: true }),
    boolField('isActive'),
    boolField('isDeleted'),

    // Timestamps
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],
  indexes: [
    index('sw_characters', 'projectId'),
    index('sw_characters', 'userId'),
    compositeIndex('sw_characters', ['projectId', 'status']),
  ],
  // Rules: User can only access their own characters
  listRule: '@request.auth.id != "" && userId = @request.auth.id',
  viewRule: '@request.auth.id != "" && userId = @request.auth.id',
  createRule: '@request.auth.id != ""',
  updateRule: 'userId = @request.auth.id',
  deleteRule: 'userId = @request.auth.id',
};
