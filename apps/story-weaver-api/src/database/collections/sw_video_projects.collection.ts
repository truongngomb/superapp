import {
  BaseCollectionSchema,
  textField,
  selectField,
  jsonField,
  relationField,
  numberField,
  boolField,
  autodateField,
  editorField,
  index
} from '../collection.schema.js';

/**
 * Aspect ratio options for video projects
 */
export const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:5'] as const;

/**
 * Target platforms for video export
 */
export const TARGET_PLATFORMS = ['tiktok', 'youtube_shorts', 'instagram_reels', 'youtube', 'custom'] as const;

/**
 * Workflow phases for AI video generation
 * - initiation: Project setup with story content
 * - characters: Character extraction and portrait generation
 * - scripting: Script generation and validation
 * - visualization: Image prompt and keyframe generation
 * - motion: Video clip generation (image-to-video)
 * - rendering: Final video assembly
 */
export const WORKFLOW_PHASES = [
  'initiation',
  'characters',
  'scripting',
  'visualization',
  'motion',
  'rendering',
] as const;

export const swVideoProjectsCollection: BaseCollectionSchema = {
  name: 'sw_video_projects',
  type: 'base',
  fields: [
    // Basic Info
    textField('name', { required: true }),
    textField('description'),
    selectField('status', ['draft', 'generating', 'rendering', 'completed', 'error'], { required: true, maxSelect: 1 }),
    jsonField('settings'),

    // Story Content (NEW - Phase 1)
    editorField('story_content', { maxSize: 50000 }), // Rich text story input

    // Video Settings (NEW - Phase 1)
    selectField('aspect_ratio', [...ASPECT_RATIOS], { maxSelect: 1 }),
    selectField('target_platform', [...TARGET_PLATFORMS], { maxSelect: 1 }),
    numberField('target_duration', { min: 5, max: 600 }), // Target video duration in seconds

    // Workflow Phase (NEW - Phase 1)
    selectField('current_phase', [...WORKFLOW_PHASES], { maxSelect: 1 }),

    // Relations
    relationField('user_id', 'users', { required: true, cascadeDelete: false, maxSelect: 1, displayFields: ['id', 'email'] }),

    // Flags
    boolField('isActive'), 
    boolField('isDeleted'),

    // Timestamps
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],
  indexes: [
    index('sw_video_projects', 'user_id'),
    index('sw_video_projects', 'status'),
    index('sw_video_projects', 'current_phase'),
  ],
  listRule: '@request.auth.id != "" && (isDeleted = false || user_id = @request.auth.id)',
  viewRule: '@request.auth.id != "" && (isDeleted = false || user_id = @request.auth.id)',
  createRule: '@request.auth.id != ""',
  updateRule: 'user_id = @request.auth.id',
  deleteRule: 'user_id = @request.auth.id',
};
