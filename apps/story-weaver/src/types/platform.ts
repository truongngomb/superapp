import { z } from 'zod';

// =============================================================================
// Target Platforms
// =============================================================================

export const TARGET_PLATFORM = {
  TIKTOK: 'tiktok',
  YOUTUBE_SHORTS: 'youtube_shorts',
  INSTAGRAM_REELS: 'instagram_reels',
  GENERIC: 'generic',
} as const;

export type TargetPlatform = (typeof TARGET_PLATFORM)[keyof typeof TARGET_PLATFORM];

export const targetPlatformSchema = z.enum([
  TARGET_PLATFORM.TIKTOK,
  TARGET_PLATFORM.YOUTUBE_SHORTS,
  TARGET_PLATFORM.INSTAGRAM_REELS,
  TARGET_PLATFORM.GENERIC,
]);

// =============================================================================
// Aspect Ratios
// =============================================================================

export const ASPECT_RATIO = {
  PORTRAIT_9_16: '9:16',
  LANDSCAPE_16_9: '16:9',
  SQUARE_1_1: '1:1',
} as const;

export type AspectRatio = (typeof ASPECT_RATIO)[keyof typeof ASPECT_RATIO];

export const aspectRatioSchema = z.enum([
  ASPECT_RATIO.PORTRAIT_9_16,
  ASPECT_RATIO.LANDSCAPE_16_9,
  ASPECT_RATIO.SQUARE_1_1,
]);

// =============================================================================
// Platform Constraints (BRIEF 4.6)
// =============================================================================

export interface TextSafeZone {
  /** Top margin percentage (for platform UI elements) */
  top: number;
  /** Bottom margin percentage (for captions/buttons) */
  bottom: number;
  /** Left margin percentage */
  left: number;
  /** Right margin percentage */
  right: number;
}

export interface PlatformConstraints {
  platform: TargetPlatform;
  /** Recommended aspect ratio */
  aspectRatio: AspectRatio;
  /** Maximum video duration in seconds */
  maxDuration: number;
  /** Minimum video duration in seconds */
  minDuration: number;
  /** Safe zone for text overlay */
  textSafeZone: TextSafeZone;
  /** Maximum characters per text overlay line */
  maxTextCharsPerLine: number;
  /** Default subtitle style */
  defaultSubtitleStyle: SubtitleStyle;
  /** Platform-specific notes */
  notes?: string;
}

// =============================================================================
// Subtitle Styles
// =============================================================================

export const SUBTITLE_STYLE = {
  KARAOKE: 'karaoke',
  SENTENCE: 'sentence',
  WORD_BY_WORD: 'word_by_word',
  NONE: 'none',
} as const;

export type SubtitleStyle = (typeof SUBTITLE_STYLE)[keyof typeof SUBTITLE_STYLE];

export const subtitleStyleSchema = z.enum([
  SUBTITLE_STYLE.KARAOKE,
  SUBTITLE_STYLE.SENTENCE,
  SUBTITLE_STYLE.WORD_BY_WORD,
  SUBTITLE_STYLE.NONE,
]);

// =============================================================================
// Platform Presets
// =============================================================================

export const PLATFORM_PRESETS: Record<TargetPlatform, PlatformConstraints> = {
  [TARGET_PLATFORM.TIKTOK]: {
    platform: TARGET_PLATFORM.TIKTOK,
    aspectRatio: ASPECT_RATIO.PORTRAIT_9_16,
    maxDuration: 60,
    minDuration: 15,
    textSafeZone: { top: 15, bottom: 20, left: 5, right: 5 },
    maxTextCharsPerLine: 35,
    defaultSubtitleStyle: SUBTITLE_STYLE.WORD_BY_WORD,
    notes: 'Hook trong 3 giây đầu, nhịp độ nhanh',
  },
  [TARGET_PLATFORM.YOUTUBE_SHORTS]: {
    platform: TARGET_PLATFORM.YOUTUBE_SHORTS,
    aspectRatio: ASPECT_RATIO.PORTRAIT_9_16,
    maxDuration: 60,
    minDuration: 15,
    textSafeZone: { top: 10, bottom: 15, left: 5, right: 5 },
    maxTextCharsPerLine: 40,
    defaultSubtitleStyle: SUBTITLE_STYLE.SENTENCE,
    notes: 'Tối ưu cho mobile viewing',
  },
  [TARGET_PLATFORM.INSTAGRAM_REELS]: {
    platform: TARGET_PLATFORM.INSTAGRAM_REELS,
    aspectRatio: ASPECT_RATIO.PORTRAIT_9_16,
    maxDuration: 90,
    minDuration: 15,
    textSafeZone: { top: 12, bottom: 18, left: 5, right: 5 },
    maxTextCharsPerLine: 35,
    defaultSubtitleStyle: SUBTITLE_STYLE.KARAOKE,
    notes: 'Hỗ trợ audio trending',
  },
  [TARGET_PLATFORM.GENERIC]: {
    platform: TARGET_PLATFORM.GENERIC,
    aspectRatio: ASPECT_RATIO.LANDSCAPE_16_9,
    maxDuration: 180,
    minDuration: 30,
    textSafeZone: { top: 5, bottom: 10, left: 5, right: 5 },
    maxTextCharsPerLine: 50,
    defaultSubtitleStyle: SUBTITLE_STYLE.SENTENCE,
    notes: 'Định dạng video thông thường',
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get platform constraints by platform type
 */
export function getPlatformConstraints(platform: TargetPlatform): PlatformConstraints {
  return PLATFORM_PRESETS[platform];
}

/**
 * Get image dimensions for aspect ratio (base 1080p)
 */
export function getImageDimensions(aspectRatio: AspectRatio): { width: number; height: number } {
  switch (aspectRatio) {
    case ASPECT_RATIO.PORTRAIT_9_16:
      return { width: 1080, height: 1920 };
    case ASPECT_RATIO.LANDSCAPE_16_9:
      return { width: 1920, height: 1080 };
    case ASPECT_RATIO.SQUARE_1_1:
      return { width: 1080, height: 1080 };
  }
}

/**
 * Validate text overlay against platform constraints
 */
export function validateTextOverlay(
  text: string,
  platform: TargetPlatform
): { valid: boolean; message?: string } {
  const constraints = getPlatformConstraints(platform);
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line && line.length > constraints.maxTextCharsPerLine) {
      return {
        valid: false,
        message: `Line ${String(i + 1)} exceeds ${String(constraints.maxTextCharsPerLine)} characters`,
      };
    }
  }
  
  return { valid: true };
}
