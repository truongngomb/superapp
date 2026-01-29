import {
  BaseCollectionSchema,
  relationField,
  numberField,
  textField,
  urlField,
  jsonField,
  selectField,
  boolField,
  autodateField,
  index,
  compositeIndex
} from '../collection.schema.js';

/**
 * Camera movement options for scenes
 */
export const CAMERA_MOVEMENTS = [
  'static',
  'pan_left',
  'pan_right',
  'zoom_in',
  'zoom_out',
  'ken_burns',
  'tilt_up',
  'tilt_down',
] as const;

/**
 * Scene status for workflow progression
 * - draft: Initial state
 * - prompt_ready: Visual prompt generated
 * - visual_ready: Keyframe image selected
 * - video_ready: Video clip generated
 */
export const SCENE_STATUSES = ['draft', 'prompt_ready', 'visual_ready', 'video_ready'] as const;

export const swVideoScenesCollection: BaseCollectionSchema = {
  name: 'sw_video_scenes',
  type: 'base',
  fields: [
    // Relations
    relationField('project_id', 'sw_video_projects', { required: true, cascadeDelete: true, maxSelect: 1 }),
    relationField('character_ids', 'sw_characters', { cascadeDelete: false, maxSelect: 10 }), // Characters in this scene

    // Scene Order & Duration
    numberField('order', { required: true }),
    numberField('estimated_duration', { min: 1, max: 60 }), // Duration in seconds

    // Script Content
    textField('script_text', { max: 2000 }), // Scene narration/script
    textField('voiceover', { max: 2000 }), // Voiceover text (may differ from script)
    textField('text_overlay', { max: 500 }), // On-screen text overlay

    // Visual Generation
    textField('visual_prompt', { max: 2000 }), // AI prompt for image generation
    selectField('camera_movement', [...CAMERA_MOVEMENTS], { maxSelect: 1 }),

    // Keyframe Options (NEW - Phase 1)
    // Array of 4 AI-generated image options: { url: string, prompt: string }[]
    jsonField('keyframe_options'),
    urlField('selected_keyframe'), // User-selected keyframe URL

    // Media URLs
    urlField('image_url'), // Legacy/fallback
    urlField('audio_url'), // Voice audio
    urlField('video_url'), // Final scene video
    urlField('video_clip_url'), // Generated video clip (image-to-video)
    numberField('duration'), // Actual duration after generation

    // Status & Metadata
    selectField('status', [...SCENE_STATUSES], { maxSelect: 1 }),
    jsonField('metadata'),
    boolField('isDeleted'),

    // Timestamps
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],
  indexes: [
    index('sw_video_scenes', 'project_id'),
    index('sw_video_scenes', 'status'),
    compositeIndex('sw_video_scenes', ['project_id', 'order']),
  ],
  listRule: '@request.auth.id != ""',
  viewRule: '@request.auth.id != ""',
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
};
