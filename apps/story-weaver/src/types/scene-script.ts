import { z } from 'zod';

// =============================================================================
// Scene Status (Extended for AI Workflow)
// =============================================================================

export const SCENE_STATUS = {
  DRAFT: 'draft',
  PROMPT_READY: 'prompt_ready',
  VISUAL_READY: 'visual_ready',
  VIDEO_READY: 'video_ready',
} as const;

export type SceneStatus = (typeof SCENE_STATUS)[keyof typeof SCENE_STATUS];

export const sceneStatusSchema = z.enum([
  SCENE_STATUS.DRAFT,
  SCENE_STATUS.PROMPT_READY,
  SCENE_STATUS.VISUAL_READY,
  SCENE_STATUS.VIDEO_READY,
]);

// =============================================================================
// Camera Movement Options
// =============================================================================

export const CAMERA_MOVEMENT = {
  STATIC: 'static',
  ZOOM_IN: 'zoom_in',
  ZOOM_OUT: 'zoom_out',
  PAN_LEFT: 'pan_left',
  PAN_RIGHT: 'pan_right',
  TILT_UP: 'tilt_up',
  TILT_DOWN: 'tilt_down',
  KEN_BURNS: 'ken_burns',
} as const;

export type CameraMovement = (typeof CAMERA_MOVEMENT)[keyof typeof CAMERA_MOVEMENT];

export const cameraMovementSchema = z.enum([
  CAMERA_MOVEMENT.STATIC,
  CAMERA_MOVEMENT.ZOOM_IN,
  CAMERA_MOVEMENT.ZOOM_OUT,
  CAMERA_MOVEMENT.PAN_LEFT,
  CAMERA_MOVEMENT.PAN_RIGHT,
  CAMERA_MOVEMENT.TILT_UP,
  CAMERA_MOVEMENT.TILT_DOWN,
  CAMERA_MOVEMENT.KEN_BURNS,
]);

// =============================================================================
// Keyframe Option (4 images per scene)
// =============================================================================

export const keyframeOptionSchema = z.object({
  id: z.string(),
  url: z.url(),
  prompt: z.string(),
  seed: z.number().optional(),
  generatedAt: z.iso.datetime(),
});

export type KeyframeOption = z.infer<typeof keyframeOptionSchema>;

// =============================================================================
// Extended Scene Schema (for AI Video)
// =============================================================================

export const extendedSceneSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  order: z.number(),
  
  // Script fields
  /** Visual description for image generation */
  visualDescription: z.string().optional(),
  /** Voiceover/narration text */
  voiceover: z.string().optional(),
  /** Text overlay to display on screen */
  textOverlay: z.string().optional(),
  /** Estimated duration in seconds */
  estimatedDuration: z.number().min(0).optional(),
  /** Camera movement type */
  cameraMovement: cameraMovementSchema.optional(),
  
  // Character references
  /** Character IDs appearing in this scene */
  characterIds: z.array(z.string()).optional(),
  
  // Image Generation
  /** Generated image prompt (with character injection) */
  imagePrompt: z.string().optional(),
  /** 4 keyframe options from AI */
  keyframeOptions: z.array(keyframeOptionSchema).optional(),
  /** Selected keyframe URL */
  selectedKeyframe: z.url().optional(),
  
  // Video Generation
  /** Generated video clip URL (optional) */
  videoClipUrl: z.url().optional(),
  
  // Voice Generation
  /** Generated voice audio URL */
  voiceAudioUrl: z.url().optional(),
  
  // Status tracking
  status: sceneStatusSchema,
  
  // Legacy fields (from existing video-scene.ts)
  scriptText: z.string().optional(),
  visualPrompt: z.string().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  duration: z.number().optional(),
  transition: z.string().optional(),
  
  // BaseEntity fields
  created: z.string(),
  updated: z.string(),
  isActive: z.boolean(),
  isDeleted: z.boolean(),
});

export type ExtendedScene = z.infer<typeof extendedSceneSchema>;

// =============================================================================
// Script Generation Input/Output
// =============================================================================

export const generateAIScriptInputSchema = z.object({
  projectId: z.string(),
  storyContent: z.string().min(10, 'Story content must be at least 10 characters'),
  /** Target duration in seconds (default: 60) */
  targetDuration: z.number().min(15).max(180).default(60),
  /** Number of scenes to generate */
  sceneCount: z.number().min(3).max(20).optional(),
});

export type GenerateAIScriptInput = z.infer<typeof generateAIScriptInputSchema>;

export interface GeneratedScene {
  order: number;
  visualDescription: string;
  voiceover: string;
  textOverlay?: string;
  estimatedDuration: number;
  cameraMovement: CameraMovement;
  /** Character names mentioned in this scene */
  characterNames?: string[];
}

export interface GenerateScriptResponse {
  scenes: GeneratedScene[];
  totalDuration: number;
  /** Raw AI response for debugging */
  rawResponse?: string;
}

// =============================================================================
// Script Validation (BRIEF 4.3)
// =============================================================================

export const VALIDATION_SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export type ValidationSeverity = (typeof VALIDATION_SEVERITY)[keyof typeof VALIDATION_SEVERITY];

export interface ScriptValidationIssue {
  sceneId?: string;
  sceneOrder?: number;
  field: string;
  message: string;
  severity: ValidationSeverity;
  /** Suggested fix from AI */
  suggestion?: string;
}

export interface ScriptValidationResult {
  isValid: boolean;
  issues: ScriptValidationIssue[];
  totalDuration: number;
  targetDuration: number;
}
