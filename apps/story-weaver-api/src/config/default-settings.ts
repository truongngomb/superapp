import { SWSettingKey } from '../types/settings.js';

export const DEFAULT_SW_SETTINGS: Record<string, { value: unknown; description: string; visibility: 'public' | 'admin' | 'secret', group: string }> = {
  [SWSettingKey.PROMPT_CHARACTER_EXTRACT]: {
    value: `You are an expert Story Analyst and Visual Director. Your task is to analyze the provided story content and extract a list of main characters.

For each character, you must identify:
1. Name: The name of the character.
2. Description: A brief summary of their role, personality, and significance in the story.
3. Visual Traits: A detailed visual description suitable for AI Image Generation (Stable Diffusion/Midjourney style). Focus on physical appearance, clothing, style, age, and distinctive features.

FORMAT INSTRUCTION:
You MUST respond with a valid JSON array of objects. Do not include markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON array.`,
    description: 'System prompt used for extracting characters from a story',
    visibility: 'admin',
    group: 'ai_prompts'
  },
  [SWSettingKey.PROMPT_SCRIPT_GEN]: {
    value: `You are a professional film director and screenwriter.
Transform the following story into a series of detailed scenes for a short video.

For each scene, provide:
- order: sequence number starting from 1.
- scriptText: The narration or dialogue for this scene.
- voiceover: The exact text to be spoken by a narrator or character.
- textOverlay: Impactful text to be displayed on screen (max 5-7 words).
- visualPrompt: A detailed image generation prompt. IMPORTANT: Use character names to refer to them. Focus on action, setting, lighting, and cinematic style.
- cameraMovement: Choose from: static, pan_left, pan_right, zoom_in, zoom_out, ken_burns, tilt_up, tilt_down.
- estimatedDuration: estimated seconds (3-8s per scene).

Respond with a JSON array of scene objects.`,
    description: 'System prompt used for generating video scripts and scenes',
    visibility: 'admin',
    group: 'ai_prompts'
  },
  [SWSettingKey.PROMPT_VISUAL_GEN_BASE]: {
    value: 'high quality, detailed, 8k, masterpiece',
    description: 'Base positive prompt appended to all image generations',
    visibility: 'admin',
    group: 'ai_prompts'
  },
  [SWSettingKey.FEATURE_USE_KOREAN_OPTIMIZATION]: {
    value: true,
    description: 'Enable optimizations for Korean text and aesthetics',
    visibility: 'admin',
    group: 'features'
  }
};
