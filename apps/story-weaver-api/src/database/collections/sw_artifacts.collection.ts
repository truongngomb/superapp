/**
 * Artifacts Collection (sw_artifacts)
 *
 * Stores versioned artifacts for the AI video generation workflow.
 * Artifacts can be character descriptions, portraits, scripts, prompts, keyframes, video clips, or voice files.
 * Supports versioning with parent-child relationships for branching.
 */
import {
  BaseCollectionSchema,
  textField,
  selectField,
  jsonField,
  relationField,
  numberField,
  boolField,
  autodateField,
  index,
  compositeIndex
} from '../collection.schema.js';

/**
 * Artifact types
 * - character_desc: Character description text
 * - master_portrait: Selected master portrait for a character
 * - script: Scene script/kịch bản
 * - prompt: AI prompt for image generation
 * - keyframe: Generated image for a scene
 * - video_clip: Generated video clip
 * - voice: TTS audio file
 */
export const ARTIFACT_TYPES = [
  'character_desc',
  'master_portrait',
  'script',
  'prompt',
  'keyframe',
  'video_clip',
  'voice',
] as const;

/**
 * Artifact status
 * - draft: Initial state, can be modified
 * - approved: User approved, ready for next phase
 * - locked: Final version, cannot be modified
 */
export const ARTIFACT_STATUSES = ['draft', 'approved', 'locked'] as const;

export const swArtifactsCollection: BaseCollectionSchema = {
  name: 'sw_artifacts',
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

    // Artifact Type
    selectField('type', [...ARTIFACT_TYPES], { required: true, maxSelect: 1 }),

    // Entity Reference (e.g., character_id, scene_id)
    textField('entityId'),
    textField('entityType'), // 'character' | 'scene' | 'project'

    // Versioning
    numberField('version', { required: true, min: 1, noDecimal: true }),
    selectField('status', [...ARTIFACT_STATUSES], { required: true, maxSelect: 1 }),
    relationField('parentArtifactId', 'sw_artifacts', {
      cascadeDelete: false,
      maxSelect: 1,
    }),

    // Data payload (flexible JSON for different artifact types)
    // Examples:
    // - character_desc: { text: string, aiGenerated: boolean }
    // - master_portrait: { url: string, prompt: string }
    // - script: { scenes: SceneScript[] }
    // - prompt: { text: string, characterRefs: string[] }
    // - keyframe: { url: string, prompt: string, index: number }
    // - video_clip: { url: string, duration: number }
    // - voice: { url: string, text: string, duration: number }
    jsonField('data', { required: true }),

    // Metadata
    boolField('isDeleted'),

    // Timestamps
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],
  indexes: [
    index('sw_artifacts', 'projectId'),
    index('sw_artifacts', 'userId'),
    index('sw_artifacts', 'type'),
    index('sw_artifacts', 'entityId'),
    compositeIndex('sw_artifacts', ['projectId', 'type']),
    compositeIndex('sw_artifacts', ['entityId', 'entityType', 'type']),
  ],
  // Rules: User can only access their own artifacts
  listRule: '@request.auth.id != "" && userId = @request.auth.id',
  viewRule: '@request.auth.id != "" && userId = @request.auth.id',
  createRule: '@request.auth.id != ""',
  updateRule: 'userId = @request.auth.id && status != "locked"',
  deleteRule: 'userId = @request.auth.id && status != "locked"',
};
